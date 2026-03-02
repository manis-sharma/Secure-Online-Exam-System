/**
 * Student Registration Page
 * 
 * Collects student details before exam starts.
 * Validates roll number uniqueness and required fields.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  registerStudent, 
  getStudentByUserId, 
  validateRollNumber, 
  validateFullName,
  hasStudentAttemptedExam 
} from '../services/studentService';
import './RegisterPage.css';

const RegisterPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    classSection: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [existingStudent, setExistingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing registration
  useEffect(() => {
    const checkExisting = async () => {
      if (!user) return;

      try {
        const student = await getStudentByUserId(user.uid);
        if (student) {
          setExistingStudent(student);
          setFormData({
            fullName: student.fullName,
            rollNumber: student.rollNumber,
            classSection: student.classSection || ''
          });
        }
      } catch (error) {
        console.error('Error checking existing student:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExisting();
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    setSubmitError(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!validateFullName(formData.fullName)) {
      newErrors.fullName = 'Please enter a valid name';
    }

    // Validate roll number
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    } else if (!validateRollNumber(formData.rollNumber)) {
      newErrors.rollNumber = 'Please enter a valid roll number (alphanumeric)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Register student
      await registerStudent(formData, user.uid, user.email);
      
      // Navigate to exam page
      navigate('/exam', { replace: true });
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  };

  // Handle proceeding if already registered
  const handleProceed = async () => {
    if (!existingStudent) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Check if exam already attempted
      const attempted = await hasStudentAttemptedExam(existingStudent.rollNumber);
      if (attempted) {
        setSubmitError('You have already completed this exam');
        setIsSubmitting(false);
        return;
      }

      // Navigate to exam
      navigate('/exam', { replace: true });
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        {/* User Info Header */}
        <div className="user-info-bar">
          <div className="user-details">
            {user?.photoURL && (
              <img src={user.photoURL} alt="" className="user-avatar" />
            )}
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        {/* Header */}
        <div className="register-header">
          <h1>Student Registration</h1>
          <p>Please enter your details to start the exam</p>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="error-banner">
            <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {/* Existing Student Notice */}
        {existingStudent && !existingStudent.examAttempted && (
          <div className="existing-notice">
            <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>You are already registered. Click below to continue to the exam.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Full Name */}
          <div className={`form-group ${errors.fullName ? 'has-error' : ''}`}>
            <label htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={existingStudent && !existingStudent.examAttempted}
              autoComplete="name"
            />
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

          {/* Roll Number */}
          <div className={`form-group ${errors.rollNumber ? 'has-error' : ''}`}>
            <label htmlFor="rollNumber">
              Roll Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="Enter your roll number"
              disabled={existingStudent && !existingStudent.examAttempted}
              autoComplete="off"
            />
            {errors.rollNumber && (
              <span className="error-text">{errors.rollNumber}</span>
            )}
          </div>

          {/* Class/Section */}
          <div className="form-group">
            <label htmlFor="classSection">Class/Section</label>
            <input
              type="text"
              id="classSection"
              name="classSection"
              value={formData.classSection}
              onChange={handleChange}
              placeholder="e.g., 10-A"
              disabled={existingStudent && !existingStudent.examAttempted}
              autoComplete="off"
            />
          </div>

          {/* Submit Button */}
          {existingStudent && !existingStudent.examAttempted ? (
            <button 
              type="button" 
              className="submit-btn"
              onClick={handleProceed}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Loading...</span>
                </>
              ) : (
                'Continue to Exam'
              )}
            </button>
          ) : (
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Registering...</span>
                </>
              ) : (
                'Register & Start Exam'
              )}
            </button>
          )}
        </form>

        {/* Rules Reminder */}
        <div className="rules-section">
          <h3>Exam Rules</h3>
          <ul>
            <li>Each question has a 30-second time limit</li>
            <li>You cannot go back to previous questions</li>
            <li>Switching tabs will be recorded</li>
            <li>Wrong answers will result in negative marking</li>
            <li>Do not refresh the page during the exam</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
