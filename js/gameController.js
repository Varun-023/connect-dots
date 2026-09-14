/**
 * GameController - Orchestrates local two-player game flow
 * Coordinates GameEngine, TurnTimer, BoardRenderer, UIManager, and AudioManager.
 */
import { audio } from './audio.js';
import { GameEngine } from './gameEngine.js';
import { TurnTimer } from './timer.js';

export class GameController {
  constructor(ui, board) {
    this.ui = ui;
    this.board = board;
    this.engine = new GameEngine({ rows: 6, cols: 6 });
    this.isTransitioning = false;

    // Initialize Turn Timer (20 Seconds)
    this.timer = new TurnTimer({
      durationSec: 20,
      onTick: (data) => {
        this.ui.updateTimer(data);
        // Play subtle warning tick on final 3 seconds (3, 2, 1) when second changes
        if (data.secondChanged && data.seconds <= 3 && data.seconds > 0) {
          audio.playTimerTick(data.seconds === 1);
        }
      },
      onTimeout: () => {
        this.handleTimeout();
      }
    });
  }

  /**
   * Start a brand new local 2-player game
   */
  startGame() {
    this.isTransitioning = false;
    this.timer.stop();
    this.engine.reset();

    const state = this.engine.getState();
    this.board.init(state.rows, state.cols);
    this.board.updateState(state);
    this.ui.updateScores(0, 0);
    this.ui.updateTurn(1);
    this.ui.showScreen('game');

    // Start 20s countdown for Player 1
    this.timer.start();
  }

  /**
   * Handle board line click
   * @param {'h'|'v'} type
   * @param {number} row
   * @param {number} col
   */
  handleLineClick(type, row, col) {
    if (this.isTransitioning || this.engine.isGameOver) return;

    // Race condition protection: reject click if turn deadline has passed
    if (this.timer.isExpired()) {
      return;
    }

    const player = this.engine.currentPlayer;
    const res = this.engine.makeMove(player, type, row, col);

    if (!res.success) {
      // Invalid or already occupied line - keep timer running, do not penalize
      return;
    }

    // Stop current timer immediately once valid move is registered
    this.timer.stop();

    const { move, state } = res;

    // Handle audio & turn flow based on box completions
    if (move.completedBoxes && move.completedBoxes.length > 0) {
      audio.playBoxComplete(move.completedBoxes.length > 1);
    } else {
      audio.playConnect();
    }

    // Synchronize UI & Board
    this.board.updateState(state);
    this.ui.updateScores(state.scores[1], state.scores[2]);

    if (state.isGameOver) {
      this.timer.stop();
      this.board.setInteractive(false);
      this.ui.updateTurn(state.currentPlayer, true);

      setTimeout(() => {
        const isTie = state.winner === 'draw';
        audio.playGameOver(!isTie);
        this.ui.showGameOver(state);
      }, 500);
    } else {
      this.ui.updateTurn(state.currentPlayer);
      // Completing a box gives an extra turn AND fresh 20 seconds.
      // Normal move passes turn to other player AND gives fresh 20 seconds.
      this.timer.start();
    }
  }

  /**
   * Handle 20s timer expiration
   */
  handleTimeout() {
    if (this.engine.isGameOver || this.isTransitioning) return;

    this.isTransitioning = true;
    this.board.setInteractive(false);
    audio.playTimeout();

    // Show "TIME'S UP!" alert briefly, then transition to next player
    this.ui.showTimeUpAlert(() => {
      if (this.engine.isGameOver) {
        this.isTransitioning = false;
        return;
      }

      this.engine.passTurn();
      const state = this.engine.getState();

      this.board.updateState(state);
      this.ui.updateTurn(state.currentPlayer);
      this.isTransitioning = false;
      this.board.setInteractive(true);

      // Start fresh 20 seconds for the next player
      this.timer.start();
    });
  }

  /**
   * Restart game
   */
  restartGame() {
    this.ui.hideGameOver();
    this.startGame();
  }

  /**
   * Return to start screen
   */
  goToHome() {
    this.timer.stop();
    this.ui.hideGameOver();
    this.ui.showScreen('start');
  }
}
