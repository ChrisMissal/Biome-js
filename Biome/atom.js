var ATOM_TYPE = {
    A : { radius: 6.0, color:'red' },
    B : { radius: 5.0, color:'blue' },
    C : { radius: 4.0, color:'green' },
    D : { radius: 3.0, color:'white' }
};


function randomAtom(maxHeight, maxWidth)
{
	var totalSpeed = 5.0 * Math.random();
	var angle = Math.random()*360;
	var velX = Math.cos(angle) * totalSpeed;
	var velY = Math.sin(angle) * totalSpeed;
	var isInMolecule = 0;
	var isInPlant = 0;
	var isInAnimal = 0;
	
	//var positionX = Math.floor(.5 * maxWidth);
	//var positionY = Math.floor(.5 * maxHeight);
	
	var positionX = Math.random() * maxWidth;
	var positionY = Math.random() * maxHeight;

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
	this.positionLastFrame = position;
    this.radius = ATOM_TYPE[type].radius;
	this.mass = (4.0/3.0) * Math.PI * ATOM_TYPE[type].radius * ATOM_TYPE[type].radius * ATOM_TYPE[type].radius;
	this.structureMass = this.mass;
    this.velocity = velocity;
    this.color = ATOM_TYPE[type].color;
	this.bondedTo = new Array();
    this.draw = function() {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(
            this.position[0], this.position[1], this.radius, 2*Math.PI, false
        );
        context.fill();
    };
    this.update = function() {
		this.positionLastFrame[0] = this.position[0];
		this.positionLastFrame[1] = this.position[1];
        isHittingOtherAtoms(this);
		bounceOffOfEdges(this);
        //this.position[0] += this.velocity[0];
        //this.position[1] += this.velocity[1];
		this.updatedThisFrame = 1;
    }
	this.move = function() {
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1]
	}
}

function createMolecule(atomOne, atomTwo){
	atomOne.isInMolecule = 1;
	atomTwo.isInMolecule = 1;
	atomOne.structureMass = atomOne.mass + atomTwo.mass;
	atomTwo.structureMass = atomOne.mass + atomTwo.mass;
	structVelX = Math.random()* 5.0;
	structVelY = Math.random() * 5.0
	atomOne.velocity[0] = structVelX;
	atomTwo.velocity[0] = structVelX;
	atomOne.velocity[1] = structVelY;
	atomTwo.velocity[1] = structVelY;
	atomOne.bondedTo.push(atomTwo.guid);
	atomTwo.bondedTo.push(atomOne.guid);
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

function bounceOffOfEdges(atom)
{
    var top = 0 + atom.radius;
    var bottom = WORLD_HEIGHT - atom.radius;
    var left = 0 + atom.radius;
    var right = WORLD_WIDTH - atom.radius;
	
	if(((atom.position[1] < top) && (atom.velocity[1] < 0)) || ((atom.position[1] > bottom) && (atom.velocity[1] > 0))){
		atom.velocity[1] *= -1;
		for (var i=0; i < atom.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom.bondedTo[i]){
					organisms[j].velocity[1] *= -1;
				}
			}
		}
	}
	if(((atom.position[0] < left) && (atom.velocity[0] < 0)) || ((atom.position[0] > right) && (atom.velocity[0] > 0))){
		atom.velocity[0] *= -1;
		for (var i=0; i < atom.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom.bondedTo[i]){
					organisms[j].velocity[0] *= -1;
				}
			}
		}
	}
}

function twoAtomCollisionCheck(atom1, atom2)
{
    var diffX = (atom2.position[0] - atom1.position[0]);
    var diffY = (atom2.position[1] - atom1.position[1]);
    var radii = (atom1.radius + atom2.radius);
    var distanceSQ = (diffX * diffX) + (diffY * diffY);
	
	if (distanceSQ < (radii * radii) && !(atom1.isInMolecule == 1 || atom2.isInMolecule == 1) && (atom1.type == 'A' && atom2.type == 'B' || atom1.type == 'B' && atom2.type == 'A' || atom1.type == 'C' && atom2.type == 'D' || atom1.type == 'D' && atom2.type == 'C')){
		createMolecule(atom1, atom2);
	}
	areBonded = 0
	for (var i=0; i < atom1.bondedTo.length; i++){
		if (atom2.guid == atom1.bondedTo[i]){
			areBonded = 1;
		}
	}
    if(distanceSQ < (radii * radii) && areBonded == 0){
		if (!(($.inArray(atom2.guid, atom1.hitLastTime)) > 0) && !(($.inArray(atom1.guid, atom2.hitLastTime)) > 0)){
		
			if (!(($.inArray(atom2.guid, atom1.hitsAccountedFor)) > 0) && !(($.inArray(atom1.guid, atom2.hitsAccountedFor)) > 0)){
				twoDCollision(atom1, atom2);
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
	
	var atomOneTotalSpeedPost = (atomOneTotalSpeedPre*(atomOne.structureMass - atomTwo.structureMass))/(atomOne.structureMass+atomTwo.structureMass)+2*atomTwo.structureMass*atomTwoTotalSpeedPre/(atomOne.structureMass + atomTwo.structureMass);
	var atomTwoTotalSpeedPost = (atomTwoTotalSpeedPre*(atomTwo.structureMass - atomOne.structureMass))/(atomOne.structureMass+atomTwo.structureMass)+2*atomOne.structureMass*atomOneTotalSpeedPre/(atomOne.structureMass + atomTwo.structureMass);

	var velOneX = atomOneTotalSpeedPost * Math.cos(angularDiffOne);
	var velOneY = atomOneTotalSpeedPost * Math.sin(angularDiffOne);
	var velTwoX = atomTwoTotalSpeedPost * Math.cos(angularDiffTwo);
	var velTwoY = atomTwoTotalSpeedPost * Math.sin(angularDiffTwo);
	
	atomTwo.velocity[0] = velTwoX;
	for (var i=0; i < atomTwo.bondedTo.length; i++){
		for (var j=0; j < organisms.length; j++){
			if (organisms[j].guid == atomTwo.bondedTo[i]){
				organisms[j].velocity[0] = velTwoX;
			}
		}
	}
	atomOne.velocity[0] = velOneX;
	for (var i=0; i < atomOne.bondedTo.length; i++){
		for (var j=0; j < organisms.length; j++){
			if (organisms[j].guid == atomOne.bondedTo[i]){
				organisms[j].velocity[0] = velOneX;
			}
		}
	}
	atomTwo.velocity[1] = velTwoY;
	for (var i=0; i < atomTwo.bondedTo.length; i++){
		for (var j=0; j < organisms.length; j++){
			if (organisms[j].guid == atomTwo.bondedTo[i]){
				organisms[j].velocity[1] = velTwoY;
			}
		}
	}
	atomOne.velocity[1] = velOneY;
	for (var i=0; i < atomOne.bondedTo.length; i++){
		for (var j=0; j < organisms.length; j++){
			if (organisms[j].guid == atomOne.bondedTo[i]){
				organisms[j].velocity[1] = velOneY;
			}
		}
	}
}


function hackyGuid() { //apparently JS can't generate real guids for some reason.  This is a random number generator
	return (Math.floor((1 + Math.random()) * 10000000).toString());
}

