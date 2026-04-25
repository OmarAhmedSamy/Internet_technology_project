// Game State
let currentMode = 'single';
let player1Score = 0;
let player2Score = 0;
let drawCount = 0;
let player1Choice = null;
let player2Choice = null;
let isProcessing = false;

const choices = {
    rock: { emoji: '🪨', name: 'ROCK' },
    paper: { emoji: '📜', name: 'PAPER' },
    scissors: { emoji: '✂️', name: 'SCISSORS' }
};

// DOM Elements
const modeBtns = document.querySelectorAll('.mode-btn');
const player1Card = document.getElementById('player1-card');
const player2Card = document.getElementById('player2-card');
const player1ChoiceEl = document.getElementById('player1-choice');
const player2ChoiceEl = document.getElementById('player2-choice');
const countdownEl = document.getElementById('countdown');
const resultEl = document.getElementById('result');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const drawsEl = document.getElementById('draws');
const historyList = document.getElementById('history-list');
const nextRoundBtn = document.getElementById('next-round');
const resetGameBtn = document.getElementById('reset-game');

function getWinner(p1, p2) {
    if (p1 === p2) return 'draw';
    if ((p1 === 'rock' && p2 === 'scissors') ||
        (p1 === 'paper' && p2 === 'rock') ||
        (p1 === 'scissors' && p2 === 'paper')) {
        return 'player1';
    }
    return 'player2';
}

function updateScores(winner) {
    if (winner === 'player1') player1Score++;
    else if (winner === 'player2') player2Score++;
    else drawCount++;

    score1El.textContent = player1Score;
    score2El.textContent = player2Score;
    drawsEl.textContent = drawCount;
}

function addToHistory(p1, p2, winner) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    let resultText = winner === 'player1' ? '🏆 P1 WINS' :
                     winner === 'player2' ? '🏆 P2 WINS' : '🤝 DRAW';

    item.innerHTML = `
        <span>${choices[p1].emoji} ${choices[p1].name}</span>
        <span style="color:#888">${resultText}</span>
        <span>${choices[p2].emoji} ${choices[p2].name}</span>
    `;
    historyList.prepend(item);

    if (historyList.children.length > 6) {
        historyList.removeChild(historyList.lastChild);
    }
}

async function aiChoose() {
    await new Promise(resolve => setTimeout(resolve, 800));
    const options = ['rock', 'paper', 'scissors'];
    player2Choice = options[Math.floor(Math.random() * 3)];
    player2ChoiceEl.textContent = choices[player2Choice].emoji;
}

async function startCountdown() {
    isProcessing = true;
    countdownEl.style.opacity = '1';
    resultEl.classList.remove('show');
    player1Card.classList.remove('winner');
    player2Card.classList.remove('winner');

    for (let i = 3; i >= 1; i--) {
        countdownEl.textContent = i;
        await new Promise(r => setTimeout(r, 700));
    }

    countdownEl.style.opacity = '0';

    if (currentMode === 'single') {
        await aiChoose();
    }

    // Reveal result
    const winner = getWinner(player1Choice, player2Choice);

    if (winner === 'player1') {
        player1Card.classList.add('winner');
    } else if (winner === 'player2') {
        player2Card.classList.add('winner');
    }

    updateScores(winner);
    addToHistory(player1Choice, player2Choice, winner);

    let message = '';
    if (winner === 'draw') message = "IT'S A DRAW!";
    else if (winner === 'player1') message = "PLAYER 1 WINS!";
    else message = currentMode === 'single' ? "AI WINS!" : "PLAYER 2 WINS!";

    resultEl.textContent = message;
    resultEl.style.borderColor = winner === 'player1' ? '#00f7ff' : '#ff00cc';
    resultEl.classList.add('show');

    nextRoundBtn.style.display = 'block';
    isProcessing = false;
}

function handleChoice(player, choice) {
    if (isProcessing) return;

    if (currentMode === 'single') {
        if (player === 1) {
            player1Choice = choice;
            player1ChoiceEl.textContent = choices[choice].emoji;
            document.querySelectorAll('#player1-choices .choice-btn').forEach(b => 
                b.classList.toggle('selected', b.dataset.choice === choice)
            );
            setTimeout(() => startCountdown(), 400);
        }
    } 
    else if (currentMode === 'local') {
        if (player === 1 && !player1Choice) {
            player1Choice = choice;
            player1ChoiceEl.textContent = choices[choice].emoji;
            document.querySelectorAll('#player1-choices .choice-btn').forEach(b => 
                b.classList.toggle('selected', b.dataset.choice === choice)
            );
            document.getElementById('player2-name').textContent = "PLAYER 2 - CHOOSE";
        } 
        else if (player === 2 && player1Choice && !player2Choice) {
            player2Choice = choice;
            player2ChoiceEl.textContent = choices[choice].emoji;
            document.querySelectorAll('#player2-choices .choice-btn').forEach(b => 
                b.classList.toggle('selected', b.dataset.choice === choice)
            );
            setTimeout(() => startCountdown(), 500);
        }
    }
}

function resetRound() {
    player1Choice = null;
    player2Choice = null;

    player1ChoiceEl.textContent = '❓';
    player2ChoiceEl.textContent = '❓';

    document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
    resultEl.classList.remove('show');
    countdownEl.style.opacity = '0';
    nextRoundBtn.style.display = 'none';

    if (currentMode === 'local') {
        document.getElementById('player2-name').textContent = "PLAYER 2";
    }
}

function resetFullGame() {
    if (!confirm("Reset the entire game?")) return;
    player1Score = player2Score = drawCount = 0;
    score1El.textContent = '0';
    score2El.textContent = '0';
    drawsEl.textContent = '0';
    historyList.innerHTML = '';
    resetRound();
}

function switchMode(mode) {
    if (mode === 'online') {
        alert("🌐 Online Multiplayer is coming soon!");
        mode = 'single';
    }

    currentMode = mode;
    modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));

    document.getElementById('player2-name').textContent = 
        mode === 'single' ? "AI OPPONENT" : "PLAYER 2";

    resetFullGame();
}

// Event Listeners
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

document.querySelectorAll('#player1-choices .choice-btn').forEach(btn => {
    btn.addEventListener('click', () => handleChoice(1, btn.dataset.choice));
});

document.querySelectorAll('#player2-choices .choice-btn').forEach(btn => {
    btn.addEventListener('click', () => handleChoice(2, btn.dataset.choice));
});

nextRoundBtn.addEventListener('click', resetRound);
resetGameBtn.addEventListener('click', resetFullGame);

// Keyboard Support (1 = Rock, 2 = Paper, 3 = Scissors)
document.addEventListener('keydown', (e) => {
    if (isProcessing) return;
    let choice = null;
    if (e.key === '1') choice = 'rock';
    else if (e.key === '2') choice = 'paper';
    else if (e.key === '3') choice = 'scissors';

    if (choice) {
        if (currentMode === 'single') handleChoice(1, choice);
        else if (currentMode === 'local') {
            if (!player1Choice) handleChoice(1, choice);
            else if (!player2Choice) handleChoice(2, choice);
        }
    }
});

// Initialize
function init() {
    switchMode('single');
}

window.onload = init;
