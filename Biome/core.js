var WORLD_WIDTH = 800;
var WORLD_HEIGHT = 600;

var CLEAR_COLOR = "#5292BF";

var FPS = 24;


var context;

$(document).ready( function(){
    sizeCanvas();
    createContext();
});

setInterval(function()
{
    updateSystem();
    drawSystem();
}), 1000/FPS;


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
    var organisms = [];

    for(var i=0; i < amount; i++)
    {
        organisms[i] = randomAtom(4, WORLD_HEIGHT, WORLD_WIDTH);
    }

    return organisms;
}

function updateSystem()
{
}

function drawSystem()
{
    context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    context.fillStyle= CLEAR_COLOR;
    context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}