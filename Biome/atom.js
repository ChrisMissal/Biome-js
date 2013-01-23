var ATOM_TYPE = {
    A : { radius: 6, color:'red' },
    B : { radius: 5, color:'blue' },
    C : { radius: 4, color:'green' },
    D : { radius: 3, color:'white' }
};


function randomAtom(maxHeight, maxWidth)
{
	var totalSpeed = 12.0 * Math.random();
	var xPercent = Math.random() - .00001; // - .00001 prevents divide by 0 errors
	var yPercent = 1 - xPercent;
	
	var velX = xPercent * totalSpeed;
	var velY = yPercent * totalSpeed;
	var multBy = totalSpeed / (Math.sqrt((velX*velX)+(velY*velY)));
	velX = multBy * velX;
	velY = multBy * velY;
	
	if (Math.floor(Math.random()*2) == 0){
		velY *= -1;
	}
	if (Math.floor(Math.random()*2) == 0){
		velX *= -1;
	}

    //var positionX = Math.floor(Math.random() * maxWidth);
    //var positionY = Math.floor(Math.random() * maxHeight);
	var positionX = Math.floor(.5 * maxWidth);
	var positionY = Math.floor(.5 * maxHeight);

    var type;
    var typeRoll = Math.floor(Math.random()*9);
    if( typeRoll >= 0 && typeRoll < 3)
        type ='D';
    else if( typeRoll >= 3 && typeRoll < 6)
        type='C';
    else if( typeRoll == 6 || typeRoll == 7)
        type = 'B';
    else
        type = 'A';

    return new atom([positionX, positionY], [velX,velY], type);
}

function atom(position, velocity, type)
{
    this.type = type;
    this.position = position;
    this.radius = ATOM_TYPE[type].radius;
    this.velocity = velocity;
    this.color = ATOM_TYPE[type].color;
    this.draw = function() {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(
            this.position[0], this.position[1], this.radius, 2*Math.PI, false
        );
        context.fill();
    };
    this.update = function() {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];

        this.velocity = bounceOffOfEdges(this.radius, this.position, this.velocity);
        //this.color = isHittingOtherAtoms(this) ? 'red' : 'green';
    }
}

function isHittingOtherAtoms(atom1)
{
    var thisIndex = organisms.indexOf(atom1);

    for(var i=0; i < organisms.length; i++) {
        if(i != thisIndex) {
            if(twoAtomCollisionCheck(atom1, organisms[i]))
                return true;
        }
    }

    return false;
}

function bounceOffOfEdges(radius, position, velocity)
{
    var top = 0 + radius;
    var bottom = WORLD_HEIGHT - radius;
    var left = 0 + radius;
    var right = WORLD_WIDTH - radius;

    if(position[1] < top || position[1] > bottom)
        velocity[1] *= -1;
    if(position[0] < left || position[0] > right)
        velocity[0] *= -1;

    return velocity;
}

function twoAtomCollisionCheck(atom1, atom2)
{
    var diffX = (atom2.position[0] - atom1.position[0]);
    var diffY = (atom2.position[1] - atom1.position[1]);
    var radii = (atom1.radius + atom2.radius);
    var distanceSQ = (diffX * diffX) + (diffY * diffY);

    if(distanceSQ < (radii * radii))
        return true;
    else
        return false;
}