/**
 * Anti-Cheat Service
 * 
 * Provides protection against common cheating methods:
 * - Tab switching detection
 * - Copy/paste prevention
 * - Right-click disabling
 * - Console tampering detection
 * - Keyboard shortcut blocking
 */

import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, EXAM_CONFIG } from '../config/firebase';

class AntiCheatService {
  constructor() {
    this.isActive = false;
    this.userId = null;
    this.rollNumber = null;
    this.onTabSwitch = null;
    this.onAutoSubmit = null;
    this.tabSwitchCount = 0;
    this.tabInactiveTime = 0;
    this.tabInactiveTimer = null;
    this.currentQuestionNumber = 0;
    
    // Bind methods
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleCut = this.handleCut.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
    this.handleDevTools = this.handleDevTools.bind(this);
  }

  /**
   * Activate anti-cheat protection
   */
  activate(userId, rollNumber, callbacks = {}) {
    if (this.isActive) return;
    
    this.userId = userId;
    this.rollNumber = rollNumber;
    this.onTabSwitch = callbacks.onTabSwitch || (() => {});
    this.onAutoSubmit = callbacks.onAutoSubmit || (() => {});
    this.isActive = true;
    this.tabSwitchCount = 0;

    // Add event listeners
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    document.addEventListener('contextmenu', this.handleContextMenu);
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('paste', this.handlePaste);
    document.addEventListener('cut', this.handleCut);
    document.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('devtoolschange', this.handleDevTools);

    // Prevent back navigation
    this.setupBackNavPrevention();

    // Log activation
    this.logActivity('anti_cheat_activated', {});

    console.log('Anti-cheat protection activated');
  }

  /**
   * Deactivate anti-cheat protection
   */
  deactivate() {
    if (!this.isActive) return;

    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener('cut', this.handleCut);
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('devtoolschange', this.handleDevTools);

    // Clear tab inactive timer
    if (this.tabInactiveTimer) {
      clearInterval(this.tabInactiveTimer);
      this.tabInactiveTimer = null;
    }

    this.isActive = false;
    console.log('Anti-cheat protection deactivated');
  }

  /**
   * Update current question number for logging
   */
  setCurrentQuestion(questionNumber) {
    this.currentQuestionNumber = questionNumber;
  }

  /**
   * Handle tab visibility change
   */
  handleVisibilityChange() {
    if (!this.isActive) return;

    if (document.hidden) {
      // User switched away from tab
      this.tabSwitchCount++;
      
      this.logActivity('tab_switch_away', {
        switchCount: this.tabSwitchCount,
        questionNumber: this.currentQuestionNumber
      });

      // Start tracking inactive time
      this.tabInactiveTime = 0;
      this.tabInactiveTimer = setInterval(() => {
        this.tabInactiveTime++;
        
        // Auto-submit if inactive for too long
        if (this.tabInactiveTime >= EXAM_CONFIG.TAB_SWITCH_PENALTY_TIME) {
          this.logActivity('auto_submit_tab_inactive', {
            inactiveTime: this.tabInactiveTime,
            questionNumber: this.currentQuestionNumber
          });
          
          // Clear timer and trigger auto-submit
          clearInterval(this.tabInactiveTimer);
          this.tabInactiveTimer = null;
          
          if (this.onAutoSubmit) {
            this.onAutoSubmit('Tab inactive for too long');
          }
        }
      }, 1000);

      // Notify callback
      if (this.onTabSwitch) {
        this.onTabSwitch(this.tabSwitchCount);
      }
    } else {
      // User returned to tab
      if (this.tabInactiveTimer) {
        clearInterval(this.tabInactiveTimer);
        this.tabInactiveTimer = null;
      }

      this.logActivity('tab_switch_return', {
        inactiveTime: this.tabInactiveTime,
        questionNumber: this.currentQuestionNumber
      });
    }
  }

  /**
   * Prevent right-click context menu
   */
  handleContextMenu(e) {
    if (!this.isActive) return;
    
    e.preventDefault();
    this.logActivity('right_click_attempt', {
      x: e.clientX,
      y: e.clientY,
      questionNumber: this.currentQuestionNumber
    });
    
    return false;
  }

