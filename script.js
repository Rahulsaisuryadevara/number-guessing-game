// Game State
let answer;
let attemptsLeft;
let timer;
let timeLeft;
let difficultySettings = {
    easy: { attempts: 10, time: 60 },
    medium: { attempts: 7, time: 60 },
    hard: { attempts: 5, time: 30 }
};

// DOM Elements
const homeContainer = document.querySelector('.home-container');
const gameContainer = document.querySelector('.game-container');
const difficultyButtons = document.querySelectorAll('.difficulty-selector button');
const guessInput = document.getElementById('guessInput');
const submitButton = document.getElementById('submitGuess');
const messageElement = document.getElementById('message');
const hintElement = document.getElementById('hint');
const attemptsDisplay = document.getElementById('attemptsCount');
const timeDisplay = document.getElementById('timeDisplay');
const restartButton = document.getElementById('restart');
const backToHomeButton = document.getElementById('backToHome');

// Custom Cursor Logic
const cursor = document.querySelector('.cursor-trail');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
const speed = 0.2; // Smoothing factor

const animateCursor = () => {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * speed;
    cursorY += dy * speed;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
};

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Start animation loop
animateCursor();

// Cursor effects on interactive elements
document.querySelectorAll('button, input, [data-difficulty]').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover-active');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover-active');
    });
});

// Click effects
document.addEventListener('mousedown', () => {
    cursor.classList.add('click');
});
document.addEventListener('mouseup', () => {
    cursor.classList.remove('click');
});

// Double-click protection
let clickCount = 0;
document.addEventListener('mousedown', () => {
    clickCount++;
    if (clickCount === 2) {
        cursor.classList.add('double-click');
        setTimeout(() => {
            cursor.classList.remove('double-click');
        }, 500);
    }
    setTimeout(() => {
        clickCount = 0;
    }, 300);
});

// Difficulty Selection
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const difficulty = button.dataset.difficulty;
        startGame(difficulty);
    });
});

// Game Functions
function startGame(difficulty) {
    homeContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Set game parameters
    attemptsLeft = difficultySettings[difficulty].attempts;
    timeLeft = difficultySettings[difficulty].time;
    answer = Math.floor(Math.random() * 100) + 1;
    
    // Reset UI
    updateDisplay();
    messageElement.textContent = '';
    hintElement.textContent = '';
    guessInput.value = '';
    guessInput.disabled = false;
    submitButton.disabled = false;
    restartButton.style.display = 'none';
    guessInput.focus();
    
    // Start timer
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    updateDisplay();
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        endGame(false);
    }
}

function updateDisplay() {
    attemptsDisplay.textContent = attemptsLeft;
    timeDisplay.textContent = timeLeft;
    
    // Flash red when time is low
    if (timeLeft <= 10) {
        timeDisplay.style.animation = 'flashRed 1s infinite';
    } else {
        timeDisplay.style.animation = '';
    }
}

function makeGuess() {
    const guess = parseInt(guessInput.value);
    
    // Validate input
    if (isNaN(guess) || guess < 1 || guess > 100) {
        messageElement.textContent = 'Please enter a number between 1-100!';
        messageElement.style.color = '#ff5555';
        return;
    }
    
    attemptsLeft--;
    updateDisplay();
    
    // Check guess
    if (guess === answer) {
        endGame(true);
        return;
    }
    
    // Provide animated feedback
    if (guess > answer) {
        showHint('Too high!', 'flash-high');
    } else {
        showHint('Too low!', 'flash-low');
    }
    
    // Check if game over
    if (attemptsLeft <= 0) {
        endGame(false);
    }
    
    guessInput.value = '';
}

function showHint(text, animationClass) {
    hintElement.textContent = text;
    hintElement.classList.remove('flash-high', 'flash-low');
    void hintElement.offsetWidth; // Trigger reflow
    hintElement.classList.add(animationClass);
    
    // Clear animation after it finishes
    setTimeout(() => {
        hintElement.classList.remove('flash-high', 'flash-low');
    }, 500);
}

function endGame(isWin) {
    clearInterval(timer);
    guessInput.disabled = true;
    submitButton.disabled = true;
    restartButton.style.display = 'block';
    
    if (isWin) {
        messageElement.textContent = `🎉 You won with ${timeLeft}s left!`;
        messageElement.style.color = '#00ffcc';
        hintElement.textContent = '';
    } else {
        messageElement.textContent = `Game over! The number was ${answer}.`;
        messageElement.style.color = '#ff5555';
    }
}

// Event Listeners
submitButton.addEventListener('click', makeGuess);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') makeGuess();
});

restartButton.addEventListener('click', () => {
    const activeButton = document.querySelector('.difficulty-selector button.active');
    startGame(activeButton ? activeButton.dataset.difficulty : 'easy');
});

backToHomeButton.addEventListener('click', () => {
    clearInterval(timer);
    gameContainer.style.display = 'none';
    homeContainer.style.display = 'block';
});