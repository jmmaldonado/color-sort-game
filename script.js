const latestVersion = "1.2.9 - Pastel colors";

// Retrieve saved settings or set defaults
let savedSettings;
let settings;

const layerHeight = 40;

function loadSettings() {
    savedSettings = localStorage.getItem('gameSettings');
    settings = savedSettings ? JSON.parse(savedSettings) : {
        numBottles: 6, // Default number of bottles
        numEmpty: 1,    // Default number of empty bottles
        maxLayersPerBottle: 3, // Default maximum layers per bottle
        maxColors: 5   // Default maximum colors
    };

    document.getElementById('num-bottles').value = settings.numBottles;
    document.getElementById('num-empty').value = settings.numEmpty;
    document.getElementById('num-layers').value = settings.maxLayersPerBottle;
    document.getElementById('num-colors').value = settings.maxColors;
}

function saveSettings() {
    settings.numBottles = parseInt(document.getElementById('num-bottles').value);
    settings.numEmpty = parseInt(document.getElementById('num-empty').value);
    settings.maxLayersPerBottle = parseInt(document.getElementById('num-layers').value);
    settings.maxColors = parseInt(document.getElementById('num-colors').value);

    localStorage.setItem('gameSettings', JSON.stringify(settings));
}



const colors = ['color1', 'color2', 'color3', 'color4', 'color5', 'color6'];
let selectedSourceBottle = null;
let previousState = []

const gamesWonSpan = document.getElementById('games-won');
const gamesPlayedSpan = document.getElementById('games-played');
const sessionGamesWonSpan = document.getElementById('session-games-won');
const sessionGamesPlayedSpan = document.getElementById('session-games-played');



// Get initial values from Local Storage (or set defaults)
let gamesWon = Number(localStorage.getItem('gamesWon')) || 0;
let gamesPlayed = Number(localStorage.getItem('gamesPlayed')) || 0;
let sessionGamesPlayed = 0;
let sessionGamesWon = 0;
let sessionBestTime = parseFloat(localStorage.getItem("lifetimeBestTime")) || null;
let currentMovements = 0;


let gameSolved = false
let confettiInterval
let timerRef;
let startTime;

function startTimer() {
    timerRef = setInterval(() => {
        // Calculate elapsed time in seconds
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        updateTimerDisplay(elapsedTime);
    }, 100); // Update every 10 milliseconds
}

function updateTimerDisplay(elapsedTime) {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.querySelector('.timer-display').textContent = formattedTime;
}

function stopTimer() {
    clearInterval(timerRef);
    timerRef = null;
}

function updateStats() {
    // Update the displayed values
    gamesWonSpan.textContent = `${gamesWon}`;
    gamesPlayedSpan.textContent = `${gamesPlayed}`;
    sessionGamesWonSpan.textContent = `${sessionGamesWon}`;
    sessionGamesPlayedSpan.textContent = `${sessionGamesPlayed}`;
    updateLifetimeBestTimeDisplay(sessionBestTime)
}

function pourLayers(sourceBottle, targetBottle) {
    const sourceLayers = sourceBottle.querySelectorAll('.layer');
    const targetLayers = targetBottle.querySelectorAll('.layer');

    // Get contiguous layers of the same color from the top of the source bottle
    let contiguousLayers = [];
    let currentColor = sourceLayers[sourceLayers.length - 1].style.bottleLayerColor;
    console.log("Pour currentColor:", currentColor)
    for (let i = sourceLayers.length - 1; i >= 0; i--) {
        const layer = sourceLayers[i];
        if (layer.style.bottleLayerColor === currentColor) {
            contiguousLayers.push(layer);
        } else {
            break;
        }
    }

    // Check if all contiguous layers can fit in the target bottle
    if (contiguousLayers.length > settings.maxLayersPerBottle - targetLayers.length) {
        return; // Cannot pour all layers
    }

    // Check if the topmost layer in the target bottle has the same color
    if (targetLayers.length > 0 &&
        targetLayers[targetLayers.length - 1].style.bottleLayerColor !== currentColor) {
        return; // Colors don't match
    }

    //Save the current state in case we need to go back
    previousState.push(document.querySelector('.bottle-container').cloneNode(true));

    //Update the number of movements
    increaseMovementCounter()

    // Pour the layers!
    for (const layer of contiguousLayers) {
        sourceBottle.removeChild(layer);
        targetBottle.appendChild(layer);
    }

    gameSolved = checkGameSolved()
    if (gameSolved) {
        handleGameSolved()
    }


}

