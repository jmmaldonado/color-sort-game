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
