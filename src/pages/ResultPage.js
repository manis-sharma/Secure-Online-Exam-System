/**
 * Result Page Component
 * 
 * Displays exam results with:
 * - Final score
 * - Performance breakdown
 * - Statistics
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import './ResultPage.css';

const ResultPage = () => {
  const { logout } = useAuth();
  const { getResults, examStatus } = useExam();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Redirect if exam not completed
    if (examStatus !== 'completed') {
      navigate('/exam', { replace: true });
      return;
    }

    // Get results
    const examResults = getResults();
    setResults(examResults);
  }, [examStatus, getResults, navigate]);

  /**
   * Get performance message based on score percentage
   */
  const getPerformanceMessage = () => {
    if (!results) return '';
    
    const percentage = (results.score / results.totalMarks) * 100;
    
    if (percentage >= 90) return { text: 'Excellent!', type: 'excellent' };
    if (percentage >= 75) return { text: 'Great Job!', type: 'great' };
    if (percentage >= 60) return { text: 'Good Work!', type: 'good' };
    if (percentage >= 40) return { text: 'Keep Practicing', type: 'average' };
    return { text: 'Needs Improvement', type: 'poor' };
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Show loading if no results yet
  if (!results) {
    return (
      <div className="result-page">
        <div className="result-loading">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const performance = getPerformanceMessage();
  const percentage = Math.round((results.score / results.totalMarks) * 100);

  return (
    <div className="result-page">
      <div className="result-container">
        {/* Header */}
        <div className="result-header">
          <div className={`performance-badge ${performance.type}`}>
            {performance.text}
          </div>
          <h1>Exam Completed!</h1>
        </div>

        {/* Score Circle */}
        <div className="score-section">
          <div className={`score-circle ${performance.type}`}>
            <div className="score-value">{results.score}</div>
            <div className="score-label">out of {results.totalMarks}</div>
          </div>
          <div className="percentage">{percentage >= 0 ? percentage : 0}%</div>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card correct">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{results.correctAnswers}</div>
              <div className="stat-label">Correct</div>
            </div>
          </div>

          <div className="stat-card wrong">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{results.wrongAnswers}</div>
              <div className="stat-label">Wrong</div>
            </div>
          </div>

          <div className="stat-card unanswered">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{results.unanswered}</div>
              <div className="stat-label">Timed Out</div>
            </div>
          </div>

          <div className="stat-card total">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{results.totalQuestions}</div>
              <div className="stat-label">Total Questions</div>
            </div>
          </div>
        </div>

        {/* Tab Switch Warning */}
        {results.tabSwitches > 0 && (
          <div className="tab-switch-notice">
            <svg className="notice-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span>
              {results.tabSwitches} tab switch{results.tabSwitches > 1 ? 'es' : ''} detected during exam
            </span>
          </div>
        )}

        {/* Student Info */}
        {results.studentInfo && (
          <div className="student-details">
            <h3>Student Details</h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{results.studentInfo.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Roll Number:</span>
              <span className="detail-value">{results.studentInfo.rollNumber}</span>
            </div>
            {results.studentInfo.classSection && (
              <div className="detail-row">
                <span className="detail-label">Class/Section:</span>
                <span className="detail-value">{results.studentInfo.classSection}</span>
              </div>
            )}
          </div>
        )}

        {/* Scoring Info */}
        <div className="scoring-info">
          <h4>Scoring System</h4>
          <ul>
            <li>Correct Answer: +1 mark</li>
            <li>Wrong Answer: -1 mark (negative marking)</li>
            <li>Unanswered/Timed Out: -1 mark</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="result-footer">
          <p>Your results have been saved. Thank you for taking the exam!</p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
