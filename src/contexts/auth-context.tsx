"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';

// TypeScript interfaces
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  username?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateProfilePhoto: (photoURL: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Error message mapping for user-friendly messages in Japanese
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'このメールアドレスに該当するアカウントが見つかりません。',
    'auth/wrong-password': 'パスワードが間違っています。もう一度お試しください。',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています。',
    'auth/weak-password': 'パスワードは6文字以上で入力してください。',
    'auth/invalid-email': '有効なメールアドレスを入力してください。',
    'auth/user-disabled': 'このアカウントは無効化されています。',
    'auth/too-many-requests': '試行回数が多すぎます。しばらくしてからもう一度お試しください。',
    'auth/network-request-failed': 'ネットワークエラーです。接続を確認してください。',
    'auth/popup-closed-by-user': 'サインインがユーザーによってキャンセルされました。',
    'auth/popup-blocked': 'サインインポップアップがブラウザーによってブロックされました。',
    'auth/requires-recent-login': 'この操作には最新の認証が必要です。もう一度サインインしてください。',
  };

  return errorMessages[errorCode] || '予期しないエラーが発生しました。もう一度お試しください。';
};

// Convert Firebase User to our User interface
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
});

// Create or update user document in Firestore
const createUserDocument = async (user: FirebaseUser, additionalData?: any) => {
  if (!user) return;
  
  try {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL, uid } = user;
      const createdAt = new Date().toISOString();
      
      await setDoc(userRef, {
        uid,
        displayName,
        email,
        photoURL,
        createdAt,
        ...additionalData,
      });
    }
    
    return userRef;
  } catch (error) {
    console.error('Error creating user document:', error);
    // Don't throw here to prevent breaking the auth flow
    return null;
  }
};

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clear error helper
  const clearError = () => setError(null);

  // Error handler
  const handleError = (error: any) => {
    const errorMessage = getErrorMessage(error.code);
    setError(errorMessage);
    console.error('Auth error:', error);
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        
        // Create user document in Firestore
        await createUserDocument(userCredential.user, { 
          username: displayName,
          isNewUser: true 
        });
      }
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // Create user document in Firestore for Google sign-in
      if (result.user) {
        await createUserDocument(result.user);
      }
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  // Update display name
  const updateDisplayName = async (displayName: string): Promise<void> => {
    try {
      setError(null);
      
      if (!auth.currentUser) {
        throw new Error('ユーザーがサインインしていません');
      }
      
      await updateProfile(auth.currentUser, { displayName });
      
      // Update Firestore document
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await setDoc(userRef, { displayName }, { merge: true });
      
      // Update local user state
      if (user) {
        setUser({ ...user, displayName });
      }
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  // Update profile photo
  const updateProfilePhoto = async (photoURL: string): Promise<void> => {
    try {
      setError(null);
      
      if (!auth.currentUser) {
        throw new Error('ユーザーがサインインしていません');
      }
      
      await updateProfile(auth.currentUser, { photoURL });
      
      // Update Firestore document
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await setDoc(userRef, { photoURL }, { merge: true });
      
      // Update local user state
      if (user) {
        setUser({ ...user, photoURL });
      }
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  // Update password
  const updateUserPassword = async (newPassword: string): Promise<void> => {
    try {
      setError(null);
      
      if (!auth.currentUser) {
        throw new Error('ユーザーがサインインしていません');
      }
      
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      handleError(error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!isClient) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let userData = convertFirebaseUser(firebaseUser);
          
          // Try to get additional user data from Firestore
          try {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const firestoreData = userDoc.data();
              userData = {
                ...userData,
                username: firestoreData?.username || firestoreData?.displayName,
                createdAt: firestoreData?.createdAt,
              };
            }
          } catch (firestoreError) {
            console.warn('Could not fetch user document from Firestore:', firestoreError);
            // Continue with basic user data
          }
          
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isClient]);

  // Context value
  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateDisplayName,
    updateProfilePhoto,
    updateUserPassword,
    clearError,
  };

  // Add loading state during hydration
  if (!isClient) {
    return (
      <AuthContext.Provider value={{
        ...value,
        loading: true,
        user: null
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;