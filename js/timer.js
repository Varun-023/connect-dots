/**
 * TurnTimer - Precision 20-Second Turn Countdown Timer
 * Uses actual timestamps (Date.now() deadlines) to guarantee precision
 * regardless of browser throttling, background tabs, or RAF pauses.
 */
export class TurnTimer {
  /**
   * @param {object} options
   * @param {number} options.durationSec - Total turn duration in seconds (default 20)
   * @param {function} options.onTick - Callback on each tick ({ seconds, remainingMs, progress, urgency })
   * @param {function} options.onTimeout - Callback when timer hits 0
   */
  constructor(options = {}) {
    this.durationSec = options.durationSec || 20;
    this.durationMs = this.durationSec * 1000;
    this.onTick = options.onTick || null;
    this.onTimeout = options.onTimeout || null;

    this.deadline = null;
    this.timerId = null;
    this.isRunning = false;
    this.isPaused = false;
    this.pausedRemainingMs = 0;
    this.lastReportedSec = null;

    // Handle background tab visibility change gracefully
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  /**
   * Start or restart the countdown timer for a new turn
   */
  start() {
    this.stop();
    this.isRunning = true;
    this.isPaused = false;
    this.deadline = Date.now() + this.durationMs;
    this.lastReportedSec = this.durationSec;

    // Trigger initial tick immediately
    this.tick();

    // High frequency interval (50ms) for smooth progress ring animation & exact second transitions
    this.timerId = setInterval(() => this.tick(), 50);
  }

  /**
   * Stop and clear the timer
   */
  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Reset timer to full duration without starting
   */
  reset() {
    this.stop();
    this.deadline = null;
    this.lastReportedSec = this.durationSec;
    if (this.onTick) {
      this.onTick({
        seconds: this.durationSec,
        remainingMs: this.durationMs,
        progress: 1.0,
        urgency: 'normal'
      });
    }
  }

  /**
   * Check if current time has passed the deadline
   * @returns {boolean}
   */
  isExpired() {
    if (!this.isRunning || !this.deadline) return true;
    return Date.now() >= this.deadline;
  }

  /**
   * Get remaining milliseconds
   * @returns {number}
   */
  getRemainingMs() {
    if (!this.isRunning || !this.deadline) return 0;
    return Math.max(0, this.deadline - Date.now());
  }

  /**
   * Get remaining whole seconds (1 to 20)
   * @returns {number}
   */
  getRemainingSeconds() {
    const ms = this.getRemainingMs();
    return Math.ceil(ms / 1000);
  }

  /**
   * Core tick handler
   */
  tick() {
    if (!this.isRunning || !this.deadline) return;

    const remainingMs = Math.max(0, this.deadline - Date.now());
    const seconds = Math.ceil(remainingMs / 1000);
    const progress = Math.min(1.0, Math.max(0.0, remainingMs / this.durationMs));

    // Urgency categorization
    // 20 - 11s: normal
    // 10 - 6s: warning
    // 5 - 1s: danger
    // 0s: timeout
    let urgency = 'normal';
    if (seconds === 0 || remainingMs <= 0) {
      urgency = 'timeout';
    } else if (seconds <= 5) {
      urgency = 'danger';
    } else if (seconds <= 10) {
      urgency = 'warning';
    }

    if (this.onTick) {
      this.onTick({
        seconds,
        remainingMs,
        progress,
        urgency,
        secondChanged: this.lastReportedSec !== seconds
      });
    }

    this.lastReportedSec = seconds;

    // Timeout reached
    if (remainingMs <= 0) {
      this.stop();
      if (this.onTimeout) {
        this.onTimeout();
      }
    }
  }

  /**
   * Handle browser tab visibility changes
   */
  handleVisibilityChange() {
    if (!this.isRunning) return;
    // When tab regains focus, immediately evaluate deadline
    if (!document.hidden) {
      this.tick();
    }
  }

  destroy() {
    this.stop();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}