function handleGameSolved() {
    gamesWon++;
    localStorage.setItem('gamesWon', gamesWon);
    sessionGamesWon++;

    //Reset current game movements
    currentMovements = 0;

    //How long did the game take
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    handleBestTime(timeTaken);

    updateStats()
    fireConfetti()
}

function increaseMovementCounter() {
    currentMovements++;
    document.getElementById("movement-number").textContent = currentMovements;
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;

    // Ensure two-digit display for minutes and seconds
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


function handleBestTime(timeTaken) {
    stopTimer()

    //Session best time
    if (!sessionBestTime || timeTaken < sessionBestTime) {
        sessionBestTime = timeTaken;
        updateSessionBestTimeDisplay(sessionBestTime);
    }

    //Lifetime best time
    const localStorageKey = "lifetimeBestTime";
    const storedTime = localStorage.getItem(localStorageKey);
    const bestTime = storedTime ? Math.min(timeTaken, parseFloat(storedTime)) : timeTaken;
    localStorage.setItem(localStorageKey, bestTime);
    updateLifetimeBestTimeDisplay(bestTime);
}

function updateLifetimeBestTimeDisplay(timeTaken) {
    const formattedTime = formatTime(timeTaken);
    document.querySelector('.lifetime-best-time').textContent = `Lifetime Best: ${formattedTime}`;
}

function updateSessionBestTimeDisplay(timeTaken) {
    const formattedTime = formatTime(timeTaken); // (Create a function for formatting)
    document.querySelector('.session-best-time').textContent = `Session Best: ${formattedTime}`;
}

function fireConfetti() {
    const duration = 15 * 1000,
        animationEnd = Date.now() + duration,
        defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    confettiInterval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(confettiInterval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // since particles fall down, start a bit higher than random
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
        );
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
        );
    }, 250);
}



function generateBottles() {
    saveSettings()

    const bottleContainer = document.querySelector('.bottle-container');

    //Remove any existing bottles
    let bottles = document.querySelectorAll('.bottle');
    bottles.forEach(bottle => bottle.remove());

    gamesPlayed++;
    sessionGamesPlayed++;
    localStorage.setItem('gamesPlayed', gamesPlayed);
    updateStats()

    gameSolved = false
    clearInterval(confettiInterval)

    document.documentElement.style.setProperty('--max-layers-per-bottle', settings.maxLayersPerBottle);
    document.documentElement.style.setProperty('--layer-height', layerHeight + 'px');

    startTime = Date.now();
    startTimer()

    const unassignedLayers = [];

    // Nested loops for bottles and colors
    for (let i = 0; i < settings.numBottles; i++) {
        const color = colors[i % settings.maxColors];
        for (let j = 0; j < settings.maxLayersPerBottle; j++) {
            const layer = document.createElement('div');
            layer.classList.add('layer');
            layer.classList.add(color)
            layer.style.bottleLayerColor = color;
            layer.style.height = `${layerHeight}px`; // Set fixed height
            unassignedLayers.push(layer);
        }
    }

    // Distribute layers randomly across bottles
    distributeLayers(unassignedLayers, bottleContainer);
}

