const gameBoard = document.querySelector('.game-board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

const winningCombinations = [
    // Rows
    [0, 1, 2, 3], [1, 2, 3, 4],
    [5, 6, 7, 8], [6, 7, 8, 9],
    [10, 11, 12, 13], [11, 12, 13, 14],
    [15, 16, 17, 18], [16, 17, 18, 19],
    [20, 21, 22, 23], [21, 22, 23, 24],
    
    // Columns
    [0, 5, 10, 15], [5, 10, 15, 20],
    [1, 6, 11, 16], [6, 11, 16, 21],
    [2, 7, 12, 17], [7, 12, 17, 22],
    [3, 8, 13, 18], [8, 13, 18, 23],
    [4, 9, 14, 19], [9, 14, 19, 24],
    
    // Diagonals
    [0, 6, 12, 18], [1, 7, 13, 19],
    [5, 11, 17, 23], [6, 12, 18, 24],
    [3, 7, 11, 15], [4, 8, 12, 16],
    [8, 12, 16, 20], [9, 13, 17, 21]
];

// Add new variables for superpowers
const powerButtons = document.querySelectorAll('.power-btn');
let selectedPower = null;
const powerCounts = {
    'X': {
        buckshot: 3,
        laser: 3,
        cement: 3
    },
    'O': {
        buckshot: 3,
        laser: 3,
        cement: 3
    }
};
let cementedCells = new Set();

// Add new variables for game mode
let isAIMode = false;
const modeButtons = document.querySelectorAll('.mode-btn');

function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (!gameActive) return;

    if (selectedPower) {
        // Only cement power needs cell selection
        if (selectedPower === 'cement') {
            executePower(cell, cellIndex);
        }
        return;
    }

    // Don't allow moves when it's AI's turn
    if (isAIMode && currentPlayer === 'O') return;

    if (gameState[cellIndex] !== '') return;

    gameState[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer;
    
    if (checkWin()) {
        status.textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        return;
    }

    if (checkDraw()) {
        status.textContent = "Game ended in a draw!";
        gameActive = false;
        return;
    }

    switchPlayer();
}

function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function executePower(cell, cellIndex) {
    switch (selectedPower) {
        case 'buckshot':
            executeBuckshot();
            break;
        case 'laser':
            executeLaser();
            break;
        case 'cement':
            executeCement(cellIndex);
            break;
    }
    
    selectedPower = null;
    updatePowerButtons();
    
    if (checkWin()) {
        status.textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        return;
    }

    if (checkDraw()) {
        status.textContent = "Game ended in a draw!";
        gameActive = false;
        return;
    }

    switchPlayer();
}

function executeBuckshot() {
    let availableCells = [];
    cells.forEach((cell, index) => {
        if (!cementedCells.has(index)) {
            availableCells.push(index);
        }
    });

    for (let i = 0; i < 5 && availableCells.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const cellIndex = availableCells[randomIndex];
        
        gameState[cellIndex] = '';
        cells[cellIndex].textContent = '';
        
        cells[cellIndex].classList.add('buckshot-effect');
        setTimeout(() => {
            cells[cellIndex].classList.remove('buckshot-effect');
        }, 2000);
        
        availableCells.splice(randomIndex, 1);
    }
}

function executeLaser() {
    // First random line
    const isFirstVertical = Math.random() < 0.5;
    // Second random line
    const isSecondVertical = Math.random() < 0.5;
    
    // Clear first line
    if (isFirstVertical) {
        const randomCol = Math.floor(Math.random() * 5);
        for (let row = 0; row < 5; row++) {
            const index = row * 5 + randomCol;
            clearCell(index);
        }
    } else {
        const randomRow = Math.floor(Math.random() * 5);
        for (let col = 0; col < 5; col++) {
            const index = randomRow * 5 + col;
            clearCell(index);
        }
    }

    // Clear second line
    if (isSecondVertical) {
        const randomCol = Math.floor(Math.random() * 5);
        for (let row = 0; row < 5; row++) {
            const index = row * 5 + randomCol;
            clearCell(index);
        }
    } else {
        const randomRow = Math.floor(Math.random() * 5);
        for (let col = 0; col < 5; col++) {
            const index = randomRow * 5 + col;
            clearCell(index);
        }
    }
}

// Helper function for laser to clear and animate cells
function clearCell(index) {
    if (!cementedCells.has(index)) {
        gameState[index] = '';
        cells[index].textContent = '';
        
        cells[index].classList.add('laser-effect');
        setTimeout(() => {
            cells[index].classList.remove('laser-effect');
        }, 2000);
    }
}

function executeCement(cellIndex) {
    if (gameState[cellIndex] !== '') {
        cementedCells.add(cellIndex);
        cells[cellIndex].classList.add('cemented');
    }
}

// AI logic
function makeAIMove() {
    if (!gameActive || !isAIMode) return;

    // First check if player is close to winning and we have powers to counter
    if (shouldUseSuperpowerDefense()) {
        return;
    }

    // Check for winning move first
    for (let i = 0; i < 25; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            if (checkWin()) {
                cells[i].textContent = 'O';
                status.textContent = `Player O wins!`;
                gameActive = false;
                return;
            }
            gameState[i] = '';
        }
    }

    // Block player's winning move
    for (let i = 0; i < 25; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'X';
            if (checkWin()) {
                gameState[i] = 'O';
                cells[i].textContent = 'O';
                if (checkWin()) {
                    status.textContent = `Player O wins!`;
                    gameActive = false;
                    return;
                }
                currentPlayer = 'X';
                status.textContent = `Player X's turn`;
                updatePowerButtons();
                return;
            }
            gameState[i] = '';
        }
    }

    // Try to create a potential winning line
    for (let combo of winningCombinations) {
        let aiCount = 0;
        let emptySpots = [];
        let blocked = false;

        for (let index of combo) {
            if (gameState[index] === 'O') aiCount++;
            else if (gameState[index] === '') emptySpots.push(index);
            else if (gameState[index] === 'X') {
                blocked = true;
                break;
            }
        }

        if (!blocked && aiCount >= 1 && emptySpots.length > 0) {
            const moveIndex = emptySpots[0];
            gameState[moveIndex] = 'O';
            cells[moveIndex].textContent = 'O';
            currentPlayer = 'X';
            status.textContent = `Player X's turn`;
            updatePowerButtons();
            return;
        }
    }

    // If center and adjacent cells are available, prefer those
    const centerArea = [6, 7, 8, 11, 12, 13, 16, 17, 18];
    const availableCenterCells = centerArea.filter(i => gameState[i] === '');
    if (availableCenterCells.length > 0) {
        const moveIndex = availableCenterCells[Math.floor(Math.random() * availableCenterCells.length)];
        gameState[moveIndex] = 'O';
        cells[moveIndex].textContent = 'O';
        currentPlayer = 'X';
        status.textContent = `Player X's turn`;
        updatePowerButtons();
    }
}

