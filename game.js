// namjestanje canvasa
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// definiranje konstanti
const PADDLE_WIDTH = 100;         
const PADDLE_HEIGHT = 20;        
const BALL_RADIUS = 10;           
const BRICK_HEIGHT = 20;          
const BRICK_PADDING = 5;           
const BRICK_OFFSET_TOP = 50;      
const BRICK_OFFSET_LEFT = 0;     
const BALL_SPEED = 4;             

// definiranje varijabli
let paddleX = (canvas.width - PADDLE_WIDTH) / 2; // pocetne pozicije palice i loptice
let ballX = canvas.width / 2;                    
let ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 10;
let ballDX = BALL_SPEED * (Math.random() * 2 - 1); //incijalizacije brzine loptice
let ballDY = -BALL_SPEED;                          
let rightPressed = false;                         
let leftPressed = false;                           
let score = 0;                                     
let highScore = localStorage.getItem('highScore') || 0; 
let bricks = [];                                   
let gameOver = false;                              
let gameWon = false;                               
let BRICK_ROWS = 12;                               
let BRICK_COLUMNS = Math.floor((canvas.width - 2 * BRICK_OFFSET_LEFT) / (75 + BRICK_PADDING)); // Broj stupaca cigli
const BRICK_WIDTH = 75;                             // Širina cigle

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

//  elemenati za start i end 
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
const rowsInput = document.getElementById('rowsInput');
const endOverlay = document.getElementById('endOverlay');
const endMessage = document.getElementById('endMessage');
const restartButton = document.getElementById('restartButton');

// funkcija za kretanje palice
function keyDownHandler(e) {
    switch (e.key) {
        case 'Right':
        case 'ArrowRight':
            rightPressed = true;
            break;
        case 'Left':
        case 'ArrowLeft':
            leftPressed = true;
            break;
        default:
            break;
    }
}

// Funkcija za prekid kretanja palice
function keyUpHandler(e) {
    switch (e.key) {
        case 'Right':
        case 'ArrowRight':
            rightPressed = false;
            break;
        case 'Left':
        case 'ArrowLeft':
            leftPressed = false;
            break;
        default:
            break;
    }
}


// postavljanje cigli
function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMNS; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 znači da je cigla aktivna
        }
    }
}

initBricks();

// funkcija za crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD'; // Boja loptice
    ctx.fill();
    ctx.closePath();
}

// funkcija za crtanje palice
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

// funkcija za crtanje cigli
function drawBricks() {
    ctx.save(); 
    ctx.shadowColor = '#000'; 
    ctx.shadowBlur = 5;       

    for (let c = 0; c < BRICK_COLUMNS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
            if (bricks[c][r].status === 1) { // Ako je cigla aktivna
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

// Funkcija za detekciju sudara loptice s ciglama, zidovima i palicom
function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMNS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
            let b = bricks[c][r];
            if (b.status === 1) { // Ako je cigla aktivna
                if (
                    ballX > b.x &&
                    ballX < b.x + BRICK_WIDTH &&
                    ballY > b.y &&
                    ballY < b.y + BRICK_HEIGHT
                ) {
                    ballDY = -ballDY; // Promijeni smjer loptice
                    b.status = 0;     // Uništi ciglu
                    score++;          // Povećaj bodove

                    // Provjera je li igrač pobijedio
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

// funkcija za ažuriranje najboljeg rezultata u local storage
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

// Funkcija za crtanje bodova na canvasu
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'right';
    ctx.fillText(`Bodovi: ${score}  Najbolji rezultat: ${highScore}`, canvas.width - 20, 20);
}

// Funkcija za prikaz poruke (Game Over ili Pobjeda)
function drawMessage(message) {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Glavna funkcija za crtanje igre
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Očisti Canvas

    drawBricks();      
    drawBall();        
    drawPaddle();      
    drawScore();      
    collisionDetection(); 

    ballX += ballDX;
    ballY += ballDY;

    // Sudar loptice sa zidom
    if (ballX + BALL_RADIUS > canvas.width || ballX - BALL_RADIUS < 0) {
        ballDX = -ballDX; 
    }
//sudar loptice sa stropom
    if (ballY - BALL_RADIUS < 0) {
        ballDY = -ballDY; // Promijeni vertikalni smjer
    }

    // sudar loptice s palicom
    if (
        ballY + BALL_RADIUS > canvas.height - PADDLE_HEIGHT - 10 &&
        ballX > paddleX &&
        ballX < paddleX + PADDLE_WIDTH
    ) {
        ballDY = -ballDY; 
    }

    //  (kraj igre)
    if (ballY + BALL_RADIUS > canvas.height) {
        gameOver = true;
        updateHighScore();
        showEndOverlay('KRAJ IGRE');
    }

    // Pomicanje palice na 
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += 7; 
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7; 
    }

    if (!gameOver) {
        requestAnimationFrame(draw);
    }
}

// pokretanje igre 
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
    startGame(); // Ponovno pokreni igru
}

//  prikaz end overlaya s porukom
function showEndOverlay(message) {
    endMessage.textContent = message; 
    endOverlay.style.display = 'flex'; 
}

// event listenere za start i restart gumbe
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Pokreni igru samo kada je stranica učitana i elementi dostupni
window.onload = () => {
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
};
