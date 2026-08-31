// Super Simple Newbie JavaScript for Rolling Dice Game

let diceCount = 1;
let isRolling = false;

// 3D rotation angles for 6 faces
const faceRotations = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: -180 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: -90, y: 0 },
    6: { x: 90, y: 0 }
};

// Set dice mode (1 or 2 dice)
function setDiceMode(num) {
    if (isRolling) return;
    diceCount = num;

    const btn1 = document.getElementById("btn-1-die");
    const btn2 = document.getElementById("btn-2-dice");
    const die2 = document.getElementById("die-2");

    if (num === 1) {
        btn1.classList.add("active");
        btn2.classList.remove("active");
        die2.classList.add("hidden");
    } else {
        btn2.classList.add("active");
        btn1.classList.remove("active");
        die2.classList.remove("hidden");
    }
}

// Function to get random number 1 to 6
function getRandomNumber() {
    return Math.floor(Math.random() * 6) + 1;
}

// Function to rotate a die to show the rolled value
function rotateDie(dieElement, value) {
    const coords = faceRotations[value];
    // Add 720 degrees extra spin for animation effect
    dieElement.style.transform = `rotateX(${coords.x + 720}deg) rotateY(${coords.y + 720}deg)`;
}

// Main function to roll dice
function rollDice() {
    if (isRolling) return;

    isRolling = true;
    const rollButton = document.getElementById("roll-button");
    const die1 = document.getElementById("die-1");
    const die2 = document.getElementById("die-2");
    const resultText = document.getElementById("result-text");

    rollButton.disabled = true;

    // Start rolling animation
    die1.classList.add("rolling");
    if (diceCount === 2) {
        die2.classList.add("rolling");
    }

    // Generate random values
    const roll1 = getRandomNumber();
    const roll2 = diceCount === 2 ? getRandomNumber() : 0;
    const total = roll1 + roll2;

    // After 600ms, stop animation and show result
    setTimeout(function () {
        die1.classList.remove("rolling");
        rotateDie(die1, roll1);

        if (diceCount === 2) {
            die2.classList.remove("rolling");
            rotateDie(die2, roll2);
        }

        // Display result
        if (diceCount === 1) {
            resultText.innerText = "Total: " + total;
        } else {
            resultText.innerText = "Total: " + total + " (" + roll1 + " + " + roll2 + ")";
        }

        // Add to history
        addHistory(roll1, roll2, total);

        rollButton.disabled = false;
        isRolling = false;
    }, 600);
}

// Function to add roll entry to history list
function addHistory(val1, val2, total) {
    const historyList = document.getElementById("history-list");
    const emptyMsg = historyList.querySelector(".empty-msg");

    if (emptyMsg) {
        historyList.innerHTML = "";
    }

    const li = document.createElement("li");
    if (diceCount === 1) {
        li.innerText = "Rolled: " + total;
    } else {
        li.innerText = "Rolled: " + total + " (" + val1 + " + " + val2 + ")";
    }

    historyList.insertBefore(li, historyList.firstChild);
}

// Function to clear history
function clearHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = '<li class="empty-msg">No rolls yet</li>';
}

// Set initial dice rotation
rotateDie(document.getElementById("die-1"), 6);
rotateDie(document.getElementById("die-2"), 6);
