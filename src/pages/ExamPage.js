/**
 * Exam Page Component
 * 
 * Main examination interface with:
 * - Question display with timer
 * - Option selection
 * - Progress tracking
 * - Anti-cheating protection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import { getStudentByUserId } from '../services/studentService';
import antiCheatService from '../services/antiCheat';
import './ExamPage.css';

const ExamPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    examStatus,
    currentQuestion,
    currentQuestionIndex,
    timeRemaining,
    progress,
    score,
    loading,
    startExam,
    submitAnswer,
    recordTabSwitch
  } = useExam();

  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [initError, setInitError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  /**
   * Initialize exam and anti-cheat
   */
  useEffect(() => {
    const initializeExam = async () => {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Get student data
        const student = await getStudentByUserId(user.uid);
        if (!student) {
          navigate('/register', { replace: true });
          return;
        }

        setStudentData(student);

        // Start exam if not already started
        if (examStatus === 'not-started') {
          await startExam(student);
        }

        // Activate anti-cheat protection
        antiCheatService.activate(user.uid, student.rollNumber, {
          onTabSwitch: handleTabSwitch,
          onAutoSubmit: handleAutoSubmit
        });

      } catch (error) {
        console.error('Error initializing exam:', error);
        setInitError(error.message);
      }
    };

    initializeExam();

    // Cleanup on unmount
    return () => {
      antiCheatService.deactivate();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, examStatus]);

  /**
   * Update anti-cheat current question
   */
  useEffect(() => {
    if (examStatus === 'in-progress') {
      antiCheatService.setCurrentQuestion(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, examStatus]);

  /**
   * Reset selected option when question changes
   */
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitting(false);
  }, [currentQuestionIndex]);

  /**
   * Navigate to results when exam completes
   */
  useEffect(() => {
    if (examStatus === 'completed') {
      antiCheatService.deactivate();
      navigate('/result', { replace: true });
    }
  }, [examStatus, navigate]);

  /**
   * Handle tab switch callback
   */
  const handleTabSwitch = useCallback((count) => {
    recordTabSwitch();
    setWarningMessage(`Warning: Tab switch detected (${count} time${count > 1 ? 's' : ''}). Further violations may affect your exam.`);
    setShowWarning(true);
    
    // Hide warning after 3 seconds
    setTimeout(() => setShowWarning(false), 3000);
  }, [recordTabSwitch]);

  /**
   * Handle auto-submit callback (e.g., tab inactive too long)
   */
  const handleAutoSubmit = useCallback((reason) => {
    setWarningMessage(`Exam auto-submitted: ${reason}`);
    setShowWarning(true);
  }, []);

  /**
   * Handle option selection
   */
  const handleOptionSelect = (optionIndex) => {
    if (isSubmitting || examStatus !== 'in-progress') return;
    setSelectedOption(optionIndex);
  };

  /**
   * Handle answer submission
   */
  const handleSubmit = async () => {
    if (selectedOption === null || isSubmitting) return;
    
    setIsSubmitting(true);
    await submitAnswer(selectedOption);
  };

  /**
   * Calculate timer color
   */
  const getTimerClass = () => {
    if (timeRemaining <= 5) return 'timer critical';
    if (timeRemaining <= 10) return 'timer warning';
    return 'timer';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="exam-page">
        <div className="exam-loading">
          <div className="loading-spinner"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (initError) {
    return (
      <div className="exam-page">
        <div className="exam-error">
          <h2>Error Loading Exam</h2>
          <p>{initError}</p>
          <button onClick={() => navigate('/register')}>Go Back</button>
        </div>
      </div>
    );
  }

  // Show no question state
  if (!currentQuestion) {
    return (
      <div className="exam-page">
        <div className="exam-loading">
          <div className="loading-spinner"></div>
          <p>Preparing questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-page">
      {/* Warning Overlay */}
      {showWarning && (
        <div className="warning-overlay">
          <div className="warning-content">
            <svg className="warning-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <p>{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="exam-header">
        <div className="header-left">
          <h1>Online Examination</h1>
          {studentData && (
            <span className="student-info">
              {studentData.fullName} ({studentData.rollNumber})
            </span>
          )}
        </div>
        <div className="header-right">
          <div className="current-score">
            Score: <strong>{score}</strong>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="progress-text">
          Question {progress.current} of {progress.total}
        </span>
      </div>

      {/* Main Content */}
      <main className="exam-content">
        {/* Timer */}
        <div className="timer-section">
          <div className={getTimerClass()}>
            <svg className="timer-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span className="timer-value">{timeRemaining}s</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-number">
            Question {currentQuestionIndex + 1}
          </div>
          <h2 className="question-text">{currentQuestion.questionText}</h2>

          {/* Options */}
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitting}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            className="submit-answer-btn"
            onClick={handleSubmit}
            disabled={selectedOption === null || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="btn-spinner"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <svg className="submit-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="exam-instructions">
          <p>
            <strong>Note:</strong> Answer will auto-submit when timer reaches 0. 
            You cannot return to previous questions.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
