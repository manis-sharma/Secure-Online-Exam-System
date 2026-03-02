/**
 * Student Service
 * 
 * Handles student registration, verification, and data management.
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Register a new student
 * @param {Object} studentData - Student information
 * @param {string} userId - Firebase user ID
 * @param {string} email - User email
 * @returns {Object} - Registered student data
 */
export const registerStudent = async (studentData, userId, email) => {
  const { fullName, rollNumber, classSection } = studentData;
  
  // Validate required fields
  if (!fullName || !rollNumber) {
    throw new Error('Full name and roll number are required');
  }

  // Check if roll number already exists
  const existingStudent = await getStudentByRollNumber(rollNumber);
  if (existingStudent) {
    if (existingStudent.userId !== userId) {
      throw new Error('This roll number is already registered by another user');
    }
    // Return existing registration
    return existingStudent;
  }

  // Create student document
  const studentDoc = {
    fullName: fullName.trim(),
    rollNumber: rollNumber.trim().toUpperCase(),
    classSection: classSection?.trim() || '',
    email,
    userId,
    registeredAt: serverTimestamp(),
    examAttempted: false
  };

  // Save to Firestore using roll number as document ID
  const studentRef = doc(db, 'students', rollNumber.trim().toUpperCase());
  await setDoc(studentRef, studentDoc);

  return studentDoc;
};

/**
 * Get student by roll number
 * @param {string} rollNumber - Student roll number
 * @returns {Object|null} - Student data or null
 */
export const getStudentByRollNumber = async (rollNumber) => {
  try {
    const normalizedRollNumber = rollNumber.trim().toUpperCase();
    const studentRef = doc(db, 'students', normalizedRollNumber);
    const studentSnap = await getDoc(studentRef);
    
    if (studentSnap.exists()) {
      return studentSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting student:', error);
    throw error;
  }
};

/**
 * Get student by user ID
 * @param {string} userId - Firebase user ID
 * @returns {Object|null} - Student data or null
 */
export const getStudentByUserId = async (userId) => {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error('Error getting student by userId:', error);
    throw error;
  }
};

/**
 * Check if student has already attempted the exam
 * @param {string} rollNumber - Student roll number
 * @returns {boolean} - Whether exam was attempted
 */
export const hasStudentAttemptedExam = async (rollNumber) => {
  try {
    const student = await getStudentByRollNumber(rollNumber);
    return student?.examAttempted || false;
  } catch (error) {
    console.error('Error checking exam attempt:', error);
    return false;
  }
};

/**
 * Validate roll number format
 * @param {string} rollNumber - Roll number to validate
 * @returns {boolean} - Whether roll number is valid
 */
export const validateRollNumber = (rollNumber) => {
  if (!rollNumber) return false;
  
  // Basic validation - can be customized per school requirements
  const trimmed = rollNumber.trim();
  
  // Must be at least 2 characters
  if (trimmed.length < 2) return false;
  
  // Must be alphanumeric (with optional hyphens/underscores)
  const validPattern = /^[A-Za-z0-9_-]+$/;
  return validPattern.test(trimmed);
};

/**
 * Validate full name
 * @param {string} name - Name to validate
 * @returns {boolean} - Whether name is valid
 */
export const validateFullName = (name) => {
  if (!name) return false;
  
  const trimmed = name.trim();
  
  // Must be at least 2 characters
  if (trimmed.length < 2) return false;
  
  // Must contain only letters, spaces, and basic punctuation
  const validPattern = /^[A-Za-z\s'.,-]+$/;
  return validPattern.test(trimmed);
};

const studentService = {
  registerStudent,
  getStudentByRollNumber,
  getStudentByUserId,
  hasStudentAttemptedExam,
  validateRollNumber,
  validateFullName
};

export default studentService;
