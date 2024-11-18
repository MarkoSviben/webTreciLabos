const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 50;
const BALL_SPEED = 6;

let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 10;
let ballDX = BALL_SPEED * (Math.random() * 2 - 1);
let ballDY = -BALL_SPEED;
let rightPressed = false;
let leftPressed = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let bricks = [];
let gameOver = false;
let gameWon = false;
let BRICK_ROWS = 12;
let BRICK_COLUMNS = Math.floor((canvas.width - 2 * BRICK_OFFSET_LEFT) / (75 + BRICK_PADDING));
const BRICK_WIDTH = 75;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
const rowsInput = document.getElementById('rowsInput');
const endOverlay = document.getElementById('endOverlay');
const endMessage = document.getElementById('endMessage');
const restartButton = document.getElementById('restartButton');

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMNS; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

initBricks();

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    ctx.save(); 
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    for (let c = 0; c < BRICK_COLUMNS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                let brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.fillStyle = '#00FF00';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
    ctx.restore(); 
}

function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMNS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ballX > b.x &&
                    ballX < b.x + BRICK_WIDTH &&
                    ballY > b.y &&
                    ballY < b.y + BRICK_HEIGHT
                ) {
                    ballDY = -ballDY;
                    b.status = 0;
                    score++;
                    if (score === BRICK_ROWS * BRICK_COLUMNS) {
                        gameWon = true;
                        gameOver = true;
                        updateHighScore();
                        showEndOverlay('POBJEDA!');
                    }
                }
            }
        }
    }
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'right';
    ctx.fillText(`Bodovi: ${score}  Najbolji rezultat: ${highScore}`, canvas.width - 20, 20);
}

function drawMessage(message) {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    ballX += ballDX;
    ballY += ballDY;

    if (ballX + BALL_RADIUS > canvas.width || ballX - BALL_RADIUS < 0) {
        ballDX = -ballDX;
    }

    if (ballY - BALL_RADIUS < 0) {
        ballDY = -ballDY;
    }

    if (
        ballY + BALL_RADIUS > canvas.height - PADDLE_HEIGHT - 10 &&
        ballX > paddleX &&
        ballX < paddleX + PADDLE_WIDTH
    ) {
        ballDY = -ballDY;
    }

    if (ballY + BALL_RADIUS > canvas.height) {
        gameOver = true;
        updateHighScore();
        showEndOverlay('KRAJ IGRE');
    }

    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    if (!gameOver) {
        requestAnimationFrame(draw);
    }
}

function startGame() {
    BRICK_ROWS = parseInt(rowsInput.value) || 12;
    BRICK_COLUMNS = Math.floor((canvas.width - 2 * BRICK_OFFSET_LEFT) / (BRICK_WIDTH + BRICK_PADDING));
    initBricks();
    score = 0;
    gameOver = false;
    gameWon = false;
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 10;
    ballDX = BALL_SPEED * (Math.random() * 2 - 1);
    ballDY = -BALL_SPEED;
    startOverlay.style.display = 'none';
    endOverlay.style.display = 'none';
    draw();
}

function restartGame() {
    startGame();
}

function showEndOverlay(message) {
    endMessage.textContent = message;
    endOverlay.style.display = 'flex';
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
