# India Election Companion Assistant

An advanced, AI-powered digital companion designed to bridge the electoral literacy gap in India. This platform serves as a "First-Time Indian Voter Companion," guiding citizens through every phase of the democratic process—from registration to casting their vote.

## 🎯 Challenge Vertical: First-Time Indian Voter Companion Assistant

### Problem Statement
First-time voters in India often face significant hurdles:
- **Complexity**: Confusion regarding Form 6 registration and specific document requirements.
- **Process Anxiety**: Uncertainty about the step-by-step procedure inside a polling booth.
- **Misinformation**: Exposure to myths regarding EVMs, VVPATs, and voting rights.
- **Data Fragmentation**: Difficulty in locating specific constituency and booth details.

### Solution Overview
The **India Election Companion Assistant** addresses these challenges through a centralized, AI-driven experience:
- **AI-Powered Guidance**: A specialized Gemini-based assistant for context-aware civic Q&A.
- **Readiness Scoring**: A dynamic logic engine that evaluates a voter's preparedness based on registration and awareness.
- **Immersive Simulation**: A 3D-styled voting simulator to demystify the booth experience.
- **Constituency Intelligence**: Real-time booth and administrative lookup using PINCODE.
- **Fact-Check Engine**: Proactive detection and clarification of electoral myths.
- **Multilingual Support**: Seamless transitions between English, Hindi, and Telugu.

---

## 🛠 Google Services & Technologies Used

### Core Google Infrastructure
- **Vertex AI Gemini**: Powers the "Electoral Knowledge Engine" for structured, civic-minded responses.
- **Firebase Firestore**: Manages real-time data for timelines, myths, quiz topics, and user progress.
- **Firebase Storage**: Securely handles educational document storage and user profile assets.
- **Google Maps API**: Facilitates polling station visualization and distance calculation.
- **Cloud Run**: Hosts the project's backend API and static frontend assets for scalable performance.
- **Antigravity IDE**: Used for advanced agentic coding and project orchestration.

### Architecture
- **Frontend**: React 19 + Vite + TailwindCSS (Vanilla CSS for premium styling).
- **Backend**: Node.js + Express (running on Cloud Run).
- **Animation**: Motion (framer-motion) for fluid transitions.
- **Icons**: Lucide React.

---

## 🌟 Key Features

1.  **Chat Assistant**: Grounded AI assistant for first-time voters with step-by-step guidance.
2.  **Voting Readiness Analyzer**: Dashboard widget calculating readiness based on docs and registration status.
3.  **Timeline Learning Journey**: Interactive roadmap of the election cycle (Notification to Results).
4.  **Document Center**: Verification guide for required age and residence proofs.
5.  **Myth vs Fact Detector**: A curated interface to clarify electoral misinformation.
6.  **Quiz Engine**: Gamified learning modules with topics on constitutional rights.
7.  **Voting Simulation**: Digital walkthrough of the polling booth (Inking → EVM → VVPAT).
8.  **Constituency Lookup**: Instant identification of Parliamentary and Assembly constituencies.
9.  **Interactive Dashboard**: Centralized hub for tracking voter readiness and news.

---

## 🧠 Decision Logic & Intelligence

### Readiness Scoring Logic
The platform calculates a **"Voter Readiness Score"** out of 100% using the following weights:
- **Registration Status (40%)**: Verified via simulation or registration data.
- **Document Availability (30%)**: Confirmed possession of Age and Address proofs.
- **Booth Awareness (20%)**: Successful lookup of designated polling station.
- **Knowledge Base (10%)**: Completion of basic civic literacy quiz modules.

### Accessibility & Security
- **Civic Workflow Guidance**: Responses are structured with bullet points and clear "Recommended Next Steps."
- **Secure Environment**: All API keys and Firebase credentials are protected via environment variables (`.env`).
- **No Hardcoding**: All AI and Map calls are strictly routed through secure environment hooks.
- **Firestore Security**: Rules applied to ensure user data isolation.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- Firebase Project (with Firestore and Storage enabled)
- Google Gemini API Key

### 2. Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Open .env and add your API keys
```

### 3. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 📋 Assumptions & Authoritative Sources
- **Internet Access**: Required for real-time AI responses and Map services.
- **User Identity**: Users are assumed to possess at least one valid identity document (Aadhaar, Voter ID, etc.).
- **ECI Authority**: All electoral data and rules are modeled after official **Election Commission of India (ECI)** guidelines.

---
*Developed for the Google Gemini Civic Hackathon • Empowering the Indian Voter.*
