const tetrisManager = new TetrisManager(document);

// Create two local players
const player1 = tetrisManager.createPlayer();
const player2 = tetrisManager.createPlayer();

player1.element.classList.add('local');
player2.element.classList.add('local');

// Logger
const logger = new GameLogger();

// Game State
let p1Wins = 0;
let p2Wins = 0;

function updateWinCounters() {
    const winSpans = document.querySelectorAll('.wins');
    if (winSpans.length >= 2) {
        winSpans[0].innerText = p1Wins; // Assuming P1 is first in DOM order
        winSpans[1].innerText = p2Wins;
    } else if (winSpans.length === 1) {
        // Fallback if template logic is tricky, but currently we have 2 instances of template.
        // Wait, tetrisManager clones template. The .wins span is inside .mid-column of each clone.
        // So P1's span shows P1 wins, P2's span shows P2 wins.
        // BUT, currently both say "Wins: 0". We should probably just show the relevant player's wins or both.
        // Let's assume left board is P1 and right is P2.
        // Actually, let's just update the spans inside each player's element.

        const p1Span = player1.element.querySelector('.wins');
        if (p1Span) p1Span.innerText = p1Wins;

        const p2Span = player2.element.querySelector('.wins');
        if (p2Span) p2Span.innerText = p2Wins;
    }
}

// Garbage Bridge
player1.player.events.listen('garbage', (amount) => {
    logger.log('GarbageSent', { from: 'P1', amount });
    player2.player.receiveIncomingAttack(amount);
});
player2.player.events.listen('garbage', (amount) => {
    logger.log('GarbageSent', { from: 'P2', amount });
    player1.player.receiveIncomingAttack(amount);
});

// Game Over Logic
const gameOverMenu = document.getElementById('game-over-menu');
const winnerText = document.getElementById('winner-text');

function handleGameOver(loserIndex) {
    // If one game ends, end both
    if (player1.gameOn) {
        player1.paused = true;
        player1.gameOn = false;
    }
    if (player2.gameOn) {
        player2.paused = true;
        player2.gameOn = false;
    }

    let winner = "";
    if (loserIndex === 1) { // P1 lost
        p2Wins++;
        winner = "Player 2 Wins!";
        logger.log('GameOver', { loser: 'P1', winner: 'P2' });
    } else { // P2 lost
        p1Wins++;
        winner = "Player 1 Wins!";
        logger.log('GameOver', { loser: 'P2', winner: 'P1' });
    }

    updateWinCounters();
    winnerText.innerText = winner;

    // Show Menu
    gameOverMenu.classList.remove('hidden');

    // Set focus to Next Round button for controller
    menuNavigator.setActiveMenu('gameover');
}

player1.player.events.listen('gameOver', () => {
    console.log("P1 Game Over Event Received");
    handleGameOver(1);
});
player2.player.events.listen('gameOver', () => {
    console.log("P2 Game Over Event Received");
    handleGameOver(2);
});

// Game Settings State
const gameSettings = {
    swapControllers: false,
    infiniteHold: true
};

// Menu Navigation System
const menuNavigator = {
    activeMenu: 'main', // main, pause, settings, gameover, null
    focusIndex: 0,

    menus: {
        main: ['btn-start'],
        pause: ['btn-resume', 'btn-settings', 'btn-restart', 'btn-quit'],
        settings: ['chk-swap-controllers', 'chk-infinite-hold', 'btn-download-logs', 'btn-back-settings'],
        gameover: ['btn-next-round', 'btn-quit-gameover']
    },

    setActiveMenu(menuName) {
        this.activeMenu = menuName;
        this.focusIndex = 0;
        this.updateFocus();
    },

    navigate(direction) { // -1 (up) or 1 (down)
        if (!this.activeMenu) return;

        const currentMenuButtons = this.menus[this.activeMenu];
        this.focusIndex += direction;

        if (this.focusIndex < 0) this.focusIndex = currentMenuButtons.length - 1;
        if (this.focusIndex >= currentMenuButtons.length) this.focusIndex = 0;

        this.updateFocus();
    },

    trigger() {
        if (!this.activeMenu) return;
        const currentMenuButtons = this.menus[this.activeMenu];
        const btnId = currentMenuButtons[this.focusIndex];
        const btn = document.getElementById(btnId);
        if (btn) btn.click();
    },

    back() {
        if (this.activeMenu === 'settings') {
            document.getElementById('btn-back-settings').click();
        } else if (this.activeMenu === 'pause') {
            document.getElementById('btn-resume').click();
        }
        // Main and Game Over generally don't have "back" in the same way, but could implement if needed
    },

    updateFocus() {
        // Remove .selected from all buttons in current menu
        const currentMenuButtons = this.menus[this.activeMenu];
        currentMenuButtons.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('selected');
        });

        // Add .selected to focused button
        const focusedId = currentMenuButtons[this.focusIndex];
        const focusedEl = document.getElementById(focusedId);
        if (focusedEl) focusedEl.classList.add('selected');
    }
};


