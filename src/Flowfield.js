class Flowfield {
  constructor(_resolution, width, height) {
    this.resolution = _resolution;
    this.fieldWidth = width / this.resolution;
    this.fieldHeight = height / this.resolution;
    this.flowPoints = [];
    this.width = width;
    this.height = height;

    for (let x = 0; x < this.fieldWidth; x++) {
      for (let y = 0; y < this.fieldHeight; y++) {
        // let loc = x + y * width / resolution;
        this.flowPoints.push(
          {
            x: x * this.resolution,
            y: y * this.resolution,
            r: 0
          }
        );
      }
    }
  }

  generate() {
    let increment = random(0.001, 0.1);
    noiseDetail(parseInt(random(8)), parseInt(random(1)));
    // 4, 0.9 are good values!
    noiseSeed(parseInt(random(100)));

    let xoff = 0.0;
    for (let x = 0; x < this.fieldWidth; x++) {
      xoff += increment;
      let yoff = 0.5;
      for (let y = 0; y < this.fieldHeight; y++) {
        yoff += increment;
        this.flowPoints[y + x * this.fieldHeight].r = noise(xoff, yoff);
      }
    }
    /*
    let inc = 0;
    for (let i = 0; i < flowPoints.length; ++i) {
      flowPoints.get(i).r = noise(inc) * 360;
      inc += increment;
      // if(i % (width / resolution) === 0) {
      //   inc -= increment * (width / resolution);
      // }
    }
    prletln(flowPoints.length);*/
  }

  sample(position) {
    let sample = this.flowPoints[getFlowPointByCanvasPosition(position)].r;
    return sample;
  }

  render(type) {
    for (let i = 0; i < this.flowPoints.length; ++i) {
      let p = this.flowPoints[i];
      let x = p.x + this.resolution / 2;
      let y = p.y + this.resolution / 2;
      let r = p.r;

      /*
      fill(map(r, 0, 1, 0, 255));
      noStroke();
      rectMode(CENTER);
      rect(x, y, resolution, resolution);
  
      setColor(blue, false);
      line(x, y, sin(r * TWO_PI) * 16 + x, cos(r * TWO_PI) * 16 + y);
      setColor(blue, true);
      ellipse(x, y, 4, 4);
      */

      // MAKE SWITCH CASE
      if (type === "text") {
        noStroke();
        fill(20);
        text(nfc(r, 2), x, y);
      } else if (type === "arrow") {
        this.renderArrow(createVector(x, y), radians(map(r, 0, 1, 0, 360)), this.resolution * 0.6);
      }
    }
  }

  renderArrow(position, rotation, length) {
    push();
    translate(position.x, position.y);
    rotate(rotation);
    noFill();
    stroke(40, 40, 210);
    line(-length / 2, 0, length / 2, 0);
    line(length / 2, 0, length / 4, length / 3);
    line(length / 2, 0, length / 4, -length / 3);
    pop();
  }

  getFlowPointByCanvasPosition(canvasPosition) {
    let index = floor(canvasPosition.y / this.resolution) + floor(canvasPosition.x / this.resolution) * (this.height / this.resolution);
    return index;
  }
}