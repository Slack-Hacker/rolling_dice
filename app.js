// Dice Rolling Game JavaScript Engine

let diceCount = 1;
let isRolling = false;
let audioCtx = null;

// 3D rotation angles for 6 faces
const faceRotations = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: -180 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: -90, y: 0 },
    6: { x: 90, y: 0 }
};

// --- Loud Web Audio API Dice Rolling Sound Engine ---
function playLoudRollSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const impactCount = diceCount === 2 ? 8 : 5;

        // Schedule rapid tumbling impact clicks
        for (let i = 0; i < impactCount; i++) {
            const timeOffset = now + (i * 0.07) + (Math.random() * 0.02);
            const isFinal = (i === impactCount - 1);
            const impactVolume = isFinal ? 1.0 : 0.7 + (Math.random() * 0.3);
            const pitch = 500 + Math.random() * 700;
            
            playImpact(timeOffset, impactVolume, pitch, isFinal);
        }
    } catch (e) {
        console.warn('Audio playback error:', e);
    }
}

// Helper to synthesize single dice impact tap/bounce
function playImpact(time, vol, freq, isFinal) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    // Noise burst for tumbling sound texture
    const bufferSize = audioCtx.sampleRate * (isFinal ? 0.1 : 0.05);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Tone Oscillator
    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.2, time + (isFinal ? 0.12 : 0.05));

    // Filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.setValueAtTime(3, time);

    // Loud Gain Envelope
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isFinal ? 0.12 : 0.05));

    osc.connect(filter);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    noise.start(time);
    osc.stop(time + (isFinal ? 0.13 : 0.06));
    noise.stop(time + (isFinal ? 0.13 : 0.06));
}

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

    const val1 = parseInt(document.getElementById("die-1").getAttribute("data-roll")) || 6;
    const val2 = parseInt(document.getElementById("die-2").getAttribute("data-roll")) || 6;
    updateResultDisplay(val1, val2);
}

// Generate random number 1 to 6
function getRandomNumber() {
    return Math.floor(Math.random() * 6) + 1;
}

// Apply 3D rotation to die element and set active data-roll attribute
function rotateDie(dieElement, value) {
    const coords = faceRotations[value];
    dieElement.style.transform = `rotateX(${coords.x + 720}deg) rotateY(${coords.y + 720}deg)`;
    dieElement.setAttribute('data-roll', value);
}

// Update score result UI
function updateResultDisplay(val1, val2) {
    const resultScore = document.getElementById("result-text");
    const resultDetails = document.getElementById("result-details");
    const total = diceCount === 1 ? val1 : val1 + val2;

    resultScore.innerText = total;

    if (diceCount === 1) {
        resultDetails.innerText = `Die 1: ${val1}`;
    } else {
        resultDetails.innerText = `Die 1: ${val1} | Die 2: ${val2}`;
    }
}

// Roll dice action
function rollDice() {
    if (isRolling) return;

    isRolling = true;
    const rollButton = document.getElementById("roll-button");
    const die1 = document.getElementById("die-1");
    const die2 = document.getElementById("die-2");

    rollButton.disabled = true;

    // Play loud dice clattering sound effect
    playLoudRollSound();

    // Start rolling animation
    die1.classList.add("rolling");
    if (diceCount === 2) {
        die2.classList.add("rolling");
    }

    // Generate random values
    const val1 = getRandomNumber();
    const val2 = diceCount === 2 ? getRandomNumber() : 0;
    const total = val1 + val2;

    // After animation delay (600ms), land on rolled faces
    setTimeout(function () {
        die1.classList.remove("rolling");
        rotateDie(die1, val1);

        if (diceCount === 2) {
            die2.classList.remove("rolling");
            rotateDie(die2, val2);
        }

        updateResultDisplay(val1, val2);
        addHistory(val1, val2, total);

        rollButton.disabled = false;
        isRolling = false;
    }, 600);
}

// Add roll entry to history list
function addHistory(val1, val2, total) {
    const historyList = document.getElementById("history-list");
    const emptyMsg = historyList.querySelector(".empty-msg");

    if (emptyMsg) {
        historyList.innerHTML = "";
    }

    const badge = document.createElement("div");
    badge.className = "history-item";
    
    if (diceCount === 1) {
        badge.innerText = `Rolled: ${total}`;
    } else {
        badge.innerText = `Rolled: ${total} (${val1}+${val2})`;
    }

    historyList.insertBefore(badge, historyList.firstChild);
}

// Clear history
function clearHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = '<div class="empty-msg">No rolls recorded yet</div>';
}

// Keyboard shortcut (Spacebar or Enter)
document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        rollDice();
    }
});

// Initialize initial rotation
rotateDie(document.getElementById("die-1"), 6);
rotateDie(document.getElementById("die-2"), 6);
