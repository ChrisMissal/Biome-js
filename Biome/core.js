var WORLD_WIDTH = 1700;
var WORLD_HEIGHT = 1700;

var CLEAR_COLOR = "#5292BF";

var FPS = 24;

var paused = true;

var context;
var organisms = [];

$(document).ready( function(){
    sizeCanvas();
    createContext();
    generateSystem(350);

    paused = false;
});

setInterval(function()
{
    if(!paused)
    {
        updateSystem();
        drawSystem();
    }
}, 1000/FPS);


function createContext()
{
    context = $('#canvas')[0].getContext("2d");
}

function sizeCanvas()
{
    var canvas = $('#canvas')[0];
    canvas.width = WORLD_WIDTH;
    canvas.height = WORLD_HEIGHT;
}

function generateSystem(amount)
{
    for(var i=0; i< amount; i++){
        organisms[i] = randomAtom(WORLD_WIDTH, WORLD_HEIGHT);
	}
}

function updateSystem()
{
	for (var i=0; i < organisms.length; i++){
		organisms[i].hitsAccountedFor = new Array();
		organisms[i].updatedThisFrame = 0;
	}
    for(var i=0; i <organisms.length; i++){
        organisms[i].update();
	}
}

function drawSystem()
{
    context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    context.fillStyle= CLEAR_COLOR;
    context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    for(var i=0; i <organisms.length; i++)
        organisms[i].draw();
}