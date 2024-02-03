const numBottles = 5;
const maxLayersPerBottle = 3;
const layerHeight = 50;
document.documentElement.style.setProperty('--max-layers-per-bottle', maxLayersPerBottle);
document.documentElement.style.setProperty('--layer-height', layerHeight + 'px');

const colors = ['blue', 'red', 'yellow'];
let selectedSourceBottle = null;




function pourLayers(sourceBottle, targetBottle) {
    const sourceLayers = sourceBottle.querySelectorAll('.layer');
    const targetLayers = targetBottle.querySelectorAll('.layer');

    // Get contiguous layers of the same color from the top of the source bottle
    const contiguousLayers = [];
    let currentColor = sourceLayers[0].style.backgroundColor;
    for (let i = 0; i < sourceLayers.length; i++) {
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
        targetLayers[0].style.backgroundColor !== currentColor) {
        return; // Colors don't match
    }

    // Pour the layers!
    for (const layer of contiguousLayers) {
        sourceBottle.removeChild(layer);
        targetBottle.prepend(layer);
    }

    if (checkGameSolved()) {
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

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
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
    const unassignedLayers = [];

    // Nested loops for bottles and colors
    for (let i = 0; i < numBottles; i++) {
        const color = colors[i % colors.length];
        for (let j = 0; j < maxLayersPerBottle; j++) {
            const layer = document.createElement('div');
            layer.classList.add('layer');
            layer.style.backgroundColor = color;
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
            bottle.appendChild(unassignedLayers[randomIndex]);
            unassignedLayers.splice(randomIndex, 1);
        }

        bottleContainer.appendChild(bottle);
    }

    //Create an empty bottle to play
    const bottle = document.createElement('div');
    bottle.classList.add('bottle');
    bottleContainer.appendChild(bottle);

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

// Add event listeners for clicking on bottles
const bottles = document.querySelectorAll('.bottle');
bottles.forEach(bottle => {
    bottle.addEventListener('click', () => {
        if (selectedSourceBottle === null) {
            // First click selects the source bottle
            selectedSourceBottle = bottle;
            // Visually indicate the selected source bottle (optional)
            selectedSourceBottle.classList.add('selected');
        } else {
            // Second click selects the target bottle and performs the pour
            pourLayers(selectedSourceBottle, bottle);
            selectedSourceBottle = null;
            // Remove visual indication of selected source bottle (optional)
            bottles.forEach(b => b.classList.remove('selected'));
        }


    });
});