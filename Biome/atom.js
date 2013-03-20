var ATOM_TYPE = {
    A : { radius: 6.0, color:'red' },
    B : { radius: 5.0, color:'blue' },
    C : { radius: 4.0, color:'green' },
    D : { radius: 3.0, color:'white' }
};


function randomAtom(maxHeight, maxWidth)
{
	var totalSpeed = 7.0 * Math.random();
	var angle = Math.random()*360;
	var velX = Math.cos(angle) * totalSpeed;
	var velY = Math.sin(angle) * totalSpeed;
	
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
    this.type = type;
	this.angleDeg = angle;
    this.position = position;
	this.positionLastFrame = position;
    this.radius = ATOM_TYPE[type].radius;
	this.mass = (4.0/3.0) * Math.PI * ATOM_TYPE[type].radius * ATOM_TYPE[type].radius * ATOM_TYPE[type].radius;
	this.structureMass = this.mass;
    this.velocity = velocity;
    this.color = ATOM_TYPE[type].color;
	this.overlapArray = new Array();
	this.bondedTo = new Array();
	this.isInMolecule = 0;
	this.bindsPlant = 0;
	if (this.type == 'A' || this.type == 'B'){
		this.moleculeType = "typeOne";
	}
	if (this.type == 'C' || this.type == 'D'){
		this.moleculeType = "typeTwo";
	}
	this.moleculeIsComplete = 0;
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
		this.updatedThisFrame = 1;
    }
	this.move = function() {
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1]
	}
}

function createMolecule(atomsArray){
	//var totalSpeed = 12.0 * Math.random();
	var angle = Math.random()*360;
	totalMass = 0.0
	for (i=0; i<atomsArray.length;i++){
		totalMass = totalMass + atomsArray[i].mass
	}
	var totalSpeed = 0.0
	for (i=0;i<atomsArray.length;i++){
		totalSpeed = totalSpeed + ((Math.sqrt(atomsArray[i].velocity[0] * atomsArray[i].velocity[0] + atomsArray[i].velocity[1] * atomsArray[i].velocity[1])) * (atomsArray[i].mass/totalMass));
	}
	var structVelX = Math.cos(angle) * totalSpeed;
	var structVelY = Math.sin(angle) * totalSpeed;
	for (i=0;i<atomsArray.length;i++){
		atomsArray[i].isInMolecule = 1;
		atomsArray[i].structureMass = totalMass;
		atomsArray[i].velocity[0] = structVelX;
		atomsArray[i].velocity[1] = structVelY;
		for (j=0;j<atomsArray.length;j++){
			if (!(j == i)){
				atomsArray[i].bondedTo.push(atomsArray[j].guid)
			}
		}
	}
}

function createPlant (atomsArray){
	for (i = 0; i<atomsArray.length; i++){
		//atomsArray[i].isInMolecule = 0;
		//alert ("ya got me");
		atomsArray[i].isInPlant = 1;
		atomsArray[i].velocity[0] = 0;
		atomsArray[i].velocity[1] = 0;
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
					organisms[j].velocity[1] = atom.velocity[1];
				}
			}
		}
	}
	if(((atom.position[0] < left) && (atom.velocity[0] < 0)) || ((atom.position[0] > right) && (atom.velocity[0] > 0))){
		atom.velocity[0] *= -1;
		for (var i=0; i < atom.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom.bondedTo[i]){
					organisms[j].velocity[0] = atom.velocity[0];
				}
			}
		}
	}
}

