let score = 0;
let isGameRunning = false;
let gameInterval;

// Select DOM elements
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const playerNameInput = document.getElementById('player-name');
const leaderboardElement = document.getElementById('leaderboard');  // Leaderboard element

// Initialize the snake position and direction
let snakePosition = { x: 10, y: 10 };
let direction = { x: 1, y: 0 };

// Array to keep track of all snake segments
const snakeHead = document.getElementById('snake-head');
let snakeSegments = [snakeHead];

// Initialize food position
let foodPosition = { x: getRandomPosition(), y: getRandomPosition() };

// Create food element and add to the game board
const food = document.createElement('div');
food.classList.add('food');
food.style.gridColumn = foodPosition.x;
food.style.gridRow = foodPosition.y;
document.getElementById('game-board').appendChild(food);

// Initialize event listeners
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', () => resetGame(false));  // Pass `false` to indicate manual reset
document.addEventListener('keydown', changeDirection);  // Listen for key presses to change direction

// Fetch and display the leaderboard when the page loads
window.onload = fetchLeaderboard;

function startGame() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name to start the game.');
        return;
    }

    isGameRunning = true;
    startButton.disabled = true;
    resetButton.disabled = false;
    playerNameInput.disabled = true;

    // Start the game loop
    gameInterval = setInterval(moveSnake, 200);
}

function resetGame(isCollisionReset) {
    if (isGameRunning) {
        // Stop the game loop
        clearInterval(gameInterval);
        isGameRunning = false;

        // Save the score only if the game is not reset due to collision
        if (isCollisionReset) {
            alert('Game Over! You collided with yourself.');
        }

        saveScore();

        // Reset UI elements
        startButton.disabled = false;
        resetButton.disabled = true;
        playerNameInput.disabled = false;
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
        playerNameInput.value = '';

        // Refresh the leaderboard
        fetchLeaderboard();
    }

    // Reset the snake position and segments
    snakePosition = { x: 10, y: 10 };
    direction = { x: 1, y: 0 };
    snakeSegments.slice(1).forEach(segment => segment.remove());
    snakeSegments = [snakeHead];
    snakeHead.style.gridColumn = snakePosition.x;
    snakeHead.style.gridRow = snakePosition.y;

    // Reset food position
    foodPosition = { x: getRandomPosition(), y: getRandomPosition() };
    food.style.gridColumn = foodPosition.x;
    food.style.gridRow = foodPosition.y;
}

function saveScore() {
    const playerName = playerNameInput.value.trim();
    fetch('http://localhost:3000/scores', {  // Use the correct backend port
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score: score }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error saving score:', error));
}

function fetchLeaderboard() {
    fetch('http://localhost:3000/scores')  // Fetch scores from the server
        .then(response => response.json())
        .then(data => {
            leaderboardElement.innerHTML = '';  // Clear the leaderboard
            data.forEach(({ name, score }) => {
                const li = document.createElement('li');
                li.textContent = `${name}: ${score}`;
                leaderboardElement.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
}

function moveSnake() {
    if (!isGameRunning) return;

    const previousHeadPosition = { x: snakePosition.x, y: snakePosition.y };

    snakePosition.x += direction.x;
    snakePosition.y += direction.y;

    // Prevent snake from moving out of bounds
    if (snakePosition.x < 1) snakePosition.x = 20;
    if (snakePosition.x > 20) snakePosition.x = 1;
    if (snakePosition.y < 1) snakePosition.y = 20;
    if (snakePosition.y > 20) snakePosition.y = 1;

    // Check for self-collision before updating the head position
    for (let i = 1; i < snakeSegments.length; i++) {
        if (snakeSegments[i].style.gridColumn === snakePosition.x.toString() &&
            snakeSegments[i].style.gridRow === snakePosition.y.toString()) {
            resetGame(true);  // Pass `true` to indicate collision reset
            return;
        }
    }

    // Update positions of all segments (starting from the tail)
    for (let i = snakeSegments.length - 1; i > 0; i--) {
        snakeSegments[i].style.gridColumn = snakeSegments[i - 1].style.gridColumn;
        snakeSegments[i].style.gridRow = snakeSegments[i - 1].style.gridRow;
    }

    // Move the head to the new position
    snakeHead.style.gridColumn = snakePosition.x;
    snakeHead.style.gridRow = snakePosition.y;

    // Check if the snake eats the food
    if (snakePosition.x === foodPosition.x && snakePosition.y === foodPosition.y) {
        growSnake(previousHeadPosition);

        // Move food to a new random position
        foodPosition = { x: getRandomPosition(), y: getRandomPosition() };
        food.style.gridColumn = foodPosition.x;
        food.style.gridRow = foodPosition.y;

        // Increment the score
        score++;
        scoreElement.textContent = `Score: ${score}`;
    }
}

function changeDirection(event) {
    if (!isGameRunning) return;

    switch (event.key) {
        case 'ArrowUp':
            if (direction.y !== 1) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) direction = { x: 1, y: 0 };
            break;
    }
}

function growSnake(previousHeadPosition) {
    const newSegment = document.createElement('div');
    newSegment.classList.add('snake-segment');
    newSegment.style.gridColumn = previousHeadPosition.x;
    newSegment.style.gridRow = previousHeadPosition.y;

    document.getElementById('game-board').appendChild(newSegment);
    snakeSegments.push(newSegment);
}

function getRandomPosition() {
    return Math.floor(Math.random() * 20) + 1;
}