/**
 * UIManager - Controls DOM updates, screen transitions, timer visuals, audio buttons, and modals
 */
export class UIManager {
  constructor() {
    // Screens
    this.screenStart = document.getElementById('screen-start');
    this.screenGame = document.getElementById('screen-game');

    // Start Screen Buttons
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnStartHowToPlay = document.getElementById('btn-start-how-to-play');

    // Game Dashboard
    this.cardP1 = document.getElementById('card-player1');
    this.cardP2 = document.getElementById('card-player2');
    this.scoreP1 = document.getElementById('score-p1');
    this.scoreP2 = document.getElementById('score-p2');

    // Turn & Timer Centerpiece
    this.turnCenterpiece = document.getElementById('turn-centerpiece');
    this.turnLabel = document.getElementById('turn-label');
    this.timerNumber = document.getElementById('timer-number');
    this.timerRing = document.getElementById('timer-progress-ring');
    this.timerPill = document.getElementById('timer-pill');
    this.timeUpAlert = document.getElementById('time-up-alert');

    // Game Footer Actions
    this.btnResetGame = document.getElementById('btn-reset-game');
    this.btnHomeGame = document.getElementById('btn-home-game');

    // Game Over Modal
    this.modalGameOver = document.getElementById('modal-gameover');
    this.gameoverTitle = document.getElementById('gameover-title');
    this.gameoverSubtitle = document.getElementById('gameover-subtitle');
    this.gameoverIcon = document.getElementById('gameover-icon');
    this.resCardP1 = document.getElementById('res-card-p1');
    this.resCardP2 = document.getElementById('res-card-p2');
    this.resScoreP1 = document.getElementById('res-score-p1');
    this.resScoreP2 = document.getElementById('res-score-p2');
    this.resBadgeP1 = document.getElementById('res-badge-p1');
    this.resBadgeP2 = document.getElementById('res-badge-p2');
    this.btnPlayAgain = document.getElementById('btn-play-again');
    this.btnBackHome = document.getElementById('btn-back-home');

    // Rules Modal
    this.modalRules = document.getElementById('modal-rules');
    this.btnRules = document.getElementById('btn-rules');
    this.btnCloseRules = document.getElementById('btn-close-rules');

    // Audio Buttons
    this.btnToggleMusic = document.getElementById('btn-toggle-music');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');

    // Toast
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toast-message');
    this.toastTimeout = null;

    // SVG Ring properties (circumference = 2 * PI * r = 2 * 3.14159 * 16 ≈ 100.53)
    this.ringCircumference = 100.53;
  }

  showScreen(name) {
    if (this.screenStart) this.screenStart.classList.remove('active');
    if (this.screenGame) this.screenGame.classList.remove('active');

    if (name === 'start' && this.screenStart) {
      this.screenStart.classList.add('active');
    } else if (name === 'game' && this.screenGame) {
      this.screenGame.classList.add('active');
    }
  }

  updateScores(score1, score2) {
    if (this.scoreP1 && this.scoreP1.textContent !== String(score1)) {
      this.scoreP1.textContent = score1;
      this.scoreP1.classList.remove('score-bump');
      void this.scoreP1.offsetWidth; // trigger reflow
      this.scoreP1.classList.add('score-bump');
    }
    if (this.scoreP2 && this.scoreP2.textContent !== String(score2)) {
      this.scoreP2.textContent = score2;
      this.scoreP2.classList.remove('score-bump');
      void this.scoreP2.offsetWidth; // trigger reflow
      this.scoreP2.classList.add('score-bump');
    }
  }

  updateTurn(currentPlayer, isGameOver = false) {
    if (isGameOver) {
      if (this.cardP1) this.cardP1.classList.remove('active-turn');
      if (this.cardP2) this.cardP2.classList.remove('active-turn');
      if (this.turnLabel) this.turnLabel.textContent = 'GAME OVER';
      if (this.turnCenterpiece) this.turnCenterpiece.className = 'turn-centerpiece game-over';
      return;
    }

    if (currentPlayer === 1) {
      if (this.cardP1) this.cardP1.classList.add('active-turn');
      if (this.cardP2) this.cardP2.classList.remove('active-turn');
      if (this.turnLabel) this.turnLabel.textContent = "PLAYER 1'S TURN";
      if (this.turnCenterpiece) this.turnCenterpiece.className = 'turn-centerpiece p1-active';
    } else {
      if (this.cardP1) this.cardP1.classList.remove('active-turn');
      if (this.cardP2) this.cardP2.classList.add('active-turn');
      if (this.turnLabel) this.turnLabel.textContent = "PLAYER 2'S TURN";
      if (this.turnCenterpiece) this.turnCenterpiece.className = 'turn-centerpiece p2-active';
    }

    // Hide any previous timeout alert
    this.hideTimeUpAlert();
  }

  updateTimer({ seconds, progress, urgency }) {
    if (this.timerNumber) {
      this.timerNumber.textContent = seconds;
    }

    // Update circular progress offset
    if (this.timerRing) {
      const offset = this.ringCircumference * (1 - progress);
      this.timerRing.style.strokeDashoffset = `${offset}`;
    }

    // Update Urgency Classes
    if (this.timerPill) {
      this.timerPill.classList.remove('urgency-normal', 'urgency-warning', 'urgency-danger', 'urgency-timeout');
      this.timerPill.classList.add(`urgency-${urgency}`);
    }
  }

