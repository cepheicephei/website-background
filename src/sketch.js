// DECLARE GLOABAL VARIABLES
let pause, particleAmount;
let particles = [];
let flowfield;

// DECLARE COLORS
let white, black, blue;

// DECLARE BUTTONS
let buttonPause, buttonResume, buttonClear, buttonRegenerateFlowfield;

// DECLARE SLIDERS
let sliderMaxParticles, sliderSpeed;

// DECLARE CONSTANTS

function inititalizeGlobalVariables() {
  // stepSize = parseInt(random(10, 20));
  stepSize = 15;
  pause = false;
  particleAmount = 800;

  flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);

  white = color(245);
  black = color(40);
  blue = color(80, 80, 220);
}

let canvasWidth;
let canvasHeight;
let div;

function setup() {
  div = document.querySelector('#wrapper');

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


  // sliderMaxParticles = createSlider(1, 10000, 2000, 1).addClass('slider').parent(div);
  // sliderSpeed = createSlider(1, 200, 20, 1).addClass('slider').parent(div);
}

function windowResized() {
  pause = true;
  canvasWidth = ceil(div.clientWidth);
  canvasHeight = ceil(div.clientHeight);
  resizeCanvas(canvasWidth, canvasHeight);
  flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);
  particles = [];
  pause = false;
}

function draw() {
  if (!pause) {
    for (let speedUp = 0; speedUp < 2; ++speedUp) {
      background(255);

      if (!pause) {
        if (particles.length >= particleAmount) {
          // particles.splice(0, particles.length - particleAmount);
          flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);
          particles = [];
        }
        particles.push(new Particle(random(canvasWidth), random(canvasHeight)));
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

    for (let i = 0; i < particles.length; ++i) {
      particles[i].render();
    }
  }
}

class Flowfield {
  constructor(_stepSize, width, height) {
    this.stepSize = _stepSize;
    this.flowPoints = [];
    this.width = width;
    this.height = height;

    this.xvals = 0;
    this.yvals = 0;

    this.increment = random(0.001, 0.01);
    noiseDetail(parseInt(random(8)), random(0.9));
    // 4, 0.9 are good values!
    noiseSeed(parseInt(random(100)));

    this.yoff = 0.0;
    for (let y = 0; y < this.height; y += this.stepSize) {
      this.yvals++;
      this.yoff += this.increment;
      this.xoff = 0.0;
      this.xvals = 0;
      for (let x = 0; x < this.width; x += this.stepSize) {
        this.xvals++;
        this.xoff += this.increment;
        this.flowPoints.push(
          {
            x: x,
            y: y,
            r: noise(this.xoff, this.yoff)
          }
        );
      }
    }
  }

  getFlowPointByCanvasPosition(canvasPosition) {
    let index = floor(map(canvasPosition.x, 0, canvasWidth, 0, this.xvals)) + floor(map(canvasPosition.y, 0, canvasHeight, 0, this.yvals)) * this.xvals;
    return index;
  }
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);

    this.vertices = [];
    this.moveSpeed = stepSize;

    this.isMoving = true;
    this.removeFlag = false;

    this.color = color(random(140, 240), random(140, 240), random(140, 240));
  }

  render() {
    noFill();
    stroke(this.color);
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
      if (xMove >= 0 && xMove <= width && yMove >= 0 && yMove <= height) {
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