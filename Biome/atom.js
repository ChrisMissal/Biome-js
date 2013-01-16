function randomAtom(radius, maxHeight, maxWidth)
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

    return new atom([positionX, positionY], [velX,velY], radius);
}

function atom(position, velocity, radius)
{
    this.position = position;
    this.radius = radius;
    this.velocity = velocity;
    this.draw = function() {
        context.beginPath();
        context.fillStyle = 'green';
        context.arc(
            this.position[0], this.position[1], this.radius, 2*Math.PI, false
        );
        context.fill();
    };
    this.update = function() {
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];

        this.velocity = bounceOffOfEdges(this.radius, this.position, this.velocity);
    }
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