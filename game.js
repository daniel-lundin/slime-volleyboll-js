var ctx;
var WIDTH = 500;
var HEIGHT = 300;

var sidestep = 4;
var jumpSpeed = 8;
var gravity = 0.5;
var slimeRadius = 50.0;
var ballRadius = 10.0;
var wallWidth = 20.0;
var wallHeight = 100.0;

var score = 0;
var lastScore = 0;

var slime1 = {};
var slime2 = {};
var ball = {};

var A = 65;
var D = 68;
var W = 87;
var S = 83;
var LEFT = 37;
var RIGHT = 39;
var UP = 38;
var DOWN = 40;
var keyState = { };

var gameState;
var history = [];
var historySize = 200;
var historyIdx = 0;

function init() {
    gameState = playState;
    resetPlayField();
    var canvas = document.getElementById('screen');
    ctx = canvas.getContext('2d');
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    drawBackground();
    drawSlime("#ffff00", slime1.pos.x, slime1.pos.y);
    drawSlime("#00ffff", slime2.pos.x, slime2.pos.y);
    setInterval("tick()", 20);
}

function resetPlayField() {
    slime1.pos = {};
    slime1.pos.x = WIDTH/4;
    slime1.pos.y = 0;
    slime1.yspeed = 0;

    slime2.pos = {};
    slime2.pos.x = WIDTH/4 + WIDTH/2;
    slime2.pos.y = 0;
    slime2.yspeed = 0;

    ball.pos = {};
    ball.pos.x = WIDTH/4;
    ball.pos.y = 150;
    ball.speed = {};
    ball.speed.x = 0;
    ball.speed.y = 0;
}

