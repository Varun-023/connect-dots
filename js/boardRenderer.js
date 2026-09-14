/**
 * BoardRenderer - Renders and manages interactive SVG Dots & Boxes grid.
 * Supports dynamic player previews, generous touch targets, and smooth CSS animations.
 */
export class BoardRenderer {
  constructor(containerElement, onLineSelected) {
    this.container = containerElement;
    this.onLineSelected = onLineSelected;
    this.svg = null;
    this.svgSize = 500;
    this.padding = 40;
    this.rows = 6;
    this.cols = 6;
    this.spacing = (this.svgSize - 2 * this.padding) / (this.cols - 1); // 84px for 6x6
    this.activePlayer = 1;
    this.isInteractive = true;
    this.lastState = null;
  }

  /**
   * Initialize SVG board structure
   */
  init(rows = 6, cols = 6) {
    this.rows = rows;
    this.cols = cols;
    this.spacing = (this.svgSize - 2 * this.padding) / (this.cols - 1);
    this.container.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${this.svgSize} ${this.svgSize}`);
    svg.setAttribute('class', 'dots-svg-board');
    svg.setAttribute('id', 'game-board-svg');

    // Layer 1: Boxes (bottom layer)
    const boxesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    boxesGroup.setAttribute('id', 'layer-boxes');
    svg.appendChild(boxesGroup);

    // Layer 2: Visual Lines & Previews
    const linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    linesGroup.setAttribute('id', 'layer-lines');
    svg.appendChild(linesGroup);

    // Layer 3: Invisible Hitboxes (top layer for effortless touch interactions)
    const hitboxesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    hitboxesGroup.setAttribute('id', 'layer-hitboxes');
    svg.appendChild(hitboxesGroup);

    // Layer 4: Dots (top visual layer)
    const dotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dotsGroup.setAttribute('id', 'layer-dots');
    svg.appendChild(dotsGroup);

    // 1. Create Box Elements (rows-1 x cols-1)
    for (let r = 0; r < this.rows - 1; r++) {
      for (let c = 0; c < this.cols - 1; c++) {
        const x = this.padding + c * this.spacing + 4;
        const y = this.padding + r * this.spacing + 4;
        const size = this.spacing - 8;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('class', 'board-box');
        rect.setAttribute('id', `box-${r}-${c}`);
        rect.setAttribute('fill', 'transparent');
        boxesGroup.appendChild(rect);

        // Box label text (e.g. P1 / P2)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + size / 2);
        text.setAttribute('y', y + size / 2);
        text.setAttribute('class', 'box-label hidden');
        text.setAttribute('id', `box-label-${r}-${c}`);
        boxesGroup.appendChild(text);
      }
    }

    // 2. Create Horizontal Lines
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 1; c++) {
        const x1 = this.padding + c * this.spacing;
        const y1 = this.padding + r * this.spacing;
        const x2 = this.padding + (c + 1) * this.spacing;
        const y2 = y1;

        // Visual Line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'transparent');
        line.setAttribute('stroke-width', '5');
        line.setAttribute('class', 'board-line');
        line.setAttribute('id', `line-h-${r}-${c}`);
        linesGroup.appendChild(line);

        // Preview Line
        const preview = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        preview.setAttribute('x1', x1);
        preview.setAttribute('y1', y1);
        preview.setAttribute('x2', x2);
        preview.setAttribute('y2', y2);
        preview.setAttribute('stroke-width', '4');
        preview.setAttribute('class', 'line-preview');
        preview.setAttribute('id', `preview-h-${r}-${c}`);
        linesGroup.appendChild(preview);

        // Hitbox (generous 32px touch target)
        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hitbox.setAttribute('x1', x1);
        hitbox.setAttribute('y1', y1);
        hitbox.setAttribute('x2', x2);
        hitbox.setAttribute('y2', y2);
        hitbox.setAttribute('stroke-width', '32');
        hitbox.setAttribute('class', 'line-hitbox clickable');
        hitbox.setAttribute('id', `hit-h-${r}-${c}`);

        hitbox.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleLineClick('h', r, c);
        });

        // Hover events for preview styling
        hitbox.addEventListener('mouseenter', () => this.showPreview('h', r, c));
        hitbox.addEventListener('mouseleave', () => this.hidePreview('h', r, c));

        hitboxesGroup.appendChild(hitbox);
      }
    }

    // 3. Create Vertical Lines
    for (let r = 0; r < this.rows - 1; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x1 = this.padding + c * this.spacing;
        const y1 = this.padding + r * this.spacing;
        const x2 = x1;
        const y2 = this.padding + (r + 1) * this.spacing;

        // Visual Line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'transparent');
        line.setAttribute('stroke-width', '5');
        line.setAttribute('class', 'board-line');
        line.setAttribute('id', `line-v-${r}-${c}`);
        linesGroup.appendChild(line);

        // Preview Line
        const preview = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        preview.setAttribute('x1', x1);
        preview.setAttribute('y1', y1);
        preview.setAttribute('x2', x2);
        preview.setAttribute('y2', y2);
        preview.setAttribute('stroke-width', '4');
        preview.setAttribute('class', 'line-preview');
        preview.setAttribute('id', `preview-v-${r}-${c}`);
        linesGroup.appendChild(preview);

        // Hitbox
        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hitbox.setAttribute('x1', x1);
        hitbox.setAttribute('y1', y1);
        hitbox.setAttribute('x2', x2);
        hitbox.setAttribute('y2', y2);
        hitbox.setAttribute('stroke-width', '32');
        hitbox.setAttribute('class', 'line-hitbox clickable');
        hitbox.setAttribute('id', `hit-v-${r}-${c}`);

        hitbox.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleLineClick('v', r, c);
        });

        hitbox.addEventListener('mouseenter', () => this.showPreview('v', r, c));
        hitbox.addEventListener('mouseleave', () => this.hidePreview('v', r, c));

        hitboxesGroup.appendChild(hitbox);
      }
    }

    // 4. Create Dots
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cx = this.padding + c * this.spacing;
        const cy = this.padding + r * this.spacing;

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', '6');
        dot.setAttribute('class', 'board-dot');
        dot.setAttribute('id', `dot-${r}-${c}`);
        dotsGroup.appendChild(dot);
      }
    }

    this.svg = svg;
    this.container.appendChild(svg);
  }

  setInteractive(isInteractive) {
    this.isInteractive = isInteractive;
  }

  setActivePlayer(playerNumber) {
    this.activePlayer = playerNumber;
  }

  showPreview(type, row, col) {
    if (!this.isInteractive) return;
    const preview = this.svg?.querySelector(`#preview-${type}-${row}-${col}`);
    if (preview && !preview.classList.contains('drawn')) {
      const color = this.activePlayer === 1 ? '#EF4444' : '#3B82F6';
      preview.setAttribute('stroke', color);
      preview.style.opacity = '0.7';
    }
  }

