/**
 * Login Page Component
 * 
 * Handles Google Sign-In authentication.
 * Only authentication method allowed per requirements.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EXAM_CONFIG } from '../config/firebase';
import './LoginPage.css';

const LoginPage = () => {
  const { user, signInWithGoogle, loading, error } = useAuth();
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/register';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      await signInWithGoogle();
      // Navigation handled by useEffect above
    } catch (err) {
      setLoginError(err.message);
      setIsLoggingIn(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
          <h1 className="login-title">Online Examination Portal</h1>
          <p className="login-subtitle">Secure Assessment System</p>
        </div>

        {/* Domain restriction notice */}
        {EXAM_CONFIG.ALLOWED_DOMAIN && (
          <div className="domain-notice">
            <svg className="notice-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>Only @{EXAM_CONFIG.ALLOWED_DOMAIN} email addresses allowed</span>
          </div>
        )}

        {/* Error display */}
        {(loginError || error) && (
          <div className="error-message">
            <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{loginError || error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button 
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <>
              <div className="btn-spinner"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="login-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Sign in using your Google account</li>
            <li>Complete student registration</li>
            <li>Read all exam rules before starting</li>
            <li>Ensure stable internet connection</li>
            <li>Do not refresh or switch tabs during exam</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>By signing in, you agree to follow the examination rules.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
