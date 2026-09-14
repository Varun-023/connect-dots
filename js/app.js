/**
 * Connect Dots - Main Application Entry Point
 * Offline-first two-player game with precision 20-second turn timer.
 */
import { audio } from './audio.js';
import { BoardRenderer } from './boardRenderer.js';
import { GameController } from './gameController.js';
import { UIManager } from './ui.js';

class ConnectDotsApp {
  constructor() {
    this.ui = new UIManager();
    this.board = null;
    this.controller = null;
  }

  init() {
    // 1. Initialize Board Renderer
    const boardContainer = document.getElementById('board-container');
    this.board = new BoardRenderer(boardContainer, (type, row, col) => {
      audio.initContext();
      if (this.controller) {
        this.controller.handleLineClick(type, row, col);
      }
    });

    // 2. Initialize Game Controller
    this.controller = new GameController(this.ui, this.board);

    // 3. Set up UI event handlers
    this.setupEventListeners();

    // 4. Update initial Audio icons
    this.ui.updateAudioUI(audio.isMusicEnabled, audio.isSoundEnabled);

    // 5. Register PWA Service Worker for offline capability
    this.registerServiceWorker();
  }

  setupEventListeners() {
    // Audio toggles
    this.ui.btnToggleMusic?.addEventListener('click', () => {
      const state = audio.toggleMusic();
      this.ui.updateAudioUI(state, audio.isSoundEnabled);
      audio.playClick();
      this.ui.showToast(`Music ${state ? 'ON' : 'OFF'}`);
    });

    this.ui.btnToggleSound?.addEventListener('click', () => {
      const state = audio.toggleSound();
      this.ui.updateAudioUI(audio.isMusicEnabled, state);
      audio.playClick();
      this.ui.showToast(`Sound Effects ${state ? 'ON' : 'OFF'}`);
    });

    // Keyboard shortcuts: M for music, S for sound
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'm' || e.key === 'M') {
        const state = audio.toggleMusic();
        this.ui.updateAudioUI(state, audio.isSoundEnabled);
      } else if (e.key === 's' || e.key === 'S') {
        const state = audio.toggleSound();
        this.ui.updateAudioUI(audio.isMusicEnabled, state);
      }
    });

    // Rules Modal
    this.ui.btnRules?.addEventListener('click', () => {
      audio.initContext();
      audio.playClick();
      this.ui.modalRules?.classList.remove('hidden');
    });

    this.ui.btnStartHowToPlay?.addEventListener('click', () => {
      audio.initContext();
      audio.playClick();
      this.ui.modalRules?.classList.remove('hidden');
    });

    this.ui.btnCloseRules?.addEventListener('click', () => {
      audio.playClick();
      this.ui.modalRules?.classList.add('hidden');
    });

    this.ui.modalRules?.addEventListener('click', (e) => {
      if (e.target === this.ui.modalRules) {
        this.ui.modalRules.classList.add('hidden');
      }
    });

    // Start Screen - Start Game
    this.ui.btnStartGame?.addEventListener('click', () => {
      audio.initContext();
      audio.playClick();
      this.controller.startGame();
    });

    // Game Footer Actions
    this.ui.btnResetGame?.addEventListener('click', () => {
      audio.initContext();
      audio.playClick();
      this.controller.startGame();
      this.ui.showToast('Game restarted!');
    });

    this.ui.btnHomeGame?.addEventListener('click', () => {
      audio.initContext();
      audio.playClick();
      this.controller.goToHome();
    });

    // Game Over Actions
    this.ui.btnPlayAgain?.addEventListener('click', () => {
      audio.initContext();
      audio.playClick();
      this.controller.restartGame();
    });

    this.ui.btnBackHome?.addEventListener('click', () => {
      audio.initContext();
      audio.playClick();
      this.controller.goToHome();
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then((reg) => {
            console.log('ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration failed (non-critical):', err);
          });
      });
    }
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new ConnectDotsApp();
  app.init();
});
