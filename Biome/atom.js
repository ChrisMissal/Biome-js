var ATOM_TYPE = {
    A : { radius: 6.0, color:'red' },
    B : { radius: 5.0, color:'blue' },
    C : { radius: 4.0, color:'green' },
    D : { radius: 3.0, color:'white' }
};


function randomAtom(maxHeight, maxWidth)
{
	var totalSpeed = 5 * Math.random();
	var angle = Math.random()*360;
	var velX = Math.cos(angle) * totalSpeed;
	var velY = Math.sin(angle) * totalSpeed;
	
	var positionX = Math.floor(.5 * maxWidth);
	var positionY = Math.floor(.5 * maxHeight);
	
	//var positionX = Math.random() * maxWidth;
	//var positionY = Math.random() * maxHeight;

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

    return new atom([positionX, positionY], [velX,velY], type, angle);
}

function atom(position, velocity, type, angle)
{
	this.guid = hackyGuid() + "-" + hackyGuid() + "-" + hackyGuid();
	this.hitsAccountedFor = new Array();
	this.hitLastTime = new Array();
    this.type = type;
	this.angleDeg = angle;
    this.position = position;
    this.radius = ATOM_TYPE[type].radius;
	this.mass = (4.0/3.0) * Math.PI * ATOM_TYPE[type].radius * ATOM_TYPE[type].radius * ATOM_TYPE[type].radius;
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
        isHittingOtherAtoms(this);
		
    }
}

function isHittingOtherAtoms(atom1)
{
    var thisIndex = organisms.indexOf(atom1);

    for(var i=0; i < organisms.length; i++) {
        if(i != thisIndex) {
            twoAtomCollisionCheck(atom1, organisms[i]);    
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
	
	if(((position[1] < top) && (velocity[1] < 0)) || ((position[1] > bottom) && (velocity[1] > 0)))
		velocity[1] *= -1;
	if(((position[0] < left) && (velocity[0] < 0)) || ((position[0] > right) && (velocity[0] > 0)))
		velocity[0] *= -1;

    return velocity;
}

function twoAtomCollisionCheck(atom1, atom2)
{
    var diffX = (atom2.position[0] - atom1.position[0]);
    var diffY = (atom2.position[1] - atom1.position[1]);
    var radii = (atom1.radius + atom2.radius);
    var distanceSQ = (diffX * diffX) + (diffY * diffY);

    if(distanceSQ < (radii * radii)){
		if (!(($.inArray(atom2.guid, atom1.hitLastTime)) > 0) && !(($.inArray(atom1.guid, atom2.hitLastTime)) > 0)){
		
			if (!(($.inArray(atom2.guid, atom1.hitsAccountedFor)) > 0) && !(($.inArray(atom1.guid, atom2.hitsAccountedFor)) > 0)){
				twoDCollision(atom1, atom2);
				atom1.position[0] = atom1.position[0] + atom1.velocity[0]
				atom1.position[1] = atom1.position[1] + atom1.velocity[1]
				atom2.position[0] = atom2.position[0] + atom2.velocity[0]
				atom2.position[1] = atom2.position[1] + atom2.velocity[1]

				atom2.hitLastTime.push(atom1.guid);
				atom1.hitsAccountedFor.push(atom2.guid);
				atom2.hitsAccountedFor.push(atom1.guid);
			}
		}
		else{
			for (var i=atom1.hitLastTime.length; i>=0; i--) {
				if (atom1.hitLastTime[i] == atom2.guid) {
					atom1.hitLastTime.splice(i);
				}
			}
		}
	}
}

function twoDCollision(atomOne, atomTwo){
	var atomOneTotalSpeedPre = Math.sqrt(atomOne.velocity[0] * atomOne.velocity[0] + atomOne.velocity[1] * atomOne.velocity[1]);
	var atomTwoTotalSpeedPre = Math.sqrt(atomTwo.velocity[0] * atomTwo.velocity[0] + atomTwo.velocity[1] * atomTwo.velocity[1]);

	var angle = Math.atan2((atomOne.position[1] - atomTwo.position[1]), (atomOne.position[0] - atomTwo.position[0]));
	angle = angle * 57.2958; 
	
	var angularDiffOne = atomOne.angleDeg - angle;
	var angularDiffTwo = atomTwo.angleDeg - angle;
	
	var atomOneTotalSpeedPost = (atomOneTotalSpeedPre*(atomOne.mass - atomTwo.mass))/(atomOne.mass+atomTwo.mass)+2*atomTwo.mass*atomTwoTotalSpeedPre/(atomOne.mass + atomTwo.mass);
	var atomTwoTotalSpeedPost = (atomTwoTotalSpeedPre*(atomTwo.mass - atomOne.mass))/(atomOne.mass+atomTwo.mass)+2*atomOne.mass*atomOneTotalSpeedPre/(atomOne.mass + atomTwo.mass);

	var velOneX = atomOneTotalSpeedPost * Math.cos(angularDiffOne);
	var velOneY = atomOneTotalSpeedPost * Math.sin(angularDiffOne);
	var velTwoX = atomTwoTotalSpeedPost * Math.cos(angularDiffTwo);
	var velTwoY = atomTwoTotalSpeedPost * Math.sin(angularDiffTwo);
	
	atomTwo.velocity[0] = velTwoX;
	atomOne.velocity[0] = velOneX;
	atomTwo.velocity[1] = velTwoY;
	atomOne.velocity[1] = velOneY;
}


function hackyGuid() { //apparently JS can't generate real guids for some reason.  This is a random number generator
	return (Math.floor((1 + Math.random()) * 10000000).toString());
}

