// Select game elements
const bottles = document.querySelectorAll('.bottle');
const emptyBottle = document.getElementById('empty-bottle');
const numBottles = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
const maxLayersPerBottle = 3; // Adjust as needed
const colors = ['blue', 'red', 'yellow', 'green', 'purple'];
totalLayers = numBottles * maxLayersPerBottle; // Total layers based on max layers per bottle


const minLayersPerColor = Math.ceil(totalLayers / colors.length);


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
        generateRandomLayers(bottle, minLayersPerColor)
        bottleContainer.appendChild(bottle);
    }
}

function generateRandomLayers(bottle, minLayersPerColor) {
    let currentColor = getRandomColor(); // Initialize with a random color
    let remainingLayers = minLayersPerColor * numBottles; // Total layers needed for this color
    const numLayers = minLayersPerColor;
    for (let i = 0; i < numLayers; i++) {
      const layer = document.createElement('div');
      layer.classList.add('layer');
  
      // Ensure enough layers of the current color before moving to the next
      while (colors.indexOf(currentColor) === -1 || remainingLayers <= 0) {
        currentColor = getRandomColor(); // Switch to a new random color
      }
  
      layer.style.backgroundColor = currentColor;
      bottle.appendChild(layer);
      remainingLayers--; // Count down remaining layers needed for this color
    }
  }
  
  

function getRandomColor() {
    const colors = ['blue', 'red', 'yellow', 'green', 'purple'];
    return colors[Math.floor(Math.random() * colors.length)];
}



generateBottles(numBottles);