  showTimeUpAlert(onComplete) {
    if (this.timeUpAlert) {
      this.timeUpAlert.classList.remove('hidden', 'fade-out');
      this.timeUpAlert.classList.add('pop-in');

      setTimeout(() => {
        if (this.timeUpAlert) {
          this.timeUpAlert.classList.add('fade-out');
        }
      }, 700);

      setTimeout(() => {
        this.hideTimeUpAlert();
        if (typeof onComplete === 'function') onComplete();
      }, 950);
    } else {
      if (typeof onComplete === 'function') onComplete();
    }
  }

  hideTimeUpAlert() {
    if (this.timeUpAlert) {
      this.timeUpAlert.classList.add('hidden');
      this.timeUpAlert.classList.remove('pop-in', 'fade-out');
    }
  }

  showGameOver(state) {
    const { scores, winner } = state;
    if (this.resScoreP1) this.resScoreP1.textContent = `${scores[1]} ${scores[1] === 1 ? 'Box' : 'Boxes'}`;
    if (this.resScoreP2) this.resScoreP2.textContent = `${scores[2]} ${scores[2] === 1 ? 'Box' : 'Boxes'}`;
    
    if (this.resCardP1) this.resCardP1.classList.remove('is-winner');
    if (this.resCardP2) this.resCardP2.classList.remove('is-winner');

    if (winner === 'draw') {
      if (this.gameoverIcon) this.gameoverIcon.textContent = '🤝';
      if (this.gameoverTitle) this.gameoverTitle.textContent = "IT'S A DRAW!";
      if (this.gameoverSubtitle) this.gameoverSubtitle.textContent = `A tied match with ${scores[1]} boxes each!`;
      if (this.resBadgeP1) this.resBadgeP1.textContent = 'Tied';
      if (this.resBadgeP2) this.resBadgeP2.textContent = 'Tied';
    } else if (winner === 1) {
      if (this.gameoverIcon) this.gameoverIcon.textContent = '🏆';
      if (this.gameoverTitle) this.gameoverTitle.textContent = 'PLAYER 1 WINS!';
      if (this.gameoverSubtitle) this.gameoverSubtitle.textContent = `Red dominates with ${scores[1]} captured boxes!`;
      if (this.resCardP1) this.resCardP1.classList.add('is-winner');
      if (this.resBadgeP1) this.resBadgeP1.textContent = 'Winner 👑';
      if (this.resBadgeP2) this.resBadgeP2.textContent = 'Runner Up';
    } else {
      if (this.gameoverIcon) this.gameoverIcon.textContent = '🏆';
      if (this.gameoverTitle) this.gameoverTitle.textContent = 'PLAYER 2 WINS!';
      if (this.gameoverSubtitle) this.gameoverSubtitle.textContent = `Blue dominates with ${scores[2]} captured boxes!`;
      if (this.resCardP2) this.resCardP2.classList.add('is-winner');
      if (this.resBadgeP2) this.resBadgeP2.textContent = 'Winner 👑';
      if (this.resBadgeP1) this.resBadgeP1.textContent = 'Runner Up';
    }

    if (this.modalGameOver) {
      this.modalGameOver.classList.remove('hidden');
    }
  }

  hideGameOver() {
    if (this.modalGameOver) {
      this.modalGameOver.classList.add('hidden');
    }
  }

  showToast(message, duration = 2500) {
    if (!this.toast || !this.toastMessage) return;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastMessage.textContent = message;
    this.toast.classList.remove('hidden');

    this.toastTimeout = setTimeout(() => {
      if (this.toast) this.toast.classList.add('hidden');
    }, duration);
  }

  updateAudioUI(isMusicOn, isSoundOn) {
    if (this.btnToggleMusic) {
      const musicOn = this.btnToggleMusic.querySelector('.icon-music-on');
      const musicOff = this.btnToggleMusic.querySelector('.icon-music-off');
      if (isMusicOn) {
        if (musicOn) musicOn.classList.remove('hidden');
        if (musicOff) musicOff.classList.add('hidden');
        this.btnToggleMusic.classList.remove('muted');
      } else {
        if (musicOn) musicOn.classList.add('hidden');
        if (musicOff) musicOff.classList.remove('hidden');
        this.btnToggleMusic.classList.add('muted');
      }
    }

    if (this.btnToggleSound) {
      const soundOn = this.btnToggleSound.querySelector('.icon-sound-on');
      const soundOff = this.btnToggleSound.querySelector('.icon-sound-off');
      if (isSoundOn) {
        if (soundOn) soundOn.classList.remove('hidden');
        if (soundOff) soundOff.classList.add('hidden');
        this.btnToggleSound.classList.remove('muted');
      } else {
        if (soundOn) soundOn.classList.add('hidden');
        if (soundOff) soundOff.classList.remove('hidden');
        this.btnToggleSound.classList.add('muted');
      }
    }
  }
}
