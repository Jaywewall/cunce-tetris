const tetrisManager = new TetrisManager(document);

// Create two local players
const player1 = tetrisManager.createPlayer();
const player2 = tetrisManager.createPlayer();

player1.element.classList.add('local');
player2.element.classList.add('local');

// Logger
const logger = new GameLogger();

// Garbage Bridge
player1.player.events.listen('garbage', (amount) => {
    logger.log(`Player 1 sent ${amount} lines of garbage.`);
    player2.player.receiveIncomingAttack(amount);
});
player2.player.events.listen('garbage', (amount) => {
    logger.log(`Player 2 sent ${amount} lines of garbage.`);
    player1.player.receiveIncomingAttack(amount);
});

// Game Settings State
const gameSettings = {
    swapControllers: false,
    infiniteHold: true
};

// Input Handling (Keyboard)
const keyListener = (event) => {
    if (event.type !== 'keydown') return;

    const menuOverlay = document.getElementById('menu-overlay');
    const pauseMenu = document.getElementById('pause-menu');
    const settingsMenu = document.getElementById('settings-menu');

    // Main Menu Navigation
    if (!menuOverlay.classList.contains('hidden')) {
        if (!event.repeat && (event.code === 'Enter' || event.code === 'Space')) {
            document.getElementById('btn-start').click();
        }
        return;
    }

    // Settings Menu Navigation
    if (!settingsMenu.classList.contains('hidden')) {
        if (!event.repeat && (event.code === 'Escape')) {
             document.getElementById('btn-back-settings').click();
        }
        return;
    }

    // Pause Menu Navigation
    if (!pauseMenu.classList.contains('hidden')) {
         if (!event.repeat && (event.code === 'Escape')) {
             document.getElementById('btn-resume').click();
         }
         return;
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

// Menu Logic
const menuOverlay = document.getElementById('menu-overlay');
const startButton = document.getElementById('btn-start');

startButton.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
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
    } else {
        // Resume Game
        if (player1.paused) player1.togglePaused();
        if (player2.paused) player2.togglePaused();
        pauseMenu.classList.add('hidden');
    }
}

function updateInfiniteHold() {
    // This requires updating Player class logic.
    // We can inject this setting into the player instances directly or pass via TetrisManager,
    // but direct property assignment is easiest given the scope.
    player1.player.infiniteHold = gameSettings.infiniteHold;
    player2.player.infiniteHold = gameSettings.infiniteHold;
}

btnResume.addEventListener('click', () => {
    togglePauseMenu();
});

btnSettings.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    settingsMenu.classList.remove('hidden');
});

btnBackSettings.addEventListener('click', () => {
    settingsMenu.classList.add('hidden');
    pauseMenu.classList.remove('hidden');
});

btnRestart.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    logger.clear();
    player1.startGame();
    player2.startGame();
});

btnQuit.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
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
    0: { lastMove: 0, nextMoveTime: 0, lastDrop: 0, nextDropTime: 0, buttons: {} },
    1: { lastMove: 0, nextMoveTime: 0, lastDrop: 0, nextDropTime: 0, buttons: {} }
};

const DAS_DELAY = 160;
const ARR_DELAY = 50;

function pollGamepads() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
        requestAnimationFrame(pollGamepads);
        return;
    }

    // Determine controller mapping based on Swap Setting
    // If Swap is FALSE: GP0 -> P1, GP1 -> P2
    // If Swap is TRUE:  GP0 -> P2, GP1 -> P1

    let p1Gamepad = gamepads[0];
    let p2Gamepad = gamepads[1];

    if (gameSettings.swapControllers) {
        p1Gamepad = gamepads[1];
        p2Gamepad = gamepads[0];
    }

    // Process Inputs
    // Note: We use index 0/1 for state tracking still, but apply to swapped players if needed.
    // However, it's cleaner to track state by gamepad index (0/1) rather than player.
    // So if GP0 is P2, we use inputState[0] but apply actions to player2.

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

    // Global Pause / Menu Start
    if (currentButtons.start && !state.buttons.start) {
        if (!document.getElementById('menu-overlay').classList.contains('hidden')) {
             document.getElementById('btn-start').click();
        } else if (!document.getElementById('pause-menu').classList.contains('hidden')) {
             document.getElementById('btn-resume').click();
        } else if (!document.getElementById('settings-menu').classList.contains('hidden')) {
             document.getElementById('btn-back-settings').click();
        } else {
            togglePauseMenu();
        }
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