  /**
   * Prevent copy operation
   */
  handleCopy(e) {
    if (!this.isActive) return;
    
    e.preventDefault();
    this.logActivity('copy_attempt', {
      questionNumber: this.currentQuestionNumber
    });
    
    return false;
  }

  /**
   * Prevent paste operation
   */
  handlePaste(e) {
    if (!this.isActive) return;
    
    e.preventDefault();
    this.logActivity('paste_attempt', {
      questionNumber: this.currentQuestionNumber
    });
    
    return false;
  }

  /**
   * Prevent cut operation
   */
  handleCut(e) {
    if (!this.isActive) return;
    
    e.preventDefault();
    this.logActivity('cut_attempt', {
      questionNumber: this.currentQuestionNumber
    });
    
    return false;
  }

  /**
   * Block keyboard shortcuts for developer tools and other actions
   */
  handleKeyDown(e) {
    if (!this.isActive) return;

    // Block F12
    if (e.key === 'F12') {
      e.preventDefault();
      this.logActivity('devtools_shortcut_attempt', { key: 'F12' });
      return false;
    }

    // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Dev Tools)
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
      e.preventDefault();
      this.logActivity('devtools_shortcut_attempt', { 
        key: `Ctrl+Shift+${e.key.toUpperCase()}` 
      });
      return false;
    }

    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault();
      this.logActivity('view_source_attempt', {});
      return false;
    }

    // Block Ctrl+S (Save Page)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
      e.preventDefault();
      return false;
    }

    // Block Ctrl+P (Print)
    if (e.ctrlKey && e.key.toUpperCase() === 'P') {
      e.preventDefault();
      this.logActivity('print_attempt', {});
      return false;
    }

    // Block Ctrl+A (Select All) 
    if (e.ctrlKey && e.key.toUpperCase() === 'A') {
      e.preventDefault();
      return false;
    }

    // Block Alt+Tab notification (can't actually block, but can detect)
    if (e.altKey && e.key === 'Tab') {
      this.logActivity('alt_tab_attempt', {});
    }
  }

  /**
   * Handle page unload/refresh attempt
   */
  handleBeforeUnload(e) {
    if (!this.isActive) return;

    this.logActivity('page_unload_attempt', {
      questionNumber: this.currentQuestionNumber
    });

    // Show confirmation dialog
    e.preventDefault();
    e.returnValue = 'Your exam is in progress. Are you sure you want to leave?';
    return e.returnValue;
  }

  /**
   * Prevent back navigation
   */
  handlePopState(e) {
    if (!this.isActive) return;

    // Push state again to prevent going back
    window.history.pushState(null, '', window.location.href);
    
    this.logActivity('back_navigation_attempt', {
      questionNumber: this.currentQuestionNumber
    });
  }

  /**
   * Setup back navigation prevention
   */
  setupBackNavPrevention() {
    // Clear forward history and push current state
    window.history.pushState(null, '', window.location.href);
    window.history.pushState(null, '', window.location.href);
  }

  /**
   * Handle dev tools detection
   */
  handleDevTools(e) {
    if (!this.isActive) return;

    if (e.detail.isOpen) {
      this.logActivity('devtools_opened', {
        orientation: e.detail.orientation,
        questionNumber: this.currentQuestionNumber
      });

      // Optionally auto-submit when dev tools are detected
      // Uncomment the following to enable:
      // if (this.onAutoSubmit) {
      //   this.onAutoSubmit('Developer tools detected');
      // }
    }
  }

  /**
   * Log suspicious activity to Firestore
   */
  async logActivity(activityType, details) {
    try {
      const logRef = doc(collection(db, 'activityLogs'));
      await setDoc(logRef, {
        userId: this.userId,
        rollNumber: this.rollNumber,
        activityType,
        timestamp: serverTimestamp(),
        questionNumber: this.currentQuestionNumber,
        details: {
          ...details,
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Get current tab switch count
   */
  getTabSwitchCount() {
    return this.tabSwitchCount;
  }
}

// Export singleton instance
export const antiCheatService = new AntiCheatService();

export default antiCheatService;
