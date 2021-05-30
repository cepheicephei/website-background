// DECLARE GLOABAL VARIABLES
let steps, border, yOff, pause, showFlowfield, colored, particleAmount;
let particles = [];
let flowfield;

// DECLARE COLORS
let white, black, blue;

// DECLARE BUTTONS
let buttonPause, buttonResume, buttonClear, buttonToggleFlowfield, buttonRegenerateFlowfield, buttonToggleColored;

// DECLARE SLIDERS
let sliderMaxParticles, sliderSpeed;

// DECLARE CONSTANTS
let myWidth;
let myHeight;

function inititalizeGlobalVariables() {
  // steps = parseInt(random(10, 20));
  steps = 10;
  border = 40;
  yOff = 10;
  pause = false;
  showFlowfield = false;
  colored = false;
  particleAmount = 4000;

  flowfield = new Flowfield(steps, myWidth, myHeight);
  flowfield.generate();

  white = color(245);
  black = color(40);
  blue = color(80, 80, 220);
}

function setup() {
  // myWidth = floor(windowWidth / 100) * 100;
  // myHeight = floor(windowHeight / 100) * 100;

  inititalizeGlobalVariables();
  let div = document.querySelector('#wrapper');
  myWidth = floor(div.clientWidth / 100) * 100;
  myHeight = floor(windowHeight / 100) * 100;
  // div.addClass('wrapper');
  createCanvas(myWidth, myHeight).parent(div).addClass('canvas');

  buttonRegenerateFlowfield = createButton("Regenerate Flowfield").addClass('button').parent(div);
  buttonRegenerateFlowfield.mouseClicked(() => { flowfield.generate(); particles = [] });

  // buttonClear = createButton("Clear").addClass('button').parent(div);
  // buttonClear.mouseClicked(() => { particles = [] });

  // buttonPause = createButton("Pause").addClass('button').parent(div);
  // buttonPause.mouseClicked(() => { pause = true });

  // buttonResume = createButton("Resume").addClass('button').parent(div);
  // buttonResume.mouseClicked(() => { pause = false });

  // buttonToggleFlowfield = createButton("Toggle Flowfield").addClass('button').parent(div);
  // buttonToggleFlowfield.mouseClicked(() => { showFlowfield = !showFlowfield });

  buttonToggleColored = createButton("Toggle Color").addClass('button').parent(div);
  buttonToggleColored.mouseClicked(() => {
    colored = !colored;
    particles.forEach(p => {
      p.colored = !p.colored;
    })
  });

  // sliderMaxParticles = createSlider(1, 10000, 2000, 1).addClass('slider').parent(div);
  // sliderSpeed = createSlider(1, 200, 20, 1).addClass('slider').parent(div);
}

function draw() {
  for (let speedUp = 0; speedUp < 20; ++speedUp) {
    background(255);

    // if (frameCount % 1 === 0)
    if (!pause) {
      if (particles.length >= particleAmount) {
        particles.splice(0, particles.length - particleAmount);
      }
      particles.push(new Particle(random(border, myWidth - border), random(border, myHeight - border), border, flowfield, colored));
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
  // noLoop();
}