function drawBackground() {

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#aaa";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#f00";
    // Draw scoreboard
    for(var i=0;i<3+score;++i) {
        ctx.beginPath();
        ctx.arc(20 + i*40, 20, 10, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    for(i=0;i<3-score;++i) {
        ctx.beginPath();
        ctx.arc(WIDTH - i*40 - 20, 20, 10, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    // Draw floor
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#f0f";
    ctx.fillRect(0, HEIGHT-20, WIDTH, 20);
    ctx.strokeRect(0, HEIGHT-20, WIDTH, 20);

    // Draw wall
    ctx.strokeStyle = "#0ff";
    ctx.fillStyle = "#00f";
    ctx.fillRect(WIDTH/2-wallWidth/2, HEIGHT-20-wallHeight, wallWidth, wallHeight);
    ctx.strokeRect(0, HEIGHT-20, WIDTH, 20);

}

function drawSlime(color, x, y) {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, HEIGHT-y-20, 50, 0, Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x+20, HEIGHT - y - 20 - 10, ballRadius, 0, Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function drawBall(x, y) {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(x, HEIGHT - y - 20, ballRadius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

}

function keyDown(evt) {
    keyState[evt.keyCode] = true;
}

function keyUp(evt) {
    keyState[evt.keyCode] = false;
}

function tick() {
    gameState();
}

function playState() {
    if(keyState[A])
        slime1.pos.x = Math.max(50, slime1.pos.x-sidestep);
    if (keyState[D])
        slime1.pos.x = Math.min(WIDTH/2 - slimeRadius - wallWidth/2, slime1.pos.x+sidestep);
    if(slime1.pos.y == 0 && keyState[W])
        slime1.yspeed = jumpSpeed;

    slime1.pos.y = Math.max(0, slime1.pos.y+slime1.yspeed);
    if(slime1.pos.y > 0)
        slime1.yspeed -= gravity;

    if(keyState[LEFT])
        slime2.pos.x = Math.max(WIDTH/2+slimeRadius+wallWidth/2, slime2.pos.x-sidestep);
    if (keyState[RIGHT])
        slime2.pos.x = Math.min(WIDTH-slimeRadius, slime2.pos.x+sidestep);
    if(slime2.pos.y == 0 && keyState[UP])
        slime2.yspeed = jumpSpeed;

    slime2.pos.y = Math.max(0, slime2.pos.y+slime2.yspeed);
    if(slime2.pos.y > 0)
        slime2.yspeed -= 0.5;

    ball.speed.y -= gravity;
    ball.speed.y = Math.max(-10, Math.min(ball.speed.y, 10));
    ball.pos.y += ball.speed.y;
    ball.pos.x += ball.speed.x;
    checkCollisions();
    drawBackground();
    drawSlime("#ffff00", slime1.pos.x, slime1.pos.y);
    drawSlime("#00ffff", slime2.pos.x, slime2.pos.y);
    drawBall(ball.pos.x, ball.pos.y);

    // Save history for playback
    var snapshot = {
        slime1pos: [slime1.pos.x, slime1.pos.y],
        slime2pos: [slime2.pos.x, slime2.pos.y],
        ballpos: [ball.pos.x, ball.pos.y]
    };
    history[historyIdx] = snapshot;
    lastFrame = historyIdx;
    historyIdx += 1;
    historyIdx = historyIdx % historySize;
}

function endRoundState() {
    drawBackground();
    if(keyState[32]) {
        resetPlayField();
        gameState = playState;
    }
    ctx.font = "20pt Arial";
    if(score > 0)
        ctx.fillText("Yellow slime scores!", 120, 100);
    else
        ctx.fillText("Blueish slime scores!", 120, 100);

    ctx.fillText("Press space to play next round", 60, 150);

    if((historyIdx * 8) % historySize > historySize/2)
        ctx.fillText("Replay!", 220, 50);

    var snapshot = history[historyIdx];
    historyIdx += 1;
    historyIdx = historyIdx % historySize;
    if(snapshot) {
        drawSlime("#ffff00", snapshot.slime1pos[0], snapshot.slime1pos[1]);
        drawSlime("#00ffff", snapshot.slime2pos[0], snapshot.slime2pos[1]);
        drawBall(snapshot.ballpos[0], snapshot.ballpos[1]);
    }
}

function endGameState() {
    if(keyState[32]) {
        resetPlayField();
        score = 0;
        gameState = playState;
    }
    drawBackground();
    ctx.font = "20pt Arial";
    ctx.fillText("Game over", 180, 100);
    if(score > 0)
        ctx.fillText("Yellow slime is the winner!", 100, 150);
    else
        ctx.fillText("Blueish slime is the winner!", 100, 150);
}

function checkCollisions() {
    var distSquared1 = Math.pow(slime1.pos.x-ball.pos.x, 2) + Math.pow(slime1.pos.y-ball.pos.y, 2);
    var distSquared2 = Math.pow(slime2.pos.x-ball.pos.x, 2) + Math.pow(slime2.pos.y-ball.pos.y, 2);
    if(distSquared1 < Math.pow(65, 2)) {
        ball.speed.y += (ball.pos.y - slime1.pos.y);
        ball.speed.x += (ball.pos.x - slime1.pos.x)*0.1;
    }
    if(distSquared2 < Math.pow(65, 2)) {
        ball.speed.y += (ball.pos.y - slime2.pos.y);
        ball.speed.x += (ball.pos.x - slime2.pos.x)*0.1;
    }

    // Bounce off walls
    if(ball.pos.x < ballRadius) {
        ball.speed.x = Math.abs(ball.speed.x);
    }
    if(ball.pos.x > WIDTH - ballRadius) {
        ball.speed.x = -Math.abs(ball.speed.x);
    }
    // Bounce on wall
    if(ball.pos.x > WIDTH/2-ballRadius &&
       ball.pos.x < WIDTH/2+ballRadius &&
       ball.pos.y - ballRadius < wallHeight &&
       ball.pos.y - ballRadius > wallHeight - 5) {
        ball.speed.y = Math.abs(ball.speed.y);
    }

    if(ball.pos.x + ballRadius > WIDTH/2-wallWidth &&
       ball.pos.x + ballRadius < WIDTH/2 &&
       ball.pos.y - ballRadius < wallHeight) {
        ball.speed.x = -Math.abs(ball.speed.x);
    }

    if(ball.pos.x + ballRadius < WIDTH/2+wallWidth &&
       ball.pos.x + ballRadius > WIDTH/2 &&
       ball.pos.y - ballRadius < wallHeight) {
        ball.speed.x = Math.abs(ball.speed.x);
    }

    if(ball.pos.y - ballRadius < 10) {
        lastScore = 1 + (ball.pos.x < WIDTH/2)*-2;
        score += lastScore;
        if(score == 3 || score == -3)
            gameState = endGameState;
        else
            gameState = endRoundState;
    }
}