// Input Handling (Keyboard)
const keyListener = (event) => {
    if (event.type !== 'keydown') return;

    // Menu Navigation via Keyboard (WASD or Arrows for navigating menus when active)
    if (menuNavigator.activeMenu) {
        if (!event.repeat) {
            if (event.code === 'ArrowUp' || event.code === 'KeyW') {
                menuNavigator.navigate(-1);
            } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
                menuNavigator.navigate(1);
            } else if (event.code === 'Enter' || event.code === 'Space') {
                menuNavigator.trigger();
            } else if (event.code === 'Escape' || event.code === 'Backspace') {
                menuNavigator.back();
            }
        }
        return; // Don't process game inputs if menu is open
    }

    // Global Pause
    if (!event.repeat && event.code === 'Escape') {
        togglePauseMenu();
        return;
    }

    // Player 1 Controls
    if (player1.gameOn && !player1.paused) {
        if (event.code === 'KeyA') {
            player1.player.move(-1);
        } else if (event.code === 'KeyD') {
            player1.player.move(1);
        } else if (event.code === 'KeyS') {
            player1.player.drop();
        }

        if (!event.repeat) {
            if (event.code === 'KeyQ') {
                player1.player.rotate(-1);
            } else if (event.code === 'KeyE') {
                player1.player.rotate(1);
            } else if (event.code === 'KeyW') {
                player1.player.hardDrop();
            } else if (event.code === 'ShiftLeft') {
                player1.player.hold();
            }
        }
    }

    // Player 2 Controls
    if (player2.gameOn && !player2.paused) {
        if (event.code === 'ArrowLeft') {
            player2.player.move(-1);
        } else if (event.code === 'ArrowRight') {
            player2.player.move(1);
        } else if (event.code === 'ArrowDown') {
            player2.player.drop();
        }

        if (!event.repeat) {
            if (event.code === 'Comma' || event.code === 'Numpad1') {
                player2.player.rotate(-1);
            } else if (event.code === 'Period' || event.code === 'Numpad2') {
                player2.player.rotate(1);
            } else if (event.code === 'ArrowUp') {
                player2.player.hardDrop();
            } else if (event.code === 'ShiftRight' || event.code === 'Enter') {
                player2.player.hold();
            }
        }
    }
};

document.addEventListener('keydown', keyListener);

// Menu DOM Elements
const menuOverlay = document.getElementById('menu-overlay');
const startButton = document.getElementById('btn-start');

startButton.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
    menuNavigator.activeMenu = null; // Game is active
    logger.log('GameStarted');

    // Start both games if not already running
    if (!player1.gameOn) player1.startGame();
    if (!player2.gameOn) player2.startGame();

    // If paused, unpause
    if (player1.paused) player1.togglePaused();
    if (player2.paused) player2.togglePaused();
});

// Pause & Settings Menu Logic
const pauseMenu = document.getElementById('pause-menu');
const settingsMenu = document.getElementById('settings-menu');

const btnResume = document.getElementById('btn-resume');
const btnSettings = document.getElementById('btn-settings');
const btnRestart = document.getElementById('btn-restart');
const btnQuit = document.getElementById('btn-quit');

const btnBackSettings = document.getElementById('btn-back-settings');
const btnDownloadLogs = document.getElementById('btn-download-logs');
const chkSwapControllers = document.getElementById('chk-swap-controllers');
const chkInfiniteHold = document.getElementById('chk-infinite-hold');

