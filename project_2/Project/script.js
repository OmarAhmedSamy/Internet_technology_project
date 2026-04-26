const currentTurn = document.getElementById("current-turn");
const gameMessage = document.getElementById("game-message");
const choiceButtons = document.querySelectorAll(".btn-choice");
const countdownArea = document.getElementById("countdown-area");
const timer = document.getElementById("timer");
const resultsArea = document.getElementById("results-area");
const winnerText = document.getElementById("winner-text");
const choicesReveal = document.getElementById("choices-reveal");
const nextRoundButton = document.getElementById("next-round-btn");
const playerOneScore = document.getElementById("p1-score");
const playerTwoScore = document.getElementById("p2-score");
const historyList = document.getElementById("history-list");
const playerOnePanel = document.getElementById("player-1-panel");
const playerTwoPanel = document.getElementById("player-2-panel");
const playerOneStatus = document.getElementById("player-1-status");
const playerTwoStatus = document.getElementById("player-2-status");
const playerOneConfirm = document.getElementById("player-1-confirm");
const playerTwoConfirm = document.getElementById("player-2-confirm");

const gameState = {
    currentPlayer: 1,
    selectedChoice: "",
    playerOneChoice: "",
    playerTwoChoice: "",
    playerOneScore: 0,
    playerTwoScore: 0,
    roundNumber: 1,
    history: []
};

function handleChoiceSelection(event) {
    const clickedButton = event.target;
    const buttonPlayer = Number(clickedButton.dataset.player);
    const chosenValue = clickedButton.dataset.choice;

    if (buttonPlayer !== gameState.currentPlayer) {
        return;
    }

    getPlayerButtons(buttonPlayer).forEach((button) => {
        button.classList.remove("selected");
    });

    clickedButton.classList.add("selected");
    gameState.selectedChoice = chosenValue;
    getConfirmButton(buttonPlayer).disabled = false;
}

function getPlayerButtons(playerNumber) {
    return document.querySelectorAll(`.btn-choice[data-player="${playerNumber}"]`);
}

function getConfirmButton(playerNumber) {
    return playerNumber === 1 ? playerOneConfirm : playerTwoConfirm;
}

function resetPlayerSelection(playerNumber) {
    getPlayerButtons(playerNumber).forEach((button) => {
        button.classList.remove("selected");
    });

    getConfirmButton(playerNumber).disabled = true;
}

function updatePanelState() {
    const playerOneLocked = gameState.playerOneChoice !== "";
    const playerTwoLocked = gameState.playerTwoChoice !== "";

    playerOnePanel.classList.toggle("player-panel-active", gameState.currentPlayer === 1);
    playerOnePanel.classList.toggle("player-panel-inactive", gameState.currentPlayer !== 1);
    playerOnePanel.classList.toggle("player-panel-locked", playerOneLocked && !playerTwoLocked);

    playerTwoPanel.classList.toggle("player-panel-active", gameState.currentPlayer === 2);
    playerTwoPanel.classList.toggle("player-panel-inactive", gameState.currentPlayer !== 2);
    playerTwoPanel.classList.remove("player-panel-locked");

    if (!playerOneLocked) {
        playerOneStatus.textContent = "Choose your move.";
    } else if (!playerTwoLocked) {
        playerOneStatus.textContent = "Choice locked in.";
    } else {
        playerOneStatus.textContent = "Round complete.";
    }

    if (gameState.currentPlayer === 2 && !playerTwoLocked) {
        playerTwoStatus.textContent = "Choose your move.";
    } else if (playerTwoLocked) {
        playerTwoStatus.textContent = "Choice locked in.";
    } else {
        playerTwoStatus.textContent = "Wait for Player 1.";
    }

    setButtonsDisabled(1, gameState.currentPlayer !== 1 || playerOneLocked);
    setButtonsDisabled(2, gameState.currentPlayer !== 2 || playerTwoLocked);

    if (gameState.currentPlayer === 1 && !playerOneLocked) {
        playerOneConfirm.disabled = gameState.selectedChoice === "";
    }

    if (gameState.currentPlayer === 2 && !playerTwoLocked) {
        playerTwoConfirm.disabled = gameState.selectedChoice === "";
    }
}

function handleConfirmChoice(event) {
    const playerNumber = Number(event.target.id === "player-1-confirm" ? 1 : 2);

    if (playerNumber !== gameState.currentPlayer || gameState.selectedChoice === "") {
        return;
    }

    if (playerNumber === 1) {
        gameState.playerOneChoice = gameState.selectedChoice;
        gameState.selectedChoice = "";
        gameState.currentPlayer = 2;
        currentTurn.textContent = "Player 2's Turn";
        gameMessage.textContent = "Player 1 is locked. Player 2, make your choice.";
        resetPlayerSelection(1);
        updatePanelState();
        return;
    }

    gameState.playerTwoChoice = gameState.selectedChoice;
    gameState.selectedChoice = "";
    currentTurn.textContent = "Get Ready";
    gameMessage.textContent = "Both players are locked in.";
    resetPlayerSelection(2);
    updatePanelState();
    startCountdown();
}