function bounceOffOfObject(atom){
	atom.velocity[0] *= -1;
	for (var i=0; i < atom.bondedTo.length; i++){
		for (var j=0; j < organisms.length; j++){
			if (organisms[j].guid == atom.bondedTo[i]){
				organisms[j].velocity[0] = atom.velocity[0];
			}
		}
	}
	
	atom.velocity[1] *= -1;
	for (var i=0; i < atom.bondedTo.length; i++){
		for (var j=0; j < organisms.length; j++){
			if (organisms[j].guid == atom.bondedTo[i]){
				organisms[j].velocity[1] = atom.velocity[1];
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
		atomsArray = new Array();
		atomsArray.push(atom1);
		atomsArray.push(atom2);
		createMolecule(atomsArray);
		if (atom1.type == 'C' && atom2.type == 'D' || atom1.type == 'D' && atom2.type == 'C'){
			atom1.moleculeIsComplete = 1;
			atom2.moleculeIsComplete = 1;
		}
	}
	else if (distanceSQ < (radii * radii) && ((atom1.type == 'A' && atom2.type == 'B' && atom1.isInMolecule == 1 && atom2.isInMolecule == 0 && atom1.bondedTo.length == 1) || (atom1.type == 'B' && atom2.type == 'A' && atom2.isInMolecule == 1 && atom1.isInMolecule == 0 && atom2.bondedTo.length == 1))){
		atomsArray = new Array();
		atomsArray.push(atom1);
		atomsArray.push(atom2);
		atom1.moleculeIsComplete = 1;
		atom2.moleculeIsComplete = 1;
		for (var i=0; i < atom1.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom1.bondedTo[i] && !(organisms[j] == atom2)){
					atomsArray.push(organisms[j]);
					organisms[j].moleculeIsComplete = 1;
				}
			}
		}
		for (var i=0; i < atom2.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom2.bondedTo[i] && !(organisms[j] == atom1)){
					atomsArray.push(organisms[j]);
					organisms[j].moleculeIsComplete = 1;
				}
			}
		}
		createMolecule(atomsArray);
	}
	
	else if (distanceSQ < (radii * radii) && ((atom1.type == 'B' && atom2.type == 'B' && atom1.moleculeIsComplete == 1 && atom2.moleculeIsComplete == 1) || (atom1.type == 'C' && atom2.type == 'D' && atom1.moleculeIsComplete == 1 && atom2.moleculeIsComplete == 1))){
		atomsArray = new Array();
		alreadyBonded = 0;
		for (var i=0; i < atom1.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom1.bondedTo[i] && (organisms[j] == atom2)){
					alreadyBonded = 1
				}
			}
		}
		atomsArray.push(atom1);
		atomsArray.push(atom2);
		for (var i=0; i < atom1.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom1.bondedTo[i] && !(organisms[j] == atom2)){
					atomsArray.push(organisms[j]);
				}
			}
		}
		for (var i=0; i < atom2.bondedTo.length; i++){
			for (var j=0; j < organisms.length; j++){
				if (organisms[j].guid == atom2.bondedTo[i] && !(organisms[j] == atom1)){
					atomsArray.push(organisms[j]);
				}
			}
		}
		if (alreadyBonded == 0 && !(atom1.bindsPlant == 1 || atom2.bindsPlant == 1)){
			createPlant(atomsArray);
			atom1.bindsPlant = 1;
			atom2.bindsPlant = 1;
		}
	}
	
	
	areBonded = 0
	for (var i=0; i < atom1.bondedTo.length; i++){
		if (atom2.guid == atom1.bondedTo[i]){
			areBonded = 1;
		}
	}
    if(distanceSQ < (radii * radii) && areBonded == 0 && atom1.overlapArray.indexOf(atom2.guid) == -1 && atom2.overlapArray.indexOf(atom1.guid) == -1){
		twoDCollision(atom1, atom2);
		atom1.overlapArray.push(atom2.guid);
		atom2.overlapArray.push(atom1.guid);
	}
	if(distanceSQ > (radii * radii) && atom1.overlapArray.indexOf(atom2.guid) > -1){
		guidPosition = atom1.overlapArray.indexOf(atom2.guid);
		atom1.overlapArray.splice(guidPosition);
	}
	if(distanceSQ > (radii * radii) && atom2.overlapArray.indexOf(atom1.guid) > -1){
		guidPosition = atom2.overlapArray.indexOf(atom1.guid);
		atom2.overlapArray.splice(guidPosition);
	}
}

function twoDCollision(atomOne, atomTwo){
	if (atomOne.isInPlant == 1){
		bounceOffOfObject(atomTwo);
	}
	else if (atomTwo.isInPlant == 1){
		bounceOffOfObject(atomOne);
	}

	else{
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
}


function hackyGuid() { //apparently JS can't generate real guids for some reason.  This is a random number generator
	return (Math.floor((1 + Math.random()) * 10000000).toString());
}