function shouldUseSuperpowerDefense() {
    // Check all winning combinations for player's marks
    for (let combo of winningCombinations) {
        let playerCount = 0;
        let emptyCount = 0;
        
        for (let index of combo) {
            if (gameState[index] === 'X') playerCount++;
            else if (gameState[index] === '') emptyCount++;
        }

        // If player has 3 marks in a line and there's an empty spot
        if (playerCount === 3 && emptyCount === 1) {
            // Randomly choose between laser and buckshot if both are available
            const availablePowers = [];
            if (powerCounts['O'].laser > 0) availablePowers.push('laser');
            if (powerCounts['O'].buckshot > 0) availablePowers.push('buckshot');

            if (availablePowers.length > 0) {
                const randomPower = availablePowers[Math.floor(Math.random() * availablePowers.length)];
                
                if (randomPower === 'laser') {
                    powerCounts['O'].laser--;
                    executeLaser();
                } else {
                    powerCounts['O'].buckshot--;
                    executeBuckshot();
                }

                currentPlayer = 'X';
                status.textContent = `Player X's turn`;
                updatePowerButtons();
                return true;
            }
        }
    }
    return false;
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;
    updatePowerButtons();

    // Only schedule AI move if switching TO the AI's turn
    if (isAIMode && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

function updatePowerButtons() {
    powerButtons.forEach(button => {
        const buttonPlayer = button.dataset.player;
        const power = button.dataset.power;
        const count = powerCounts[buttonPlayer][power];
        
        button.textContent = `${power} (${count})`;
        button.disabled = buttonPlayer !== currentPlayer || count === 0;
    });
}

// Update power button event listeners
powerButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.dataset.player === currentPlayer) {
            const power = button.dataset.power;
            if (powerCounts[currentPlayer][power] > 0) {
                selectedPower = power;
                powerCounts[currentPlayer][power]--;
                status.textContent = `Using ${power} power...`;
                updatePowerButtons();

                // Immediately execute non-cement powers
                if (power !== 'cement') {
                    switch (power) {
                        case 'buckshot':
                            executeBuckshot();
                            selectedPower = null;
                            if (checkWin() || checkDraw()) {
                                gameActive = false;
                                return;
                            }
                            switchPlayer();
                            break;
                        case 'laser':
                            executeLaser();
                            selectedPower = null;
                            if (checkWin() || checkDraw()) {
                                gameActive = false;
                                return;
                            }
                            switchPlayer();
                            break;
                    }
                } else {
                    status.textContent = 'Select a cell to cement...';
                }
            }
        }
    });
});

// Add mode selection handling
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!button.classList.contains('active')) {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            isAIMode = button.dataset.mode === 'singleplayer';
            restartGame();
        }
    });
});

// Update restartGame to handle mode reset
function restartGame() {
    currentPlayer = 'X';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    cementedCells.clear();
    selectedPower = null;
    
    // Reset power counts
    for (let player in powerCounts) {
        for (let power in powerCounts[player]) {
            powerCounts[player][power] = 3;
        }
    }
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('cemented');
    });
    
    if (isAIMode) {
        status.textContent = "Playing vs AI - Your turn (X)";
    } else {
        status.textContent = "Player X's turn";
    }
    updatePowerButtons();
}

// Event Listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);

// Initialize the game
updatePowerButtons();
status.textContent = `Player ${currentPlayer}'s turn`; 