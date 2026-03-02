/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Handles Google Sign-In, session management, and user state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider, EXAM_CONFIG } from '../config/firebase';

// Create Authentication Context
const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Store user data in Firestore
   */
  const storeUserData = async (firebaseUser) => {
    if (!firebaseUser) return null;

    const userRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      // Check if user exists
      const userSnap = await getDoc(userRef);
      
      const userData = {
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        lastActivity: serverTimestamp()
      };

      if (!userSnap.exists()) {
        // New user - add login timestamp
        userData.loginTimestamp = serverTimestamp();
        userData.role = 'student';
      }

      await setDoc(userRef, userData, { merge: true });
      
      // Return stored data
      const updatedSnap = await getDoc(userRef);
      return updatedSnap.data();
    } catch (err) {
      console.error('Error storing user data:', err);
      throw err;
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check domain restriction
      if (EXAM_CONFIG.ALLOWED_DOMAIN) {
        const emailDomain = firebaseUser.email.split('@')[1];
        if (emailDomain !== EXAM_CONFIG.ALLOWED_DOMAIN) {
          await signOut(auth);
          throw new Error(`Only @${EXAM_CONFIG.ALLOWED_DOMAIN} email addresses are allowed.`);
        }
      }

      // Store user data in Firestore
      const userData = await storeUserData(firebaseUser);
      setUserData(userData);

      return { user: firebaseUser, userData };
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Sign out user
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err) {
      console.error('Sign-out error:', err);
      throw err;
    }
  }, []);

  /**
   * Listen to authentication state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        // Check domain restriction for existing sessions
        if (EXAM_CONFIG.ALLOWED_DOMAIN) {
          const emailDomain = firebaseUser.email.split('@')[1];
          if (emailDomain !== EXAM_CONFIG.ALLOWED_DOMAIN) {
            await signOut(auth);
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }
        }

        setUser(firebaseUser);
        
        try {
          const data = await storeUserData(firebaseUser);
          setUserData(data);
        } catch (err) {
          console.error('Error loading user data:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  /**
   * Check if user has completed student registration
   */
  const checkStudentRegistration = useCallback(async () => {
    if (!user) return null;
    
    try {
      // Query students collection for this user
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      return null;
    } catch (err) {
      console.error('Error checking student registration:', err);
      return null;
    }
  }, [user]);

  // Context value
  const value = {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    logout,
    checkStudentRegistration,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
