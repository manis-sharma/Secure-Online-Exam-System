/**
 * Main Application Component
 * 
 * Sets up routing, providers, and overall application structure.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ExamProvider } from './contexts/ExamContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ExamProvider>
          <div className="app">
            <Routes>
              {/* Public Route - Login */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/register" 
                element={
                  <ProtectedRoute>
                    <RegisterPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/exam" 
                element={
                  <ProtectedRoute>
                    <ExamPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/result" 
                element={
                  <ProtectedRoute>
                    <ResultPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </ExamProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
