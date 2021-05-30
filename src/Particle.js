class Particle {
  constructor(x, y, border, flowfield, colored) {
    this.position = createVector(x, y);

    this.vertices = [];
    this.moveSpeed = steps;

    this.isMoving = true;
    this.removeFlag = false;

    this.border = border;
    this.flowfield = flowfield;

    this.color = color(random(40, 220), random(40, 220), random(40, 220));
    this.colored = colored;
  }

  render() {
    // setColor(black, false);
    noFill();
    if (colored)
      stroke(this.color);
    else
      stroke(245);
    beginShape();
    for (let i = 0; i < this.vertices.length; ++i) {
      let v = this.vertices[i];
      vertex(v.x, v.y);
    }
    endShape();
  }

  move() {
    let index = 0;
    let p = this.flowfield.flowPoints[0];
    try {
      index = this.flowfield.getFlowPointByCanvasPosition(this.position);
    } catch (e) {
      print(e);
      this.isMoving = false;
    }
    try {
      p = this.flowfield.flowPoints[index];
    } catch (e) {
      print(e);
      this.isMoving = false;
    }
    if (this.isMoving) {
      let xMove = sin(p.r * TWO_PI) * this.moveSpeed + this.position.x;
      let yMove = cos(p.r * TWO_PI) * this.moveSpeed + this.position.y;
      if (
        xMove > this.border && xMove < width - this.border && yMove > this.border && yMove < height - this.border
      ) {
        this.position.x = xMove;
        this.position.y = yMove;
      } else {
        this.isMoving = false;
      }
    }
  }

  addVertex() {
    this.vertices.push(
      {
        x: this.position.x,
        y: this.position.y
      }
    );
  }

  removeLoose() {
    if (this.isMoving === false) {
      if (this.vertices.length < 4) {
        this.removeFlag = true;
      }
    }
  }

  physics() {
    if (this.isMoving) {
      this.move();
      if (this.isMoving)
        this.addVertex();
    }
  }
}