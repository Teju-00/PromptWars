import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  deleteField,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '@/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const fetchTimeline = async () => {
  const path = 'timeline';
  try {
    const q = query(collection(db, path), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const fetchQuizQuestions = async () => {
  const path = 'quiz_questions';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const fetchUserProgress = async (userId: string) => {
  const path = `user_progress/${userId}`;
  try {
    const docRef = doc(db, 'user_progress', userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const updateUserProgress = async (userId: string, data: any) => {
  const path = `user_progress/${userId}`;
  try {
    const docRef = doc(db, 'user_progress', userId);
    await setDoc(docRef, { 
      ...data, 
      userId, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchUserDocuments = async (userId: string) => {
  const path = `user_progress/${userId}/documents`;
  try {
    const q = query(collection(db, 'user_progress', userId, 'documents'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const addUserDocument = async (userId: string, docData: any) => {
  const docId = Date.now().toString();
  const path = `user_progress/${userId}/documents/${docId}`;
  try {
    const docRef = doc(db, 'user_progress', userId, 'documents', docId);
    await setDoc(docRef, { ...docData, id: docId });
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteUserDocument = async (userId: string, docId: string) => {
  const path = `user_progress/${userId}/documents/${docId}`;
  try {
    const docRef = doc(db, 'user_progress', userId, 'documents', docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const updateRegistrationData = async (userId: string, data: any) => {
  const path = `user_progress/${userId}/registration/form6`;
  try {
    const docRef = doc(db, 'user_progress', userId, 'registration', 'form6');
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchRegistrationData = async (userId: string) => {
  const path = `user_progress/${userId}/registration/form6`;
  try {
    const docRef = doc(db, 'user_progress', userId, 'registration', 'form6');
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const subscribeToNews = (callback: (news: any[]) => void) => {
  const path = 'news';
  const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Handle timestamp to string conversion if needed
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
    }));
    callback(news);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const fetchQuizTopics = async () => {
  const path = 'quiz_topics';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const fetchRequiredDocumentsList = async () => {
  const path = 'documents_required';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const fetchMythsVsFacts = async () => {
  const path = 'myths_vs_facts';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const fetchConstituencies = async () => {
  const path = 'constituencies';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const fetchNewsById = async (newsId: string) => {
  const path = `news/${newsId}`;
  try {
    const docRef = doc(db, 'news', newsId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const cleanupLargeProgressFields = async (userId: string) => {
  const docRef = doc(db, 'user_progress', userId);
  try {
    await updateDoc(docRef, {
      registrationData: deleteField(),
      documents: deleteField()
    });
  } catch (error) {
    // If fields don't exist or doc doesn't exist, ignore
  }
};
