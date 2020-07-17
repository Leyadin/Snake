var canvas;
var ctx;

var circle;
var circle_x = 0;
var circle_y = 0; 

const IMG_SIZE = 20; //Pixel size of the .png files used
const MAX_BOUND = 19; 
const DELAY = 125; //Tick counter in miliseconds
const CANVAS_HEIGHT = 400; //Dimensions of the canvas
const CANVAS_WIDTH = 400;  
const MAX_SIZE = 400;  //How many spaces there are total on the canvas

//For readability, ascii value of inputs
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40;
const SPACEBAR = 32;

var x = new Array(MAX_SIZE);
var y = new Array(MAX_SIZE);

var length;
var direction;
var prevDirection;
var gameOver;
var tail;

//AI related variables
var timer;
var path;

function init() {
	//Set the canvas
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
	
	//Pre-set variables
	length = 2;
	tail = 1;
	gameOver = false;
	prevDirection = "";
	direction = "";
	path = [];
	//Load the initial state (snake and food)
	loadSnake(); 
	//Recursive game loop
    setTimeout("gamePlay()", DELAY); 
}    

function loadSnake() {
	//Clear canvas
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	//Head
	x[0] = 10 * IMG_SIZE;
	y[0] = 10 * IMG_SIZE;
	head = new Image();
	head.onload = function () {
		ctx.drawImage(head, x[0], y[0]);
	}
	head.src = "head.png";
	
	//Body
	x[1] = 10 * IMG_SIZE;
	y[1] = 11 * IMG_SIZE;
	body = new Image();
	body.onload = function () {
		ctx.drawImage(body, x[1], y[1]);
	}
	body.src = "body.png";
	
	//Food
	circle = new Image();
	moveCircle();
	circle.onload = function () {
		ctx.drawImage(circle, circle_x, circle_y);
	}
	circle.src = "circle.png";
	
}

function draw() {
	//Clear
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	//Circle
	ctx.drawImage(circle, circle_x, circle_y);
	//Body
	for (var i = 1; i < length; i++) {
		ctx.drawImage(body, x[i], y[i]);
	}
	//Head
	ctx.drawImage(head, x[0], y[0]);
} 

function moveCircle() {
	//Randomly place the circle
	var temp = Math.floor(Math.random() * MAX_BOUND);
	circle_x = temp * IMG_SIZE;
	temp = Math.floor(Math.random() * MAX_BOUND);
	circle_y = temp * IMG_SIZE;
	//Prevent overlap with the snake (replaces the circle if overlapping)
	for (var i = 0; i < length; i++) {
		if (x[i] == circle_x && y[i] == circle_y) {
			moveCircle();
			break;
		}
	}
}

function moveSnake() {
	//The body (each segment moves to previous one)
	for (var i = length; i > 0; i--) {
		x[i] = x[i - 1];
		y[i] = y[i - 1];
	}
	//The head (moves based on current keyboard direction)
	if (direction == "up") {
		y[0] = y[0] - IMG_SIZE;
	}
	else if (direction == "down") {
		y[0] = y[0] + IMG_SIZE;
	}
	else if (direction == "left") {
		x[0] = x[0] - IMG_SIZE;
	}
	else if (direction == "right") {
		x[0] = x[0] + IMG_SIZE;
	}
	//Prevent turning around due to quick key input
	prevDirection = direction; 
}

function checkCollision() {
	//Out of bounds
	if (x[0] < 0 || x[0] > MAX_BOUND * IMG_SIZE) {
		gameOver = true;
	}
	if (y[0] < 0 || y[0] > MAX_BOUND * IMG_SIZE) {
		gameOver = true;
	}
	//Crashing into itself
	for (var i = 1; i < length; i++) {
		if (x[0] == x[i] && y[0] == y[i]) {
			gameOver = true;
		}
	}
	//Eating a circle
	if (x[0] == circle_x && y[0] == circle_y) {
		//Add 4 segments when a circle is eaten
		length += 4;
		for (var i = length - 4; i < length; i++) {
			//Set the new pieces of the snake to the previous tail
			x[i] = x[tail];
			y[i] = y[tail];
		}

		tail += 4;
		//Replace the new circle
		moveCircle();
	}
}

