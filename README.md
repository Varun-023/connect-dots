# 🔴🔵 Connect Dots

A simple and fun two-player **Dots & Boxes** style game that can be played locally on the same device.

Connect the dots, complete boxes, and capture as many boxes as possible to win!

## 🎮 Play the Game

The game is designed as a lightweight web game that can be hosted using GitHub Pages.

🌐 **Live Demo:**  

The game will be available here after GitHub Pages is enabled:

https://Varun-023.github.io/connect-dots/

## ✨ Features

- 👥 Two-player local multiplayer
- 🔴 Player 1 — Red
- 🔵 Player 2 — Blue
- 📐 6 × 6 dot grid
- 🟦 25 playable boxes
- ⏱️ 20-second timer for every turn
- 🔄 Automatic turn switching after timeout
- 🎯 Completing a box gives the player another turn
- 🏆 Automatic winner detection
- 🤝 Draw detection
- 🔊 Sound effects
- 🎵 Background music
- 🔇 Independent Music and SFX controls
- 📱 Responsive design for desktop and mobile
- 🌐 Can be accessed through a public web URL
- 💻 Gameplay works locally on the same device

---

## 🕹️ How to Play

### 1. Start the Game

Open the game and start a two-player match.

### 2. Connect Two Adjacent Dots

Players take turns drawing a line between two horizontally or vertically adjacent dots.

Diagonal lines are not allowed.

### 3. Complete a Box

If your line completes the fourth side of a box, you capture that box.

The captured box is marked with your player color.

### 4. Get Another Turn

When you complete a box, you immediately get another turn.

If one move completes multiple boxes, you capture all of them and continue playing.

### 5. Timer

Each turn has a **20-second time limit**.

If the player does not make a valid move before the timer expires:

- The turn ends.
- No line is added.
- No box is captured.
- The turn passes to the other player.
- The new player receives a fresh 20 seconds.

### 6. Win the Game

The game ends when all **25 boxes** have been captured.

The player with the most boxes wins.

If both players have the same number of boxes, the game ends in a draw.

---

## 📋 Game Rules

| Rule | Description |
|------|-------------|
| Players | 2 |
| Grid | 6 × 6 dots |
| Boxes | 25 |
| Player 1 | Red |
| Player 2 | Blue |
| Turn Timer | 20 seconds |
| Line Direction | Horizontal / Vertical |
| Diagonal Lines | Not allowed |
| Reusing Lines | Not allowed |
| Box Completion | Player captures the box |
| Extra Turn | Yes, after completing a box |
| Game End | All boxes captured |

---

## 🎯 Objective

Capture more boxes than your opponent.

A player does **not** need to draw the first three sides of a box to capture it.

The player who draws the **fourth and final side** captures the box.

For example:

```text
●────●
│    │
│    │
●────●
