![image of the game in action](images/preview.png)
# Tetris Local Co-op

This is a **Local Multiplayer (Couch Co-op)** fork of the original Puyo Puyo Tetris II clone. It is designed to be played on a single screen by two players sitting side-by-side.

## Features

- **Local 2-Player Mode:** Two game boards on one screen. No internet required.
- **Controller Support:** Full Gamepad API integration for Xbox/PlayStation controllers.
- **Garbage Bridge:** Clearing lines sends garbage to your opponent instantly.
- **Menu System:** Integrated start screen and pause menu.

## Setup & Play

### Online (GitHub Pages)
Simply navigate to the GitHub Pages URL for this repository.

### Local Development
1. Clone the repository.
2. Run `npm install` to install the simple static server.
3. Run `npm start`.
4. Open `http://localhost:9000` in your browser.

## Controls

| Action | Player 1 (Keyboard) | Player 2 (Keyboard) | Controller |
| --- | --- | --- | --- |
| **Move Left** | A | Left Arrow | D-Pad Left / Stick Left |
| **Move Right** | D | Right Arrow | D-Pad Right / Stick Right |
| **Soft Drop** | S | Down Arrow | D-Pad Down / Stick Down |
| **Hard Drop** | W | Up Arrow | Y / Triangle / D-Pad Up |
| **Rotate Left** | Q | Numpad 1 / Comma | B / Circle |
| **Rotate Right** | E | Numpad 2 / Period | A / Cross |
| **Hold** | Shift | Enter / Numpad 0 | LB / X / Square |
| **Pause** | Esc | Esc | Start |

## Scoring
| # of Lines Cleared | Points | Garbage Lines Sent |
| --- | --- | --- |
| 1 line | 100 pts | 0 lines |
| 2 lines | 300 pts | 1 line |
| 3 lines | 500 pts |  2 lines |
| 4 lines (Tetris) | 800 pts |  4 lines |

*Note: Both Hard and Soft Drop earns you 1pt per "step" downward.*

## Credits
Based on the original work by [lsamano](https://github.com/lsamano/puyo-puyo-tetris-ii).
Forked and modified for Local Co-op.
