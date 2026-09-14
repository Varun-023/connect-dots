/**
 * GameEngine - Deterministic Client-Side Dots & Boxes Game Logic
 * Provides authoritative game rules, grid state management, and score tracking.
 */
export class GameEngine {
  constructor(options = {}) {
    this.rows = options.rows || 6; // Number of dots vertically (default 6)
    this.cols = options.cols || 6; // Number of dots horizontally (default 6)
    this.totalBoxes = (this.rows - 1) * (this.cols - 1); // 5 * 5 = 25 boxes
    this.reset();
  }

  reset() {
    // horizontalLines[r][c]: r in [0, rows-1], c in [0, cols-2]
    // Value is null or player number (1 or 2)
    this.horizontalLines = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols - 1 }, () => null)
    );

    // verticalLines[r][c]: r in [0, rows-2], c in [0, cols-1]
    // Value is null or player number (1 or 2)
    this.verticalLines = Array.from({ length: this.rows - 1 }, () =>
      Array.from({ length: this.cols }, () => null)
    );

    // boxes[r][c]: r in [0, rows-2], c in [0, cols-2]
    // Value is null or player number (1 or 2)
    this.boxes = Array.from({ length: this.rows - 1 }, () =>
      Array.from({ length: this.cols - 1 }, () => null)
    );

    this.currentPlayer = 1; // 1 = Red (Player 1), 2 = Blue (Player 2)
    this.scores = { 1: 0, 2: 0 };
    this.moveHistory = [];
    this.isGameOver = false;
    this.winner = null; // 1, 2, 'draw', or null
    this.lastMove = null;
  }

  /**
   * Validate if a move coordinate is within grid bounds and not yet occupied
   * @param {'h'|'v'} type - 'h' for horizontal, 'v' for vertical
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean}
   */
  isValidMove(type, row, col) {
    if (this.isGameOver) return false;
    if (type !== 'h' && type !== 'v') return false;

    if (type === 'h') {
      if (row < 0 || row >= this.rows || col < 0 || col >= this.cols - 1) {
        return false;
      }
      return this.horizontalLines[row][col] === null;
    } else {
      if (row < 0 || row >= this.rows - 1 || col < 0 || col >= this.cols) {
        return false;
      }
      return this.verticalLines[row][col] === null;
    }
  }

  /**
   * Check if box at (r, c) is fully enclosed by 4 drawn lines
   * @param {number} r - Row index
   * @param {number} c - Column index
   * @returns {boolean}
   */
  isBoxCompleted(r, c) {
    if (r < 0 || r >= this.rows - 1 || c < 0 || c >= this.cols - 1) {
      return false;
    }
    const top = this.horizontalLines[r][c] !== null;
    const bottom = this.horizontalLines[r + 1][c] !== null;
    const left = this.verticalLines[r][c] !== null;
    const right = this.verticalLines[r][c + 1] !== null;
    return top && bottom && left && right;
  }

  /**
   * Attempt to make a move by a player
   * @param {number} player - Player attempting the move (1 or 2)
   * @param {'h'|'v'} type - Line type ('h' for horizontal, 'v' for vertical)
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {object} Result object containing success status, completed boxes, extraTurn, etc.
   */
  makeMove(player, type, row, col) {
    if (this.isGameOver) {
      return { success: false, error: 'Game is already over' };
    }

    if (player !== this.currentPlayer) {
      return { success: false, error: 'Not your turn' };
    }

    if (!this.isValidMove(type, row, col)) {
      return { success: false, error: 'Invalid or already occupied line' };
    }

    // Apply the line
    if (type === 'h') {
      this.horizontalLines[row][col] = player;
    } else {
      this.verticalLines[row][col] = player;
    }

    const completedBoxes = [];

    // Check adjacent boxes that could be completed by this line
    if (type === 'h') {
      // Box above (row - 1, col)
      if (row > 0 && this.boxes[row - 1][col] === null && this.isBoxCompleted(row - 1, col)) {
        this.boxes[row - 1][col] = player;
        this.scores[player]++;
        completedBoxes.push({ row: row - 1, col });
      }
      // Box below (row, col)
      if (row < this.rows - 1 && this.boxes[row][col] === null && this.isBoxCompleted(row, col)) {
        this.boxes[row][col] = player;
        this.scores[player]++;
        completedBoxes.push({ row, col });
      }
    } else {
      // Box to the left (row, col - 1)
      if (col > 0 && this.boxes[row][col - 1] === null && this.isBoxCompleted(row, col - 1)) {
        this.boxes[row][col - 1] = player;
        this.scores[player]++;
        completedBoxes.push({ row, col: col - 1 });
      }
      // Box to the right (row, col)
      if (col < this.cols - 1 && this.boxes[row][col] === null && this.isBoxCompleted(row, col)) {
        this.boxes[row][col] = player;
        this.scores[player]++;
        completedBoxes.push({ row, col });
      }
    }

    const boxCaptured = completedBoxes.length > 0;
    const previousPlayer = this.currentPlayer;

    // Turn rule: If a box was completed, player gets another turn. Otherwise, pass turn.
    if (!boxCaptured) {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    // Check game completion
    const totalCaptured = this.scores[1] + this.scores[2];
    if (totalCaptured === this.totalBoxes) {
      this.isGameOver = true;
      if (this.scores[1] > this.scores[2]) {
        this.winner = 1;
      } else if (this.scores[2] > this.scores[1]) {
        this.winner = 2;
      } else {
        this.winner = 'draw';
      }
    }

    this.lastMove = {
      player: previousPlayer,
      type,
      row,
      col,
      completedBoxes,
      extraTurn: boxCaptured
    };

    this.moveHistory.push(this.lastMove);

    return {
      success: true,
      move: this.lastMove,
      state: this.getState()
    };
  }

  /**
   * Force switch the current turn (used on turn timer timeout)
   * @returns {object} Updated game state
   */
  passTurn() {
    if (this.isGameOver) return this.getState();
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    return this.getState();
  }

  /**
   * Get the complete serialized state of the board
   */
  getState() {
    return {
      rows: this.rows,
      cols: this.cols,
      totalBoxes: this.totalBoxes,
      horizontalLines: this.horizontalLines.map(r => [...r]),
      verticalLines: this.verticalLines.map(r => [...r]),
      boxes: this.boxes.map(r => [...r]),
      currentPlayer: this.currentPlayer,
      scores: { ...this.scores },
      isGameOver: this.isGameOver,
      winner: this.winner,
      lastMove: this.lastMove ? { ...this.lastMove } : null
    };
  }
}