// Game Over Logic
const btnNextRound = document.getElementById('btn-next-round');
const btnQuitGameOver = document.getElementById('btn-quit-gameover');

// Init Settings UI
chkSwapControllers.checked = gameSettings.swapControllers;
chkInfiniteHold.checked = gameSettings.infiniteHold;

// Apply initial settings
updateInfiniteHold();

function togglePauseMenu() {
    if (pauseMenu.classList.contains('hidden')) {
        // Pause Game
        if (!player1.paused) player1.togglePaused();
        if (!player2.paused) player2.togglePaused();
        pauseMenu.classList.remove('hidden');
        menuNavigator.setActiveMenu('pause');
    } else {
        // Resume Game
        if (player1.paused) player1.togglePaused();
        if (player2.paused) player2.togglePaused();
        pauseMenu.classList.add('hidden');
        menuNavigator.activeMenu = null;
    }
}

function updateInfiniteHold() {
    player1.player.infiniteHold = gameSettings.infiniteHold;
    player2.player.infiniteHold = gameSettings.infiniteHold;
}

btnResume.addEventListener('click', () => {
    togglePauseMenu();
});

btnSettings.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    settingsMenu.classList.remove('hidden');
    menuNavigator.setActiveMenu('settings');
});

btnBackSettings.addEventListener('click', () => {
    settingsMenu.classList.add('hidden');
    pauseMenu.classList.remove('hidden');
    menuNavigator.setActiveMenu('pause');
});

btnRestart.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    logger.clear();
    logger.log('GameRestarted');
    player1.startGame();
    player2.startGame();
    menuNavigator.activeMenu = null;
});

btnQuit.addEventListener('click', () => {
    location.reload();
});

btnDownloadLogs.addEventListener('click', () => {
    logger.download();
});

chkSwapControllers.addEventListener('change', (e) => {
    gameSettings.swapControllers = e.target.checked;
});

chkInfiniteHold.addEventListener('change', (e) => {
    gameSettings.infiniteHold = e.target.checked;
    updateInfiniteHold();
});

btnNextRound.addEventListener('click', () => {
    gameOverMenu.classList.add('hidden');
    logger.log('NextRoundStarted');
    player1.startGame();
    player2.startGame();
    menuNavigator.activeMenu = null;
});

btnQuitGameOver.addEventListener('click', () => {
    location.reload();
});

function playMusic() {
  const sound = document.createElement("audio");
  sound.src = "audio/awesome-awesome-tetris-remix.mp3";
  sound.setAttribute("preload", "auto");
  sound.setAttribute("controls", "none");
  sound.loop = true;
  sound.style.display = "none";
  document.body.appendChild(sound);
  sound.play();
}

// Controller Support
const inputState = {
    0: { lastMove: 0, nextMoveTime: 0, lastDrop: 0, nextDropTime: 0, lastInputTime: 0, buttons: {} },
    1: { lastMove: 0, nextMoveTime: 0, lastDrop: 0, nextDropTime: 0, lastInputTime: 0, buttons: {} }
};

const DAS_DELAY = 160;
const ARR_DELAY = 50;
const MENU_REPEAT_DELAY = 200; // Slower repeat for menu nav

function pollGamepads() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
        requestAnimationFrame(pollGamepads);
        return;
    }

    // Check for Menu Navigation First
    // Any controller can navigate menus
    let menuHandled = false;
    if (menuNavigator.activeMenu) {
        // Check both gamepads for menu input
        for (let i = 0; i < 2; i++) {
            if (gamepads[i]) {
                if (handleMenuInput(gamepads[i], i)) {
                    menuHandled = true;
                }
            }
        }
    }

    if (menuHandled) {
        requestAnimationFrame(pollGamepads);
        return;
    }

    // Determine controller mapping based on Swap Setting
    let p1Gamepad = gamepads[0];
    let p2Gamepad = gamepads[1];

    if (gameSettings.swapControllers) {
        p1Gamepad = gamepads[1];
        p2Gamepad = gamepads[0];
    }

    if (gamepads[0]) {
        const targetPlayer = gameSettings.swapControllers ? player2 : player1;
        handleGamepadInput(gamepads[0], targetPlayer, 0);
    }

    if (gamepads[1]) {
        const targetPlayer = gameSettings.swapControllers ? player1 : player2;
        handleGamepadInput(gamepads[1], targetPlayer, 1);
    }

    requestAnimationFrame(pollGamepads);
}

