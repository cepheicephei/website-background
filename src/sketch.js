// DECLARE GLOABAL VARIABLES
let border, pause, showFlowfield, colored, particleAmount;
let particles = [];
let flowfield;

// DECLARE COLORS
let white, black, blue;

// DECLARE BUTTONS
let buttonPause, buttonResume, buttonClear, buttonToggleFlowfield, buttonRegenerateFlowfield, buttonToggleColored;

// DECLARE SLIDERS
let sliderMaxParticles, sliderSpeed;

// DECLARE CONSTANTS

function inititalizeGlobalVariables() {
  // stepSize = parseInt(random(10, 20));
  stepSize = 10;
  border = 0;
  pause = false;
  showFlowfield = false;
  colored = false;
  particleAmount = 600;

  flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);

  white = color(245);
  black = color(40);
  blue = color(80, 80, 220);
}

let canvasWidth;
let canvasHeight;

function setup() {
  let div = document.querySelector('#wrapper');

  canvasWidth = ceil(div.clientWidth);
  canvasHeight = ceil(div.clientHeight);
  // let div = createDiv().addClass('wrapper');
  // div.mousePressed(() => { flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight); particles = [] });
  createCanvas(canvasWidth, canvasHeight).parent(div).addClass('canvas');
  // myWidth = floor(canvasWidth / 100) * 100;
  // myHeight = floor(canvasHeight / 100) * 100;

  inititalizeGlobalVariables();
  // div.addClass('wrapper');

  // buttonRegenerateFlowfield = createButton("Regenerate Flowfield").addClass('button').parent(div);
  // buttonRegenerateFlowfield.mouseClicked(() => { flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight); particles = [] });

  // buttonClear = createButton("Clear").addClass('button').parent(div);
  // buttonClear.mouseClicked(() => { particles = [] });

  // buttonPause = createButton("Pause").addClass('button').parent(div);
  // buttonPause.mouseClicked(() => { pause = true });

  // buttonResume = createButton("Resume").addClass('button').parent(div);
  // buttonResume.mouseClicked(() => { pause = false });

  // buttonToggleFlowfield = createButton("Toggle Flowfield").addClass('button').parent(div);
  // buttonToggleFlowfield.mouseClicked(() => { showFlowfield = !showFlowfield });

  // buttonToggleColored = createButton("Toggle Color").addClass('button').parent(div);
  // buttonToggleColored.mouseClicked(() => {
  //   colored = !colored;
  //   particles.forEach(p => {
  //     p.colored = !p.colored;
  //   })
  // });

  // sliderMaxParticles = createSlider(1, 10000, 2000, 1).addClass('slider').parent(div);
  // sliderSpeed = createSlider(1, 200, 20, 1).addClass('slider').parent(div);
}

function draw() {

  for (let speedUp = 0; speedUp < 2; ++speedUp) {
    background(255);

    if (!pause) {
      if (particles.length >= particleAmount) {
        // particles.splice(0, particles.length - particleAmount);
        flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);
        particles = [];
      }
      particles.push(new Particle(random(border, canvasWidth - border), random(border, canvasHeight - border), border, colored));
    }

    for (let i = 0; i < particles.length; ++i) {
      let p = particles[i];
      if (!pause)
        p.physics();
      p.removeLoose();
      if (p.removeFlag)
        particles.splice(i, 1);
    }
  }

  if (showFlowfield)
    flowfield.render("arrow");

  for (let i = 0; i < particles.length; ++i) {
    particles[i].render();
  }
}

class Flowfield {
  constructor(_stepSize, width, height) {
    this.stepSize = _stepSize;
    this.flowPoints = [];
    this.width = width;
    this.height = height;

    let increment = random(0.001, 0.1);
    noiseDetail(parseInt(random(8)), parseInt(random(1)));
    // 4, 0.9 are good values!
    noiseSeed(parseInt(random(100)));

    let yoff = 0.0;
    for (let y = 0; y < this.height; y += this.stepSize) {
      yoff += increment;
      let xoff = 0.0;
      for (let x = 0; x < this.width; x += this.stepSize) {
        xoff += increment;
        this.flowPoints.push(
          {
            x: x,
            y: y,
            r: noise(xoff, yoff)
          }
        );
      }
    }
  }

  render(type) {
    this.flowPoints.forEach(p => {
      let x = p.x + this.stepSize / 2;
      let y = p.y + this.stepSize / 2;
      let r = p.r;

      // MAKE SWITCH CASE
      if (type === "text") {
        noStroke();
        fill(20);
        text(nfc(r, 2), x, y);
      } else if (type === "arrow") {
        this.renderArrow(createVector(x, y), radians(map(r, 0, 1, 0, 360)), this.stepSize * 0.4);
      }
    });
  }

  renderArrow(position, rotation, length) {
    push();
    translate(position.x, position.y);
    rotate(-rotation);
    noFill();
    stroke(40, 40, 210);
    line(0, length / 2, 0, -length / 2);
    line(0, length / 2, length / 5, length / 4);
    line(0, length / 2, -length / 5, length / 4);
    pop();
  }

  sample(position) {
    return this.flowPoints[getFlowPointByCanvasPosition(position)].r;
  }

  getFlowPointByCanvasPosition(canvasPosition) {
    let index = floor(canvasPosition.x / this.stepSize) + floor(canvasPosition.y / this.stepSize) * floor(this.width / this.stepSize);
    return index;
  }
}

class Particle {
  constructor(x, y, border, colored) {
    this.position = createVector(x, y);

    this.vertices = [];
    this.moveSpeed = stepSize;

    this.isMoving = true;
    this.removeFlag = false;

    this.border = border;

    this.color = color(random(40, 220), random(40, 220), random(40, 220));
    this.colored = colored;
  }

  render() {
    noFill();
    if (colored)
      stroke(this.color);
    else
      stroke(40, 40);
    beginShape();
    for (let i = 0; i < this.vertices.length; ++i) {
      let v = this.vertices[i];
      vertex(v.x, v.y);
    }
    endShape();
  }

  move() {
    let index = 0;
    let p;
    try {
      index = flowfield.getFlowPointByCanvasPosition(this.position);
    } catch (e) {
      print(e);
      this.isMoving = false;
    }
    try {
      p = flowfield.flowPoints[index];
    } catch (e) {
      print(e);
      this.isMoving = false;
    }
    if (this.isMoving) {
      let xMove = sin(p.r * TWO_PI) * this.moveSpeed + this.position.x;
      let yMove = cos(p.r * TWO_PI) * this.moveSpeed + this.position.y;
      if (xMove >= this.border && xMove <= width - this.border && yMove >= this.border && yMove <= height - this.border) {
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