function gamePlay() {
	//Wait for in input to start
	if (direction == "") {
		setTimeout("gamePlay()", DELAY);
	}
	else if (!gameOver) {
		moveSnake();
		draw();
		checkCollision();
		setTimeout("gamePlay()", DELAY); //Recursive loop until a game over condition
	} 
	else {
		alert("Game Over!");
	}
}

//Input recognition
onkeydown = function(e) {
    var key = e.keyCode;
    
    if (key == LEFT_KEY && prevDirection != "right") {
        direction = "left";
    }

    if (key == RIGHT_KEY && prevDirection != "left") {
        direction = "right";
    }

    if (key == UP_KEY && prevDirection != "down") {
        direction = "up";
    }

    if (key == DOWN_KEY && prevDirection != "up") {
        direction = "down";
    }        
	
	//Spacebar pauses
	if (key == SPACEBAR) {
		direction = "";
	}
};   

function breadthFirst() {
	
	var graph = new Array(MAX_BOUND + 1);
	
	for (var i = 0; i <= MAX_BOUND; i++) {
		graph[i] = new Array(MAX_BOUND + 1);
	}

	resetGraph(graph);
	
	var pathfound = false;
	var queue = [];
	//Array of all checks performed, used to find the path
	var checks = [];
	//Array of the indecies of the parents for each check, used to find the path
	var parent = [];
	var counter = 0;
	//Start at the head
	queue.push(x[0] / IMG_SIZE + "," + y[0] / IMG_SIZE);
	checks.push(x[0] / IMG_SIZE + "," + y[0] / IMG_SIZE);
	parent.push(-1);
	//Temporarily change the head's value so the loop doesn't quit early
	graph[x[0] / IMG_SIZE][y[0] / IMG_SIZE] = 3;
	
	//BFS
	while (queue.length > 0) {
		//Change the string input into two integers
		var str = queue.shift();
        var spl = str.split(",");
		var row = parseInt(spl[0]);
		var col = parseInt(spl[1]);
		
		//Out of bounds or already visited, skip
		if (row < 0 || col < 0 || row > MAX_BOUND || col > MAX_BOUND || graph[row][col] == 1) {
			counter++;
			continue;
		}
		//Found the circle
		if (graph[row][col] == 2) {
			pathfound = true;
			break;
		}
		
		//Mark as visited
		graph[row][col] = 1;
		
		queue.push(row + "," + (col - 1)); //Up
		checks.push(row + "," + (col - 1));
		queue.push(row + "," + (col + 1)); //Down
		checks.push(row + "," + (col + 1));
		queue.push((row - 1) + "," + col); //Left
		checks.push((row - 1) + "," + col);
		queue.push((row + 1) + "," + col); //Right	
		checks.push((row + 1) + "," + col);
		
		for (var i = 0; i < 4; i++) {
			parent.push(counter);
		}
		counter++;
	}
	
	var index;
	//Find the index of the result of the BFS
	for (var i = 0; i < checks.length; i++) {
		if (checks[i] == row + "," + col) {
			index = i;
			break;
		}
	}
	//If there is a clear path of the circle
	if (pathfound) {
		//Use the index to find all parent elements, creating a path from the head to the circle
		while (index != -1) {
			path.push(checks[index]);
			index = parent[index];
		}
		//remove the head
		path.pop();
		//Play the moves
		timer = setInterval(compMoveSnake, DELAY / 2);
	}
	//There is currently no path
	else {
		draw();
		alert("I can't find a path!");		
	}
	
}

function resetGraph(graph) {
	//Initialize the graph
	for (var i = 0; i <= MAX_BOUND; i++) { 
		for (var j = 0; j <= MAX_BOUND; j++)    { 
			graph[i][j] = -1; 
		} 
	}
	//Place the snake
	for (var i = 0; i < length; i++) {
		graph[x[i] / IMG_SIZE][y[i] / IMG_SIZE] = 1;
	}
	//Place the circle
	graph[circle_x / IMG_SIZE][circle_y / IMG_SIZE] = 2;
}

