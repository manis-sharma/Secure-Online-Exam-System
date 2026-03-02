/**
 * Exam Context
 * 
 * Manages exam state, timer logic, scoring, and question progression.
 * Handles all exam-related operations including answer submission and auto-progression.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  query,
  where 
} from 'firebase/firestore';
import { db, EXAM_CONFIG } from '../config/firebase';
import { useAuth } from './AuthContext';

const ExamContext = createContext(null);

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ExamProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Exam state
  const [examSession, setExamSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(EXAM_CONFIG.QUESTION_TIME_LIMIT);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [examStatus, setExamStatus] = useState('not-started'); // not-started, in-progress, completed
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  // Refs for timer management
  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(null);

  /**
   * Load questions from Firestore and randomize
   */
  const loadQuestions = useCallback(async () => {
    try {
      const questionsRef = collection(db, 'questions');
      const snapshot = await getDocs(questionsRef);
      
      const loadedQuestions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Shuffle questions order
      const shuffledQuestions = shuffleArray(loadedQuestions);

      // Shuffle options for each question and track correct answer
      const processedQuestions = shuffledQuestions.map(question => {
        const originalOptions = question.options;
        const correctAnswerIndex = question.correctAnswer;
        const correctAnswerText = originalOptions[correctAnswerIndex];
        
        // Create indexed options and shuffle
        const indexedOptions = originalOptions.map((opt, idx) => ({
          text: opt,
          originalIndex: idx
        }));
        const shuffledOptions = shuffleArray(indexedOptions);
        
        // Find new index of correct answer
        const newCorrectIndex = shuffledOptions.findIndex(
          opt => opt.text === correctAnswerText
        );

        return {
          ...question,
          options: shuffledOptions.map(opt => opt.text),
          correctAnswer: newCorrectIndex,
          optionMapping: shuffledOptions.map(opt => opt.originalIndex)
        };
      });

      setQuestions(processedQuestions);
      return processedQuestions;
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    }
  }, []);

  /**
   * Start a new exam session
   */
  const startExam = useCallback(async (studentData) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    
    try {
      // Check if student already has an exam session
      const existingSession = await checkExistingSession(studentData.rollNumber);
      if (existingSession && existingSession.status === 'completed') {
        throw new Error('You have already completed this exam');
      }

      // If there's an incomplete session, resume it
      if (existingSession && existingSession.status === 'in-progress') {
        return await resumeExam(existingSession, studentData);
      }

      // Load and randomize questions
      const loadedQuestions = await loadQuestions();
      
      // Create new exam session
      const sessionId = `${user.uid}_${Date.now()}`;
      const sessionData = {
        sessionId,
        userId: user.uid,
        rollNumber: studentData.rollNumber,
        studentName: studentData.fullName,
        email: user.email,
        startTime: serverTimestamp(),
        currentQuestion: 0,
        questionStartTime: Timestamp.now(),
        answers: {},
        score: 0,
        status: 'in-progress',
        questionOrder: loadedQuestions.map(q => q.id),
        tabSwitches: 0
      };

      await setDoc(doc(db, 'examSessions', sessionId), sessionData);
      
      setExamSession(sessionData);
      setStudentInfo(studentData);
      setCurrentQuestionIndex(0);
      setTimeRemaining(EXAM_CONFIG.QUESTION_TIME_LIMIT);
      setAnswers({});
      setScore(0);
      setExamStatus('in-progress');
      questionStartTimeRef.current = Date.now();
      
      setLoading(false);
      return sessionData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadQuestions]);

  /**
   * Check for existing exam session
   */
  const checkExistingSession = async (rollNumber) => {
    try {
      const sessionsRef = collection(db, 'examSessions');
      const q = query(sessionsRef, where('rollNumber', '==', rollNumber));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      return null;
    } catch (error) {
      console.error('Error checking existing session:', error);
      return null;
    }
  };

  /**
   * Resume an existing exam session
   */
  const resumeExam = async (session, studentData) => {
    setLoading(true);
    
    try {
      await loadQuestions();
      
      setExamSession(session);
      setStudentInfo(studentData);
      setCurrentQuestionIndex(session.currentQuestion);
      setAnswers(session.answers || {});
      setScore(session.score || 0);
      setTabSwitchCount(session.tabSwitches || 0);
      setExamStatus('in-progress');
      
      // Calculate remaining time for current question
      const questionStartTime = session.questionStartTime?.toDate?.() || new Date();
      const elapsed = Math.floor((Date.now() - questionStartTime.getTime()) / 1000);
      const remaining = Math.max(0, EXAM_CONFIG.QUESTION_TIME_LIMIT - elapsed);
      
      setTimeRemaining(remaining);
      questionStartTimeRef.current = Date.now() - (elapsed * 1000);
      
      setLoading(false);
      return session;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * Complete the exam and save results
   */
  const completeExam = useCallback(async () => {
    if (!examSession) return;
    
    setExamStatus('completed');

    // Calculate final statistics
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    Object.values(answers).forEach(answer => {
      if (answer.timedOut || answer.selectedOption === null) {
        unansweredCount++;
      } else if (answer.isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    // Handle questions not in answers (if any)
    const answeredIds = Object.keys(answers);
    questions.forEach(q => {
      if (!answeredIds.includes(q.id)) {
        unansweredCount++;
      }
    });

    // Calculate duration
    const startTime = examSession.startTime?.toDate?.() || new Date();
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);

    // Prepare result data
    const resultData = {
      sessionId: examSession.sessionId,
      userId: user.uid,
      studentName: studentInfo?.fullName || '',
      rollNumber: studentInfo?.rollNumber || '',
      email: user.email,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        ...answer
      })),
      score,
      totalMarks: questions.length * EXAM_CONFIG.MARKS_CORRECT,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      submittedAt: serverTimestamp(),
      duration,
      tabSwitches: tabSwitchCount
    };

    try {
      // Save result
      const resultId = `result_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'examResults', resultId), resultData);

      // Update session status
      await updateDoc(doc(db, 'examSessions', examSession.sessionId), {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // Update student record
      if (studentInfo?.rollNumber) {
        await updateDoc(doc(db, 'students', studentInfo.rollNumber), {
          examAttempted: true,
          examCompletedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error saving exam result:', error);
    }
  }, [examSession, answers, questions, score, user, studentInfo, tabSwitchCount]);

  /**
   * Move to next question or complete exam
   */
  const moveToNextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      // Exam completed
      completeExam();
    } else {
      // Move to next question
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(EXAM_CONFIG.QUESTION_TIME_LIMIT);
      questionStartTimeRef.current = Date.now();
    }
  }, [currentQuestionIndex, questions.length, completeExam]);

  /**
   * Submit answer for current question
   */
  const submitAnswer = useCallback(async (selectedOption) => {
    if (examStatus !== 'in-progress' || !examSession) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Calculate score for this answer
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const pointsEarned = isCorrect ? EXAM_CONFIG.MARKS_CORRECT : EXAM_CONFIG.MARKS_WRONG;
    
    // Calculate time taken
    const timeTaken = EXAM_CONFIG.QUESTION_TIME_LIMIT - timeRemaining;

    // Update answers
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: {
        selectedOption,
        isCorrect,
        timeTaken,
        pointsEarned,
        timestamp: Date.now()
      }
    };
    setAnswers(newAnswers);

    // Update score
    const newScore = score + pointsEarned;
    setScore(newScore);

    // Update session in Firestore
    try {
      await updateDoc(doc(db, 'examSessions', examSession.sessionId), {
        answers: newAnswers,
        score: newScore,
        currentQuestion: currentQuestionIndex + 1,
        questionStartTime: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }

    // Move to next question or complete exam
    moveToNextQuestion();
  }, [examStatus, examSession, questions, currentQuestionIndex, answers, score, timeRemaining, moveToNextQuestion]);

  /**
   * Handle timeout - auto-submit with penalty
   */
  const handleTimeout = useCallback(async () => {
    if (examStatus !== 'in-progress' || !examSession) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Timeout counts as unanswered with penalty
    const pointsEarned = EXAM_CONFIG.MARKS_UNANSWERED;

    // Update answers
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: {
        selectedOption: null,
        isCorrect: false,
        timeTaken: EXAM_CONFIG.QUESTION_TIME_LIMIT,
        pointsEarned,
        timestamp: Date.now(),
        timedOut: true
      }
    };
    setAnswers(newAnswers);

    // Update score
    const newScore = score + pointsEarned;
    setScore(newScore);

    // Update session in Firestore
    try {
      await updateDoc(doc(db, 'examSessions', examSession.sessionId), {
        answers: newAnswers,
        score: newScore,
        currentQuestion: currentQuestionIndex + 1,
        questionStartTime: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }

    // Move to next question
    moveToNextQuestion();
  }, [examStatus, examSession, questions, currentQuestionIndex, answers, score, moveToNextQuestion]);

  /**
   * Record tab switch
   */
  const recordTabSwitch = useCallback(async () => {
    const newCount = tabSwitchCount + 1;
    setTabSwitchCount(newCount);

    if (examSession) {
      try {
        await updateDoc(doc(db, 'examSessions', examSession.sessionId), {
          tabSwitches: newCount
        });

        // Log suspicious activity
        await setDoc(doc(collection(db, 'activityLogs')), {
          userId: user?.uid,
          rollNumber: studentInfo?.rollNumber,
          activityType: 'tab_switch',
          timestamp: serverTimestamp(),
          questionNumber: currentQuestionIndex + 1,
          details: {
            totalSwitches: newCount
          }
        });
      } catch (error) {
        console.error('Error logging tab switch:', error);
      }
    }
  }, [tabSwitchCount, examSession, user, studentInfo, currentQuestionIndex]);

  /**
   * Timer effect
   */
  useEffect(() => {
    if (examStatus !== 'in-progress' || questions.length === 0) {
      return;
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - will trigger handleTimeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [examStatus, currentQuestionIndex, questions.length]);

  /**
   * Handle timeout when timer reaches 0
   */
  useEffect(() => {
    if (timeRemaining === 0 && examStatus === 'in-progress') {
      handleTimeout();
    }
  }, [timeRemaining, examStatus, handleTimeout]);

  /**
   * Get current question
   */
  const currentQuestion = questions[currentQuestionIndex] || null;

  /**
   * Get exam progress
   */
  const progress = {
    current: currentQuestionIndex + 1,
    total: questions.length,
    percentage: questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  };

  /**
   * Get final results data
   */
  const getResults = useCallback(() => {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    Object.values(answers).forEach(answer => {
      if (answer.timedOut || answer.selectedOption === null) {
        unansweredCount++;
      } else if (answer.isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    // Handle unanswered questions
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      unansweredCount += (questions.length - answeredCount);
    }

    return {
      score,
      totalMarks: questions.length * EXAM_CONFIG.MARKS_CORRECT,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      tabSwitches: tabSwitchCount,
      studentInfo
    };
  }, [answers, questions, score, tabSwitchCount, studentInfo]);

  const value = {
    // State
    examSession,
    questions,
    currentQuestion,
    currentQuestionIndex,
    timeRemaining,
    answers,
    score,
    examStatus,
    loading,
    progress,
    tabSwitchCount,
    studentInfo,
    
    // Actions
    startExam,
    submitAnswer,
    handleTimeout,
    recordTabSwitch,
    getResults,
    
    // Config
    config: EXAM_CONFIG
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

export default ExamContext;
