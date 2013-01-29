var ATOM_TYPE = {
    A : { radius: 6, color:'red' },
    B : { radius: 5, color:'blue' },
    C : { radius: 4, color:'green' },
    D : { radius: 3, color:'white' }
};


function randomAtom(maxHeight, maxWidth)
{
	var totalSpeed = 12.0 * Math.random();
	var angle = Math.random()*360;
	var velX = Math.cos(angle) * totalSpeed;
	var velY = Math.sin(angle) * totalSpeed;
	
	var positionX = Math.floor(.5 * maxWidth);
	var positionY = Math.floor(.5 * maxHeight);
	
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
    this.radius = ATOM_TYPE[type].radius;
	this.area = ATOM_TYPE[type].radius * ATOM_TYPE[type].radius * Math.PI;
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
				//atom2.velocity[0] *= -1;
				//atom1.velocity[0] *= -1;
				//atom2.velocity[1] *=-1;
				//atom1.velocity[1] *= -1;
				//atom1.hitLastTime.push(atom2.guid);
				atom2.hitLastTime.push(atom1.guid);
				//atom1.hitsAccountedFor.push(atom2.guid); //IT APPEARS THAT CUTTING THIS VERY MUCH HELPS THE CURRENT PROPLEMS
				//atom2.hitsAccountedFor.push(atom1.guid);
				//for (var i=atom2.hitsAccountedFor.length; i>=0; i--) {
				//	if (atom2.hitsAccountedFor[i] == atom1.guid) {
				//		atom2.hitsAccountedFor.splice(i);
				//	}
				//}
				//for (var i=atom1.hitsAccountedFor.length; i>=0; i--) {
				//	if (atom1.hitsAccountedFor[i] == atom2.guid) {
				//		atom1.hitsAccountedFor.splice(i);
				//	}
				//}
			}
			else{
				for (var i=atom2.hitLastTime.length; i>=0; i--) {
					if (atom2.hitLastTime[i] == atom1.guid) {
						atom2.hitLastTime.splice(i);
					}
				}
				for (var i=atom1.hitLastTime.length; i>=0; i--) {
					if (atom1.hitLastTime[i] == atom2.guid) {
						atom1.hitLastTime.splice(i);
					}
				}
			}
		}
		else{
			for (var i=atom2.hitLastTime.length; i>=0; i--) {
				if (atom2.hitLastTime[i] == atom1.guid) {
					atom2.hitLastTime.splice(i);
				}
			}
			for (var i=atom1.hitLastTime.length; i>=0; i--) {
				if (atom1.hitLastTime[i] == atom2.guid) {
					atom1.hitLastTime.splice(i);
				}
			}
		}

			//	return true;
	}
    //else{
    //    return false;
	//}
}

function twoDCollision(atomOne, atomTwo){
	var angle = Math.atan2(Math.abs(atomOne.position[1] - atomTwo.position[1]), Math.abs(atomOne.position[0] - atomTwo.position[0]));
	angle = angle * 57.2958;
	
	var angularDiffOne = atomOne.angleDeg - angle;
	var atomOneTotalSpeed = Math.sqrt(atomOne.velocity[0] * atomOne.velocity[0] + atomOne.velocity[1] * atomOne.velocity[1]);
	var angularDiffTwo = atomTwo.angleDeg - angle;
	var atomTwoTotalSpeed = Math.sqrt(atomTwo.velocity[0] * atomTwo.velocity[0] + atomTwo.velocity[1] * atomTwo.velocity[1]);
	
	var velOneX = atomOneTotalSpeed * Math.cos(angularDiffOne);
	var velOneY = atomOneTotalSpeed * Math.sin(angularDiffOne);
	var velTwoX = atomTwoTotalSpeed * Math.cos(angularDiffTwo);
	var velTwoY = atomTwoTotalSpeed * Math.cos(angularDiffTwo);
	
	var velOneXNew = (velOneX*((atomOne.area - atomTwo.area)) + 2*(atomTwo.area * velTwoX)) / (atomOne.area + atomTwo.area); //Note that I added the Math.abs() wrapper here.  Pretty sure it's right though
	var velTwoXNew = (velTwoX*((atomOne.area - atomTwo.area)) + 2*(atomTwo.area * velOneX)) / (atomOne.area + atomTwo.area);
	
	var velOneTotal = (Math.sqrt((velOneXNew * velOneXNew) + (velOneY * velOneY)));
	var velTwoTotal = (Math.sqrt((velTwoXNew * velTwoXNew) + (velTwoY * velTwoY)));
	
	directionOne = Math.atan2(velOneY, velOneXNew) + angle;
	directionTwo = Math.atan2(velTwoY, velTwoXNew) + angle;
	
	atomOne.velocity[0] = Math.cos(velOneTotal);
	atomOne.velocity[1] = Math.sin(velOneTotal);
	
	atomTwo.velocity[0] = Math.cos(velTwoTotal);
	atomTwo.velocity[1] = Math.sin(velTwoTotal);
}

function hackyGuid() { //apparently JS can't generate real guids for some reason.  This is a random number generator
	return (Math.floor((1 + Math.random()) * 10000000).toString());
}

