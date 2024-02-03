// Select game elements
const bottles = document.querySelectorAll('.bottle');
const emptyBottle = document.getElementById('empty-bottle');

// Function to check if pouring is possible
function canPour(sourceBottle, targetBottle) {
    // Check for target capacity, color match, and contiguous layers
}

// Function to update game state after pouring
function pourLiquid(sourceBottle, targetBottle) {
    // Get layers from both bottles
    const sourceLayers = sourceBottle.querySelectorAll('.layer');
    const targetLayers = targetBottle.querySelectorAll('.layer');

    // Find contiguous layers to pour
    let contiguousLayersToPour = [];
    for (let i = sourceLayers.length - 1; i >= 0; i--) {
        const layerColor = sourceLayers[i].style.backgroundColor;
        if (targetLayers.length === 0 || layerColor === targetLayers[targetLayers.length - 1].style.backgroundColor) {
            contiguousLayersToPour.unshift(sourceLayers[i]); // Add to the beginning of the array
        } else {
            break; // Stop when colors don't match or target is full
        }
    }

    // Move contiguous layers from source to target
    contiguousLayersToPour.forEach(layer => {
        sourceBottle.removeChild(layer);
        targetBottle.appendChild(layer);
    });
}


// Function to check for win condition
function checkWin() {
    // Check if all bottles have only one color
}

// Add click event listeners to bottles
bottles.forEach(bottle => {
    bottle.addEventListener('click', () => {
        const targetBottle = emptyBottle; // Initially pour to empty bottle

        if (canPour(bottle, targetBottle)) {
            pourLiquid(bottle, targetBottle);
            checkWin();
        } else {
            // Handle invalid pour attempt (e.g., display a message)
        }
    });
});

function generateBottles(numBottles) {
    const bottleContainer = document.querySelector('.bottle-container');
    for (let i = 0; i < numBottles; i++) {
        const bottle = document.createElement('div');
        bottle.classList.add('bottle');
        // Add layers with random colors (explained later)
        generateRandomLayers(bottle)
        bottleContainer.appendChild(bottle);
    }
}

function generateRandomLayers(bottle) {
    const numLayers = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
    for (let i = 0; i < numLayers; i++) {
        const layer = document.createElement('div');
        layer.classList.add('layer');
        // Set random color for the layer
        layer.style.backgroundColor = getRandomColor(); // Function to get random color
        bottle.appendChild(layer);
    }
}

function getRandomColor() {
    const colors = ['blue', 'red', 'yellow', 'green', 'purple'];
    return colors[Math.floor(Math.random() * colors.length)];
}


// Specify desired number of bottles
const numBottles = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
generateBottles(numBottles);