function distributeLayers(unassignedLayers, bottleContainer) {
    for (let i = 0; i < settings.numBottles; i++) {
        const bottle = document.createElement('div');
        bottle.classList.add('bottle');

        for (let j = 0; j < settings.maxLayersPerBottle; j++) {
            const randomIndex = Math.floor(Math.random() * unassignedLayers.length);
            bottle.prepend(unassignedLayers[randomIndex]);
            unassignedLayers.splice(randomIndex, 1);
        }


        bottleContainer.appendChild(bottle);
    }

    //Create empty bottles
    for (let i = 0; i < settings.numEmpty; i++) {
        const bottle = document.createElement('div');
        bottle.classList.add('bottle');
        bottleContainer.appendChild(bottle);
    }

    assignBottlesClickHandler()

}

function assignBottlesClickHandler() {
    // Add event listeners for clicking on bottles
    let bottles = document.querySelectorAll('.bottle');
    bottles.forEach(bottle => {
        bottle.addEventListener('click', () => handleBottleClick(bottle));
    });
}

function handleBottleClick(bottle) {
    if (!gameSolved) {
        if (bottle.classList.contains('selected')) {
            // Same bottle clicked, do nothing and return
            bottle.classList.remove('selected');
            selectedSourceBottle = null;
            return;
        }

        if (selectedSourceBottle === null) {
            // First click selects the source bottle
            selectedSourceBottle = bottle;
            // Visually indicate the selected source bottle (optional)
            selectedSourceBottle.classList.add('selected');
        } else {
            // Second click selects the target bottle and performs the pour
            pourLayers(selectedSourceBottle, bottle);
            selectedSourceBottle.classList.remove('selected')
            selectedSourceBottle = null;
        }
    }
}

function handleUndoClick() {
    if (previousState.length > 0) {
        increaseMovementCounter()
        const savedState = previousState.pop()
        document.querySelector('.bottle-container').innerHTML = savedState.innerHTML
        selectedSourceBottle = null;
        for (const bottle of document.querySelectorAll('.bottle')) {
            bottle.classList.remove('selected')
        }
        assignBottlesClickHandler()
    }
}

function checkGameSolved() {
    // Loop through all bottles
    for (const bottle of document.querySelectorAll('.bottle')) {
        // Skip empty bottles
        if (!bottle.querySelectorAll('.layer').length) {
            continue;
        }

        // Check if the bottle has the maximum number of layers
        if (bottle.querySelectorAll('.layer').length !== settings.maxLayersPerBottle) {
            return false; // Not solved, wrong number of layers
        }

        // Get the color of the first layer in this bottle
        const referenceColor = bottle.querySelector('.layer').style.bottleLayerColor;

        // Check if all other layers in the bottle have the same color
        for (const layer of bottle.querySelectorAll('.layer')) {
            if (layer.style.bottleLayerColor !== referenceColor) {
                return false; // Not solved, colors don't match
            }
        }
    }

    // If all bottles passed the check, the game is solved
    return true;
}

loadSettings();
updateStats();
if (!updateAvailable()) {
    generateBottles();
}


const restartButton = document.getElementById('restart-button');

restartButton.addEventListener('click', () => {
    // Restart the game logic here
    generateBottles(); // Function to clear existing layers and reset bottle states
    selectedSourceBottle = null; // Clear selection
    // Any other necessary reset actions
});

const undoButton = document.getElementById('undo-button');

undoButton.addEventListener('click', handleUndoClick);

// Function to check for updates
function updateAvailable() {
    const storedVersion = localStorage.getItem("currentVersion");

    if (storedVersion !== latestVersion) {
        // New version is available
        const updateButton = document.createElement("button");
        updateButton.textContent = "Update Available - Click to Refresh";
        updateButton.addEventListener("click", () => {
            window.location.reload(true); // Force a hard refresh
            localStorage.setItem("currentVersion", latestVersion);
        });

        // Add the button to the UI (adjust selector as needed)
        document.querySelector(".bottle-container").appendChild(updateButton);

        return true
    }

    return false
}