function compMoveSnake() {
	var row;
	var col;
	
	var temp = path.pop();
	var spl = temp.split(",");
	row = parseInt(spl[0]);
	col = parseInt(spl[1]); 

	for (var i = length; i > 0; i--) {
		x[i] = x[i - 1];
		y[i] = y[i - 1];
	}
	
	x[0] = row * IMG_SIZE;
	y[0] = col * IMG_SIZE;
	
	//Reached the circle, restart the search for the next one
	if (path.length == 0) {
		clearInterval(timer);
		compEatCircle();
		breadthFirst();
	}
	
	draw();
}

function compEatCircle() {
	length += 4;
		for (var i = length - 4; i < length; i++) {
			//Set the new pieces of the snake to the previous tail
			x[i] = x[tail];
			y[i] = y[tail];
		}
		
		tail += 4;
		
		moveCircle();
		draw();
}

//Solving for a hamiltonia cycle is NP-complete, so this is a very
//specific solution that works purely for this size and starting
//position.
function hamiltonianCycle() {
	var current_x = x[0] / IMG_SIZE;
	var current_y = y[0] / IMG_SIZE;
	var head_x = x[0] / IMG_SIZE;
	var head_y = y[0] / IMG_SIZE;
	//Head to top
	while (current_y > 0) {
		current_y--;
		path.push(current_x + "," + current_y);
	}
	//Zig zag to the bottom (ending at bottom right corner)
	while (current_y < MAX_BOUND) {
		//Go right on even y
		if (current_y % 2 == 0) {
			while (current_x < MAX_BOUND) {
				current_x++;
				path.push(current_x + "," + current_y);
			}
		}
		//Go left on odd y
		else {
			while (current_x > head_x + 1) {
				current_x--;
				path.push(current_x + "," + current_y);
			}
		}
		current_y++;
		path.push(current_x + "," + current_y);
	}
	//To the left (bottom left corner)
	while (current_x > 0) {
		current_x--;
		path.push(current_x + "," + current_y);
	}
	//To the top again (top left corner)
	while (current_y > 0) {
		current_y--;
		path.push(current_x + "," + current_y);
	}
	//Zig zag down to second to last row
	while (current_y < MAX_BOUND) {
		//Go right on odd y
		if (current_y % 2 == 1) {
			while (current_x > 1) {
				current_x--;
				path.push(current_x + "," + current_y);
			}
		}
		//Go left on even y
		else {
			while (current_x < head_x - 1) {
				current_x++;
				path.push(current_x + "," + current_y);
			}
		}
		current_y++;
		path.push(current_x + "," + current_y);
	}
	//Undo the last move
	current_y--;
	path.pop();
	//Go right one
	current_x++;
	path.push(current_x + "," + current_y);
	//Back up to the start (cycle complete) 
	while (current_y > head_y) {
		current_y--;
		path.push(current_x + "," + current_y);
	}
	
	timer = setInterval(hamiltonianMove, DELAY/4);
}

function hamiltonianMove() {
	var row;
	var col;
	
	//Loop once the cycle is done, until the snake fills the space
	if (path.length == 0) {
		clearInterval(timer);
		hamiltonianCycle();
		return;
	}
	
	var temp = path.shift();
	var spl = temp.split(",");
	row = parseInt(spl[0]);
	col = parseInt(spl[1]); 
	
	//Quit out if the snake has eaten everything
	if (row * IMG_SIZE == x[tail] && col * IMG_SIZE == y[tail]) {
		clearInterval(timer);
		alert("Cheater computer wins, somehow.");
		return;
	}

	for (var i = length; i > 0; i--) {
		x[i] = x[i - 1];
		y[i] = y[i - 1];
	}
	
	x[0] = row * IMG_SIZE;
	y[0] = col * IMG_SIZE;
	//Chck if the snake ate the circle
	if (row * IMG_SIZE == circle_x && col * IMG_SIZE == circle_y) {
		hamiltonianEatCircle();
	}
	
	draw();	
}

function hamiltonianEatCircle() {
	length += 12;
		for (var i = length - 12; i < length; i++) {
			//Set the new pieces of the snake to the previous tail
			x[i] = x[tail];
			y[i] = y[tail];
		}
		
		tail += 12;
		
		moveCircle();
		draw();
}