let numBottles = parseInt(document.getElementById('num-bottles').value) - 1;
let numEmpty = parseInt(document.getElementById('num-empty').value);
let maxLayersPerBottle = parseInt(document.getElementById('num-layers').value);
let maxColors = parseInt(document.getElementById('num-colors').value);
const layerHeight = 40;



const colors = ['blue', 'red', 'yellow', 'purple', 'green', 'gray'];
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

updateStats()


let gameSolved = false
let confettiInterval

function updateStats() {
    // Update the displayed values
    gamesWonSpan.textContent = `${gamesWon}`;
    gamesPlayedSpan.textContent = `${gamesPlayed}`;
    sessionGamesWonSpan.textContent = `${sessionGamesWon}`;
    sessionGamesPlayedSpan.textContent = `${sessionGamesPlayed}`;
}

function pourLayers(sourceBottle, targetBottle) {
    const sourceLayers = sourceBottle.querySelectorAll('.layer');
    const targetLayers = targetBottle.querySelectorAll('.layer');

    // Get contiguous layers of the same color from the top of the source bottle
    let contiguousLayers = [];
    let currentColor = sourceLayers[sourceLayers.length - 1].style.backgroundColor;
    for (let i = sourceLayers.length - 1; i >= 0; i--) {
        const layer = sourceLayers[i];
        if (layer.style.backgroundColor === currentColor) {
            contiguousLayers.push(layer);
        } else {
            break;
        }
    }

    // Check if all contiguous layers can fit in the target bottle
    if (contiguousLayers.length > maxLayersPerBottle - targetLayers.length) {
        return; // Cannot pour all layers
    }

    // Check if the topmost layer in the target bottle has the same color
    if (targetLayers.length > 0 &&
        targetLayers[targetLayers.length - 1].style.backgroundColor !== currentColor) {
        return; // Colors don't match
    }

    //Save the current state in case we need to go back
    previousState.push(document.querySelector('.bottle-container').cloneNode(true));

    // Pour the layers!
    for (const layer of contiguousLayers) {
        sourceBottle.removeChild(layer);
        targetBottle.appendChild(layer);
    }

    gameSolved = checkGameSolved()
    if (gameSolved) {
        gamesWon++;
        localStorage.setItem('gamesWon', gamesWon);
        sessionGamesWon++;
        updateStats()
        fireConfetti()
    }


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

    numBottles = parseInt(document.getElementById('num-bottles').value) - 1;
    numEmpty = parseInt(document.getElementById('num-empty').value);
    maxLayersPerBottle = parseInt(document.getElementById('num-layers').value);
    maxColors = parseInt(document.getElementById('num-colors').value);

    document.documentElement.style.setProperty('--max-layers-per-bottle', maxLayersPerBottle);
    document.documentElement.style.setProperty('--layer-height', layerHeight + 'px');

    const unassignedLayers = [];

    // Nested loops for bottles and colors
    for (let i = 0; i < numBottles; i++) {
        const color = colors[i % maxColors];
        for (let j = 0; j < maxLayersPerBottle; j++) {
            const layer = document.createElement('div');
            layer.classList.add('layer');
            layer.style.backgroundColor = color;
            layer.style.height = `${layerHeight}px`; // Set fixed height
            unassignedLayers.push(layer);
        }
    }

    // Distribute layers randomly across bottles
    distributeLayers(unassignedLayers, bottleContainer);
}

function distributeLayers(unassignedLayers, bottleContainer) {
    for (let i = 0; i < numBottles; i++) {
        const bottle = document.createElement('div');
        bottle.classList.add('bottle');

        for (let j = 0; j < maxLayersPerBottle; j++) {
            const randomIndex = Math.floor(Math.random() * unassignedLayers.length);
            bottle.prepend(unassignedLayers[randomIndex]);
            unassignedLayers.splice(randomIndex, 1);
        }


        bottleContainer.appendChild(bottle);
    }

    //Create empty bottles
    for (let i = 0; i < numEmpty; i++) {
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
        if (bottle.querySelectorAll('.layer').length !== maxLayersPerBottle) {
            return false; // Not solved, wrong number of layers
        }

        // Get the color of the first layer in this bottle
        const referenceColor = bottle.querySelector('.layer').style.backgroundColor;

        // Check if all other layers in the bottle have the same color
        for (const layer of bottle.querySelectorAll('.layer')) {
            if (layer.style.backgroundColor !== referenceColor) {
                return false; // Not solved, colors don't match
            }
        }
    }

    // If all bottles passed the check, the game is solved
    return true;
}


generateBottles();



const restartButton = document.getElementById('restart-button');

restartButton.addEventListener('click', () => {
    // Restart the game logic here
    generateBottles(); // Function to clear existing layers and reset bottle states
    selectedSourceBottle = null; // Clear selection
    // Any other necessary reset actions
});

const undoButton = document.getElementById('undo-button');

undoButton.addEventListener('click', handleUndoClick);
