var canvas;
var ctx;
var WIDTH = 500;
var HEIGHT = 300;
var sidestep = 4;
var jump_speed = 8;
var gravity = 0.5;
var slime_radius = 50.0;
var ball_radius = 10.0;
var wall_width = 20.0;
var wall_height = 50.0;
var score = 0;
var last_score = 0;

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
var key_state = { };
var game_state;

function init() {
    game_state = play_state;
    reset_play_field();
    canvas = document.getElementById('screen');
    ctx = canvas.getContext('2d');
    document.onkeydown = key_down;
    document.onkeyup = key_up;
    draw_background();
    draw_slime("#ffff00", slime1.pos.x, slime1.pos.y);
    draw_slime("#00ffff", slime2.pos.x, slime2.pos.y);
    setInterval("tick()", 20);
}

function reset_play_field() {
    slime1.pos = {};
    slime1.pos.x = WIDTH/4;
    slime1.pos.y = 0;
    slime1.yspeed = 0

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

function draw_background() {

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

    for(var i=0;i<3-score;++i) {
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
    ctx.fillRect(WIDTH/2-wall_width/2, HEIGHT-20-wall_height, wall_width, wall_height);
    ctx.strokeRect(0, HEIGHT-20, WIDTH, 20);

}

function draw_slime(color, x, y) {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, HEIGHT-y-20, 50, 0, Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function draw_ball() {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(ball.pos.x, HEIGHT - ball.pos.y - 20, ball_radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function key_down(evt) {
    key_state[evt.keyCode] = true;
}

function key_up(evt) {
    key_state[evt.keyCode] = false;
}

function tick() {
    game_state();
}

function play_state() {
    if(key_state[A])
        slime1.pos.x = Math.max(50, slime1.pos.x-sidestep);
    if (key_state[D])
        slime1.pos.x = Math.min(WIDTH/2 - slime_radius - wall_width/2, slime1.pos.x+sidestep);
    if(slime1.pos.y == 0 && key_state[W])
        slime1.yspeed = jump_speed;

    slime1.pos.y = Math.max(0, slime1.pos.y+slime1.yspeed);
    if(slime1.pos.y > 0)
        slime1.yspeed -= gravity;

    if(key_state[LEFT])
        slime2.pos.x = Math.max(WIDTH/2+slime_radius+wall_width/2, slime2.pos.x-sidestep);
    if (key_state[RIGHT])
        slime2.pos.x = Math.min(WIDTH-slime_radius, slime2.pos.x+sidestep);
    if(slime2.pos.y == 0 && key_state[UP])
        slime2.yspeed = jump_speed;

    slime2.pos.y = Math.max(0, slime2.pos.y+slime2.yspeed);
    if(slime2.pos.y > 0)
        slime2.yspeed -= 0.5;

    ball.speed.y -= gravity;
    ball.speed.y = Math.max(-10, Math.min(ball.speed.y, 10));
    ball.pos.y += ball.speed.y;
    ball.pos.x += ball.speed.x;
    check_collisions();
    draw_background();
    draw_slime("#ffff00", slime1.pos.x, slime1.pos.y);
    draw_slime("#00ffff", slime2.pos.x, slime2.pos.y);
    draw_ball();
}

function end_round_state() {
    draw_background();
    if(key_state[32]) {
        reset_play_field();
        game_state = play_state;
    }
    ctx.font = "20pt Arial";
    if(score > 0)
        ctx.fillText("Yellow slime scores!", 100, 150);
    else
        ctx.fillText("Blueish slime scores!", 100, 150);
}

function end_game_state() {
    if(key_state[32]) {
        reset_play_field();
        score = 0;
        game_state = play_state;
    }
    draw_background();
    ctx.font = "20pt Arial";
    ctx.fillText("Game over", 180, 100);
    if(score > 0)
        ctx.fillText("Yellow slime is the winner!", 100, 150);
    else
        ctx.fillText("Blueish slime is the winner!", 100, 150);
}

function check_collisions() {
    var dist_squared1 = Math.pow(slime1.pos.x-ball.pos.x, 2) + Math.pow(slime1.pos.y-ball.pos.y, 2);
    var dist_squared2 = Math.pow(slime2.pos.x-ball.pos.x, 2) + Math.pow(slime2.pos.y-ball.pos.y, 2);
    if(dist_squared1 < Math.pow(70, 2)) {
        ball.speed.y = Math.abs(ball.speed.y) + Math.max(0, slime1.yspeed);
        ball.speed.x = (ball.pos.x - slime1.pos.x)*0.1;
    }
    if(dist_squared2 < Math.pow(70, 2)) {
        ball.speed.y = Math.abs(ball.speed.y) + Math.max(0, slime2.yspeed);
        ball.speed.x = (ball.pos.x - slime2.pos.x)*0.1;
    }

    // Bounce off walls
    if(ball.pos.x < ball_radius) {
        ball.speed.x = Math.abs(ball.speed.x);
    }
    if(ball.pos.x > WIDTH - ball_radius) {
        ball.speed.x = -Math.abs(ball.speed.x);
    }
    // TODO: Bounce off middle wall

    if(ball.pos.y < 0) {
        last_score = 1 + (ball.pos.x < WIDTH/2)*-2;
        score += last_score;
        if(score == 3 || score == -3) 
            game_state = end_game_state;
        else
            game_state = end_round_state;
    }
}
