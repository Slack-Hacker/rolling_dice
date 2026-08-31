/* ==========================================
   DICE ROLLER - JAVASCRIPT LOGIC
   Simple, Modular, and Well-Commented Code
   ========================================== */

// --- State Variables ---
let diceCount = 1;         // Default: 1 Die mode
let isRolling = false;     // Prevents overlapping rolls
let soundEnabled = true;   // Sound toggle status
let rollHistory = [];      // Stores history of rolls

// --- Target 3D Rotation Angles for Each Die Face ---
// Each number (1 to 6) corresponds to exact X/Y rotations to display that face in front
const faceRotations = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: -180 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: -90, y: 0 },
    6: { x: 90, y: 0 }
};

// --- DOM Elements ---
const die1 = document.getElementById('die-1');
const die2 = document.getElementById('die-2');
const die2Wrapper = document.getElementById('die-2-wrapper');
const rollBtn = document.getElementById('roll-btn');
const mode1Btn = document.getElementById('mode-1');
const mode2Btn = document.getElementById('mode-2');
const resultTotal = document.getElementById('result-total');
const resultDetails = document.getElementById('result-details');
const historyList = document.getElementById('history-list');
const rollCountEl = document.getElementById('roll-count');
const soundToggle = document.getElementById('sound-toggle');
const resetBtn = document.getElementById('reset-btn');

// --- Web Audio API Sound Engine (No External Assets Required) ---
let audioCtx = null;

function playRollSound() {
    if (!soundEnabled) return;
    
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Generate synthetic dice clatter sound using noise and gain
        const now = audioCtx.currentTime;
        const duration = 0.6;
        
        // Noise Buffer
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass Filter to emulate wooden/plastic dice impact
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(3, now);

        // Envelope Gain
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start(now);
        noise.stop(now + duration);
    } catch (e) {
        console.warn('Audio play failed:', e);
    }
}

// --- Utility Functions ---

/**
 * Generates a random integer between 1 and 6 (inclusive)
 * Standard Accenture / Interview random dice formula
 */
function getRandomDieValue() {
    return Math.floor(Math.random() * 6) + 1;
}

/**
 * Applies 3D rotation transform to a die element based on target value
 */
function setDieRotation(dieElement, value) {
    const coords = faceRotations[value];
    
    // Add extra 360-degree rotations for extra spin visual effect
    const extraSpins = 720;
    const rotateX = coords.x + extraSpins;
    const rotateY = coords.y + extraSpins;

    dieElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    dieElement.setAttribute('data-value', value);
}

// --- Main Roll Action ---
function rollDice() {
    if (isRolling) return;
    
    isRolling = true;
    rollBtn.classList.add('disabled');
    
    // Play sound effect
    playRollSound();

    // 1. Add rolling CSS animation class
    die1.classList.add('rolling');
    if (diceCount === 2) {
        die2.classList.add('rolling');
    }

    // 2. Generate random results
    const val1 = getRandomDieValue();
    const val2 = diceCount === 2 ? getRandomDieValue() : 0;
    const total = val1 + val2;

    // 3. After animation completes (600ms), stop rolling class and land on exact face
    setTimeout(() => {
        die1.classList.remove('rolling');
        setDieRotation(die1, val1);

        if (diceCount === 2) {
            die2.classList.remove('rolling');
            setDieRotation(die2, val2);
        }

        // Update result display
        updateResultUI(val1, val2, total);

        // Add to history
        addRollToHistory(val1, val2, total);

        // Re-enable roll button
        isRolling = false;
        rollBtn.classList.remove('disabled');
    }, 600);
}

// --- UI Update Helpers ---

function updateResultUI(val1, val2, total) {
    resultTotal.textContent = total;
    
    if (diceCount === 1) {
        resultDetails.textContent = `Die 1: ${val1}`;
    } else {
        resultDetails.textContent = `Die 1: ${val1} | Die 2: ${val2}`;
    }
}

function addRollToHistory(val1, val2, total) {
    const rollEntry = {
        val1,
        val2,
        total,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    rollHistory.unshift(rollEntry);
    renderHistory();
}

function renderHistory() {
    rollCountEl.textContent = `Total Rolls: ${rollHistory.length}`;

    if (rollHistory.length === 0) {
        historyList.innerHTML = `<div class="empty-history">No rolls yet. Click "Roll Dice" to start!</div>`;
        return;
    }

    historyList.innerHTML = rollHistory.map((item) => {
        const breakdown = diceCount === 2 || item.val2 > 0 ? `(${item.val1} + ${item.val2})` : `(${item.val1})`;
        return `
            <div class="history-badge">
                <span class="total">${item.total}</span>
                <span class="breakdown">${breakdown}</span>
            </div>
        `;
    }).join('');
}

// --- Mode Switching ---

function setMode(numDice) {
    if (isRolling) return;

    diceCount = numDice;

    if (numDice === 1) {
        mode1Btn.classList.add('active');
        mode2Btn.classList.remove('active');
        die2Wrapper.classList.add('hidden');
    } else {
        mode2Btn.classList.add('active');
        mode1Btn.classList.remove('active');
        die2Wrapper.classList.remove('hidden');
    }

    // Reset current display
    const val1 = parseInt(die1.getAttribute('data-value')) || 6;
    const val2 = parseInt(die2.getAttribute('data-value')) || 6;
    const total = numDice === 1 ? val1 : val1 + val2;
    
    updateResultUI(val1, val2, total);
}

// --- Event Listeners ---

// Button click to roll
rollBtn.addEventListener('click', rollDice);

// Keyboard controls (Spacebar or Enter to roll)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        // Prevent default spacebar scrolling
        e.preventDefault();
        rollDice();
    }
});

// Mode buttons
mode1Btn.addEventListener('click', () => setMode(1));
mode2Btn.addEventListener('click', () => setMode(2));

// Sound toggle button
soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const icon = soundToggle.querySelector('i');
    if (soundEnabled) {
        icon.className = 'fa-solid fa-volume-high';
        soundToggle.title = 'Sound On';
    } else {
        icon.className = 'fa-solid fa-volume-xmark';
        soundToggle.title = 'Sound Off';
    }
});

// Reset history button
resetBtn.addEventListener('click', () => {
    rollHistory = [];
    renderHistory();
});

// --- Initial Setup ---
setDieRotation(die1, 6);
setDieRotation(die2, 6);
setMode(1);