function handleMenuInput(gp, index) {
    const state = inputState[index];
    const now = Date.now();
    const btns = gp.buttons;
    const axes = gp.axes;
    const axisThreshold = 0.5;

    // Mapping for Menu:
    // D-Pad Up (12) / Stick Up -> Navigate Up
    // D-Pad Down (13) / Stick Down -> Navigate Down
    // A (0) -> Trigger/Select
    // B (1) -> Back
    // Start (9) -> Toggle Pause (if in game)

    const up = (btns[12] && btns[12].pressed) || (axes[1] && axes[1] < -axisThreshold);
    const down = (btns[13] && btns[13].pressed) || (axes[1] && axes[1] > axisThreshold);
    const select = btns[0] && btns[0].pressed;
    const back = btns[1] && btns[1].pressed;

    // Simple throttling for menu nav
    if (now - state.lastInputTime < MENU_REPEAT_DELAY) return false;

    let handled = false;
    if (up) {
        menuNavigator.navigate(-1);
        state.lastInputTime = now;
        handled = true;
    } else if (down) {
        menuNavigator.navigate(1);
        state.lastInputTime = now;
        handled = true;
    } else if (select && !state.buttons.select) { // Single press
        menuNavigator.trigger();
        state.lastInputTime = now;
        handled = true;
    } else if (back && !state.buttons.back) { // Single press
        menuNavigator.back();
        state.lastInputTime = now;
        handled = true;
    }

    // Update button state to prevent repeat on select/back
    state.buttons.select = select;
    state.buttons.back = back;

    return handled;
}

function handleGamepadInput(gp, player, index) {
    const state = inputState[index];
    const now = Date.now();

    const btns = gp.buttons;
    const axes = gp.axes;
    const axisThreshold = 0.5;

    const currentButtons = {
        left: (btns[14] && btns[14].pressed) || (axes[0] && axes[0] < -axisThreshold),
        right: (btns[15] && btns[15].pressed) || (axes[0] && axes[0] > axisThreshold),
        down: (btns[13] && btns[13].pressed) || (axes[1] && axes[1] > axisThreshold),
        up: (btns[12] && btns[12].pressed) || (axes[1] && axes[1] < -axisThreshold) || (btns[3] && btns[3].pressed),
        rotR: btns[1] && btns[1].pressed,
        rotL: btns[0] && btns[0].pressed,
        hold: (btns[5] && btns[5].pressed) || (btns[4] && btns[4].pressed),
        start: btns[9] && btns[9].pressed
    };

    // Global Pause
    if (currentButtons.start && !state.buttons.start) {
        togglePauseMenu();
        // Return immediately so we don't process other inputs this frame
        state.buttons = currentButtons;
        return;
    }

    if (!player.gameOn || player.paused) {
        state.buttons = currentButtons;
        return;
    }

    if (currentButtons.rotR && !state.buttons.rotR) player.player.rotate(1);
    if (currentButtons.rotL && !state.buttons.rotL) player.player.rotate(-1);
    if (currentButtons.hold && !state.buttons.hold) player.player.hold();
    if (currentButtons.up && !state.buttons.up) player.player.hardDrop();

    if (currentButtons.left) {
        if (!state.buttons.left) {
            player.player.move(-1);
            state.nextMoveTime = now + DAS_DELAY;
        } else if (now > state.nextMoveTime) {
            player.player.move(-1);
            state.nextMoveTime = now + ARR_DELAY;
        }
    } else if (currentButtons.right) {
        if (!state.buttons.right) {
            player.player.move(1);
            state.nextMoveTime = now + DAS_DELAY;
        } else if (now > state.nextMoveTime) {
            player.player.move(1);
            state.nextMoveTime = now + ARR_DELAY;
        }
    }

    if (currentButtons.down) {
         if (now > state.nextDropTime) {
            player.player.drop();
            state.nextDropTime = now + 50;
        }
    }

    state.buttons = currentButtons;
}

requestAnimationFrame(pollGamepads);