  hidePreview(type, row, col) {
    const preview = this.svg?.querySelector(`#preview-${type}-${row}-${col}`);
    if (preview) {
      preview.style.opacity = '0';
    }
  }

  handleLineClick(type, row, col) {
    if (!this.isInteractive) return;
    if (typeof this.onLineSelected === 'function') {
      this.onLineSelected(type, row, col);
    }
  }

  /**
   * Synchronize board UI with game engine state
   * @param {object} state
   */
  updateState(state) {
    this.lastState = state;
    this.activePlayer = state.currentPlayer;
    this.isInteractive = !state.isGameOver;

    // Update Horizontal Lines
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols - 1; c++) {
        const player = state.horizontalLines[r][c];
        const lineEl = this.svg?.querySelector(`#line-h-${r}-${c}`);
        const hitEl = this.svg?.querySelector(`#hit-h-${r}-${c}`);
        const previewEl = this.svg?.querySelector(`#preview-h-${r}-${c}`);

        if (player !== null && lineEl) {
          lineEl.classList.remove('line-p1', 'line-p2');
          lineEl.classList.add(player === 1 ? 'line-p1' : 'line-p2');
          if (hitEl) hitEl.classList.remove('clickable');
          if (previewEl) previewEl.classList.add('drawn');
        } else if (hitEl) {
          if (this.isInteractive) {
            hitEl.classList.add('clickable');
          } else {
            hitEl.classList.remove('clickable');
          }
        }
      }
    }

    // Update Vertical Lines
    for (let r = 0; r < state.rows - 1; r++) {
      for (let c = 0; c < state.cols; c++) {
        const player = state.verticalLines[r][c];
        const lineEl = this.svg?.querySelector(`#line-v-${r}-${c}`);
        const hitEl = this.svg?.querySelector(`#hit-v-${r}-${c}`);
        const previewEl = this.svg?.querySelector(`#preview-v-${r}-${c}`);

        if (player !== null && lineEl) {
          lineEl.classList.remove('line-p1', 'line-p2');
          lineEl.classList.add(player === 1 ? 'line-p1' : 'line-p2');
          if (hitEl) hitEl.classList.remove('clickable');
          if (previewEl) previewEl.classList.add('drawn');
        } else if (hitEl) {
          if (this.isInteractive) {
            hitEl.classList.add('clickable');
          } else {
            hitEl.classList.remove('clickable');
          }
        }
      }
    }

    // Update Boxes
    for (let r = 0; r < state.rows - 1; r++) {
      for (let c = 0; c < state.cols - 1; c++) {
        const owner = state.boxes[r][c];
        const boxEl = this.svg?.querySelector(`#box-${r}-${c}`);
        const labelEl = this.svg?.querySelector(`#box-label-${r}-${c}`);

        if (owner !== null && boxEl && !boxEl.classList.contains(`box-p${owner}`)) {
          boxEl.classList.remove('box-p1', 'box-p2', 'box-pop');
          boxEl.classList.add(`box-p${owner}`, 'box-pop');

          if (labelEl) {
            labelEl.textContent = `P${owner}`;
            labelEl.classList.remove('hidden', 'box-label-p1', 'box-label-p2');
            labelEl.classList.add(`box-label-p${owner}`);
          }
        }
      }
    }
  }
}
