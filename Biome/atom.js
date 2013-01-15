function randomAtom(radius, maxHeight, maxWidth)
{
    var speed = Math.floor(Math.random() * 2)
    var positionX = Math.floor(Math.random() * maxWidth);
    var positionY = Math.floor(Math.random() * maxHeight);

    return new atom([positionX, positionY], speed, radius);
}

function atom(position, speed, radius)
{
    this.position = position;
    this.radius = radius;
    this.speed = speed;
    this.draw = function() {
        context.beginPath();
        context.fillStyle = 'green';
        context.arc(
            this.position[0], this.position[1], this.radius, 2*Math.PI, false
        );
        context.fill();
    };
    this.update = function() {
        this.position[0] += this.speed;
        this.position[1] += this.speed;
    }
}