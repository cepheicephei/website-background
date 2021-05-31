// DECLARE GLOABAL VARIABLES
let pause, particleAmount, randomColor, colorVariation;
let particles = [];
let flowfield;

// DECLARE COLORS


// DECLARE SLIDERS
let sliderMaxParticles, sliderSpeed;

// DECLARE CONSTANTS

function inititalizeGlobalVariables() {
  stepSize = 12;
  randomColor = color(random(140, 240), random(140, 240), random(140, 240));
  colorVariation = 12;
  pause = false;
  particleAmount = 0;

  flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);
}

let canvasWidth;
let canvasHeight;
let div;


function setup() {
  div = document.querySelector('#wrapper');
  colorMode(RGB);
  smooth();

  canvasWidth = ceil(div.clientWidth);
  canvasHeight = ceil(div.clientHeight);
  createCanvas(canvasWidth, canvasHeight).parent(div).addClass('canvas');

  strokeWeight(2);
  inititalizeGlobalVariables();
}

function windowResized() {
  pause = true;
  canvasWidth = ceil(div.clientWidth);
  canvasHeight = ceil(div.clientHeight);
  resizeCanvas(canvasWidth, canvasHeight);
  flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);
  particles = [];
  particleAmount = 0;
  setRandomColor();
  background(255);
  pause = false;
}

function draw() {
  if (!pause) {
    for (let speedUp = 0; speedUp < 1; ++speedUp) {
      if (particleAmount >= 400) {
        flowfield = new Flowfield(stepSize, canvasWidth, canvasHeight);
        particles = [];
        particleAmount = 0;
        setRandomColor();
        background(255);
      }
      particles.push(new Particle(random(canvasWidth), random(canvasHeight), randomColor));
      particleAmount++;

      for (let i = 0; i < particles.length; ++i) {
        let p = particles[i];
        if (p.removeFlag) {
          particles.splice(i, 1);
        } else {
          p.physics();
          p.removeLoose();
          p.render();
        }
      }
    }
  }

  // if (frameCount % 10 === 0) {
  //   noStroke();
  //   fill(255);
  //   rect(15, 5, 25, 25);
  //   fill(0);
  //   text(parseInt(frameRate()), 20, 20);
  // }
}

function setRandomColor() {
  randomColor = color(random(150, 180), random(150, 180), random(150, 180));
}

class Flowfield {
  constructor(_stepSize, width, height) {
    this.stepSize = _stepSize;
    this.flowPoints = [];
    this.width = width;
    this.height = height;

    this.xvals = 0;
    this.yvals = 0;

    this.increment = random(0.01, 0.1);
    // noiseDetail(parseInt(random(8)), random(0.9));
    noiseDetail(4, 0.5);
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
  constructor(x, y, _randomColor) {
    this.position = createVector(x, y);
    this.previousPosition;

    // this.vertices = [];
    this.moveSpeed = stepSize;
    this.randomCol = color(red(_randomColor) + random(-colorVariation, colorVariation), blue(_randomColor) + random(-colorVariation, colorVariation), green(_randomColor) + random(-colorVariation, colorVariation));
  }

  render() {
    stroke(this.randomCol);
    noFill();
    if (this.previousPosition)
      line(this.previousPosition.x, this.previousPosition.y, this.position.x, this.position.y)
  }

  move() {
    if (!this.removeFlag) {
      let rot = flowfield.flowPoints[flowfield.getFlowPointByCanvasPosition(this.position)].r;
      let xMove = sin(rot * TWO_PI) * this.moveSpeed + this.position.x;
      let yMove = cos(rot * TWO_PI) * this.moveSpeed + this.position.y;
      if (xMove >= 0 && xMove <= width && yMove >= 0 && yMove <= height) {
        this.previousPosition = createVector(this.position.x, this.position.y);
        this.position.x = xMove;
        this.position.y = yMove;
      } else {
        this.removeFlag = true;
      }
    }
  }

  removeLoose() {
    if (this.isMoving === false) {
      if (this.vertices.length < 4) {
        this.removeFlag = true;
      }
    }
  }

  physics() {
    if (!this.removeFlag) {
      this.move();
    }
  }
}