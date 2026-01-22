const tetrisManager = new TetrisManager(document);

// Create two local players
const player1 = tetrisManager.createPlayer();
const player2 = tetrisManager.createPlayer();

player1.element.classList.add('local');
player2.element.classList.add('local');

// Garbage Bridge
player1.player.events.listen('garbage', (amount) => {
    player2.player.receiveIncomingAttack(amount);
});
player2.player.events.listen('garbage', (amount) => {
    player1.player.receiveIncomingAttack(amount);
});

// Input Handling (Keyboard)
const keyListener = (event) => {
    if (event.type !== 'keydown') return;

    const menuOverlay = document.getElementById('menu-overlay');
    const pauseMenu = document.getElementById('pause-menu');

    // Main Menu Navigation
    if (!menuOverlay.classList.contains('hidden')) {
        if (!event.repeat && (event.code === 'Enter' || event.code === 'Space')) {
            document.getElementById('btn-start').click();
        }
        return;
    }

    // Pause Menu Navigation (Simple for now: toggle pause on Esc)
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

    // playMusic();
});

// Pause Menu Logic
const pauseMenu = document.getElementById('pause-menu');
const btnResume = document.getElementById('btn-resume');
const btnSettings = document.getElementById('btn-settings');
const btnRestart = document.getElementById('btn-restart');
const btnQuit = document.getElementById('btn-quit');

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

btnResume.addEventListener('click', () => {
    togglePauseMenu();
});

btnSettings.addEventListener('click', () => {
    alert("Settings coming soon!");
});

btnRestart.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    player1.startGame();
    player2.startGame();
});

btnQuit.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    // Ideally we should reset game state here, but for now we just show main menu
    // And let Start Game handle restart or resume.
    // To properly quit, we might reload the page or implement a full reset.
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
    0: { lastMove: 0, nextMoveTime: 0, lastDrop: 0, nextDropTime: 0, buttons: {} },
    1: { lastMove: 0, nextMoveTime: 0, lastDrop: 0, nextDropTime: 0, buttons: {} }
};

const DAS_DELAY = 160; // Delay Auto Shift
const ARR_DELAY = 50;  // Auto Repeat Rate

function pollGamepads() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
        requestAnimationFrame(pollGamepads);
        return;
    }

    // Player 1 (Gamepad 0)
    if (gamepads[0]) handleGamepadInput(gamepads[0], player1, 0);
    // Player 2 (Gamepad 1)
    if (gamepads[1]) handleGamepadInput(gamepads[1], player2, 1);

    requestAnimationFrame(pollGamepads);
}

function handleGamepadInput(gp, player, index) {
    const state = inputState[index];
    const now = Date.now();

    // Mapping (Standard Xbox/DualShock)
    // 0: A/Cross, 1: B/Circle, 2: X/Square, 3: Y/Triangle
    // 9: Start (Pause)

    const btns = gp.buttons;
    const axes = gp.axes;

    // Threshold for axes
    const axisThreshold = 0.5;

    const currentButtons = {
        left: (btns[14] && btns[14].pressed) || (axes[0] && axes[0] < -axisThreshold),
        right: (btns[15] && btns[15].pressed) || (axes[0] && axes[0] > axisThreshold),
        down: (btns[13] && btns[13].pressed) || (axes[1] && axes[1] > axisThreshold),
        up: (btns[12] && btns[12].pressed) || (axes[1] && axes[1] < -axisThreshold) || (btns[3] && btns[3].pressed),
        rotR: btns[1] && btns[1].pressed, // B (Swapped per user request)
        rotL: btns[0] && btns[0].pressed, // A (Swapped per user request)
        hold: (btns[2] && btns[2].pressed) || (btns[4] && btns[4].pressed), // X or LB
        start: btns[9] && btns[9].pressed // Start button
    };

    // Global Pause / Menu Start
    if (currentButtons.start && !state.buttons.start) {
        if (!document.getElementById('menu-overlay').classList.contains('hidden')) {
             document.getElementById('btn-start').click();
        } else if (!document.getElementById('pause-menu').classList.contains('hidden')) {
             document.getElementById('btn-resume').click();
        } else {
            togglePauseMenu();
        }
    }

    if (!player.gameOn || player.paused) {
        state.buttons = currentButtons;
        return;
    }

    // Rotate Right - Single Press
    if (currentButtons.rotR && !state.buttons.rotR) player.player.rotate(1);

    // Rotate Left - Single Press
    if (currentButtons.rotL && !state.buttons.rotL) player.player.rotate(-1);

    // Hold - Single Press
    if (currentButtons.hold && !state.buttons.hold) player.player.hold();

    // Hard Drop - Single Press
    if (currentButtons.up && !state.buttons.up) player.player.hardDrop();

    // Movement (DAS)
    if (currentButtons.left) {
        if (!state.buttons.left) { // Just pressed
            player.player.move(-1);
            state.nextMoveTime = now + DAS_DELAY;
        } else if (now > state.nextMoveTime) { // Held
            player.player.move(-1);
            state.nextMoveTime = now + ARR_DELAY;
        }
    } else if (currentButtons.right) {
        if (!state.buttons.right) { // Just pressed
            player.player.move(1);
            state.nextMoveTime = now + DAS_DELAY;
        } else if (now > state.nextMoveTime) { // Held
            player.player.move(1);
            state.nextMoveTime = now + ARR_DELAY;
        }
    }

    // Soft Drop (Throttled but faster than movement usually)
    if (currentButtons.down) {
         if (now > state.nextDropTime) {
            player.player.drop();
            state.nextDropTime = now + 50;
        }
    }

    // Update state
    state.buttons = currentButtons;
}

// Start polling
requestAnimationFrame(pollGamepads);
