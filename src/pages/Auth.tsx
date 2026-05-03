import React, { useState } from "react";
import { auth, googleProvider } from "@/firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import ECILogo from "@/components/ECILogo";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { updateUserProgress } from "@/services/firebaseService";

type AuthMode = "login" | "signup" | "forgot-password";

export default function Auth() {
  const { t } = useSettings();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password strength logic
  const isStrongPassword = (pass: string) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[^A-Za-z0-9]/.test(pass)
    );
  };

  const validateForm = () => {
    setError(null);
    setSuccess(null);

    if (mode === "signup") {
      if (!name.trim()) return "Full name is required.";
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
        return "A valid email is required.";
      if (!isStrongPassword(password))
        return "Password must be at least 8 characters, with 1 uppercase, 1 number, and 1 special character.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }

    if (mode === "login") {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
        return "A valid email is required.";
      if (!password.trim()) return "Password is required.";
    }

    if (mode === "forgot-password") {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
        return "A valid email is required.";
    }

    return null;
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Wait for AuthStateChanged to pick it up
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCred.user, { displayName: name });
        // Initializing profile done in FirebaseService context or App level if needed
        await updateUserProgress(userCred.user.uid, {
          displayName: name,
          registrationCompleted: false,
          simulationCompleted: false,
          joinedAt: new Date().toISOString(),
        });
      } else if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === "forgot-password") {
        await sendPasswordResetEmail(auth, email);
        setSuccess("Password reset link sent! Check your email.");
        // Don't switch mode immediately so they can read the success message
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use")
        setError("This email is already registered.");
      else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      )
        setError("Invalid email or password.");
      else setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Official Tricolor strip */}
      <div className="absolute top-0 w-full h-1.5 flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[480px] w-full bg-white border border-[#C4CED8] rounded-sm p-8 md:p-10 text-center space-y-6 shadow-xl relative"
      >
        <div className="space-y-4">
          <ECILogo className="mx-auto" size={70} />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-navy uppercase tracking-tight">
              Voters' Service Portal
            </h1>
            <p className="text-[10px] font-black text-government-grey uppercase tracking-[0.2em] border-t border-b border-slate-100 py-2 inline-block">
              Election Commission Pilot Interface
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-sm border border-red-100 flex items-start gap-2 text-left"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-green-50 text-green-700 text-xs font-medium p-3 rounded-sm border border-green-200 flex items-start gap-2 text-left"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{success}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <AnimatePresence mode="popLayout">
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <AnimatePresence mode="popLayout">
            {mode !== "forgot-password" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-navy"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </motion.div>
            )}

            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot-password");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs font-bold text-navy hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white mt-4 py-3 font-bold text-sm tracking-wide flex items-center justify-center gap-2 rounded-sm hover:bg-[#000066] transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === "login" ? (
              "Secure Login"
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {mode !== "forgot-password" && (
          <>
            <div className="relative my-6 flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-widest">
                or
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-slate-200 text-slate-700 py-3 font-semibold text-sm tracking-wide flex items-center justify-center gap-3 rounded-sm hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
            >
              <img
                src="https://www.google.com/favicon.ico"
                className="w-4 h-4"
                alt="Google"
              />
              Continue with Google
            </button>
          </>
        )}

        <div className="pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-3">
          {mode === "login" ? (
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-navy font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          ) : mode === "signup" ? (
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-navy font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          ) : (
            <button
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className="text-xs text-navy font-bold hover:underline"
            >
              Back to Login
            </button>
          )}

          <div className="flex items-center gap-4 opacity-60 mt-4">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#000080]">
              Digital India
            </span>
            <div className="w-1.5 h-1.5 bg-saffron rounded-full" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#000080]">
              Satyamev Jayate
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