function setButtonsDisabled(playerNumber, shouldDisable) {
    getPlayerButtons(playerNumber).forEach((button) => {
        button.disabled = shouldDisable;
    });

    getConfirmButton(playerNumber).disabled = shouldDisable;
}

function startCountdown() {
    let countdownValue = 3;

    countdownArea.style.display = "block";
    timer.textContent = countdownValue;
    setButtonsDisabled(1, true);
    setButtonsDisabled(2, true);

    const countdownInterval = setInterval(() => {
        countdownValue -= 1;
        timer.textContent = countdownValue;

        if (countdownValue === 0) {
            clearInterval(countdownInterval);
            countdownArea.style.display = "none";
            showRoundResult();
        }
    }, 1000);
}

function getWinner() {
    if (gameState.playerOneChoice === gameState.playerTwoChoice) {
        return "draw";
    }

    const playerOneWins =
        (gameState.playerOneChoice === "rock" && gameState.playerTwoChoice === "scissors") ||
        (gameState.playerOneChoice === "paper" && gameState.playerTwoChoice === "rock") ||
        (gameState.playerOneChoice === "scissors" && gameState.playerTwoChoice === "paper");

        if (playerOneWins) {
            return "player1";} 
        else {
            return "player2";}

}

function formatChoice(choice) {
    return choice.charAt(0).toUpperCase() + choice.slice(1);
}

function showRoundResult() {
    const winner = getWinner();

    updateScores(winner);
    addRoundToHistory(winner);
    currentTurn.textContent = "Round Result";
    gameMessage.textContent = "The round is over. Check the result below.";
    resultsArea.style.display = "block";
    choicesReveal.textContent = `Player 1 chose ${formatChoice(gameState.playerOneChoice)}. Player 2 chose ${formatChoice(gameState.playerTwoChoice)}.`;

    if (winner === "draw") {
        winnerText.textContent = "It's a draw!";
        gameMessage.textContent = "Both players picked the same move.";
    } else if (winner === "player1") {
        winnerText.textContent = "Player 1 wins this round!";
    } else {
        winnerText.textContent = "Player 2 wins this round!";
    }

    playerOneStatus.textContent = "Round complete.";
    playerTwoStatus.textContent = "Round complete.";
}

function updateScores(winner) {
    if (winner === "player1") {
        gameState.playerOneScore += 1;
        playerOneScore.textContent = gameState.playerOneScore;
        return;
    }

    if (winner === "player2") {
        gameState.playerTwoScore += 1;
        playerTwoScore.textContent = gameState.playerTwoScore;
    }
}

function addRoundToHistory(winner) {
    let roundSummary = `Round ${gameState.roundNumber}: `;

    if (winner === "draw") {
        roundSummary += `Draw - both players chose ${formatChoice(gameState.playerOneChoice)}`;
    } else if (winner === "player1") {
        roundSummary += `Player 1 won with ${formatChoice(gameState.playerOneChoice)} against ${formatChoice(gameState.playerTwoChoice)}`;
    } else {
        roundSummary += `Player 2 won with ${formatChoice(gameState.playerTwoChoice)} against ${formatChoice(gameState.playerOneChoice)}`;
    }

    gameState.history.push(roundSummary);

    const historyItem = document.createElement("li");
    historyItem.textContent = roundSummary;
    historyList.prepend(historyItem);
}

function resetRound() {
    gameState.currentPlayer = 1;
    gameState.selectedChoice = "";
    gameState.playerOneChoice = "";
    gameState.playerTwoChoice = "";
    gameState.roundNumber += 1;

    resetPlayerSelection(1);
    resetPlayerSelection(2);
    resultsArea.style.display = "none";
    countdownArea.style.display = "none";
    currentTurn.textContent = "Player 1's Turn";
    gameMessage.textContent = "Player 1, choose your move and lock it in.";
    winnerText.textContent = "";
    choicesReveal.textContent = "";
    timer.textContent = "3";
    updatePanelState();
}

choiceButtons.forEach((button) => {
    button.addEventListener("click", handleChoiceSelection);
});

playerOneConfirm.addEventListener("click", handleConfirmChoice);
playerTwoConfirm.addEventListener("click", handleConfirmChoice);
nextRoundButton.addEventListener("click", resetRound);
updatePanelState();
