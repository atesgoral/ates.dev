let imgNear, imgFar, imgSel, imgTxtNear, imgTxtFar;
let bInitial; // Initial paint?

function preload() {
  imgNear = loadImage("i/near_in_focus.gif");
  imgFar = loadImage("i/far_in_focus.gif");
  imgSel = loadImage("i/selector.gif"); // Pixel selector
  imgTxtFar = loadImage("i/txt_far.gif");
  imgTxtNear = loadImage("i/txt_near.gif");
}

function setup() {
  createCanvas(250, 250);
  cursor(CROSS);

  // Thin frame around the photograph
  stroke(0);
  noFill();
  rect(0, 0, 240, 240);

  // Small decorative rectangle at bottom right
  noStroke();
  fill(0);
  rect(241, 241, 9, 9);

  bInitial = true; // Enforce initial paint
}

function draw() {
  // Don't bother if the mouse hasn't moved
  if (pmouseX == mouseX && pmouseY == mouseY && !bInitial) return;

  let nearFade, farFade;

  if (!bInitial) {
    // If not doing the initial paint, use mouse input
    nearFade = mouseY / 239.0;
    farFade = mouseX / 239.0;
  } else {
    // If doing the inital paint, assume 50% fade
    nearFade = 0.5;
    farFade = 0.5;
    bInitial = false;
  }

  imgNear.loadPixels();
  imgFar.loadPixels();
  imgSel.loadPixels();

  for (let y = 0; y < 239; y++) {
    let offY = y * 239;

    for (let x = 0; x < 239; x++) {
      let offXY = 4 * (offY + x); // Multiply by 4 because of RGBA

      let briNear = red(imgNear.pixels[offXY]) / 255.0;
      let briFar = red(imgFar.pixels[offXY]) / 255.0;
      let sel = imgSel.pixels[offXY] & 1;

      // Calculate brightness - this expression can probably be simplified,
      // but then it would become harder to follow...
      let bri =
        (briNear * nearFade + briFar * (1 - nearFade)) * (1 - sel) +
        (briFar * farFade + briNear * (1 - farFade)) * sel;

      // Plot using a sepia hue
      set(x + 1, y + 1, color(228 * bri, 212 * bri, 180 * bri));
    }
  }

  updatePixels();

  // Vertical/near fade
  fill(255 * farFade);
  rect(241, 0, 9, 241);

  // Horizontal/far fade
  fill(255 * nearFade);
  rect(0, 241, 241, 9);

  // Put the text, centered
  image(imgTxtNear, (241 - imgTxtNear.width) >> 1, 242);
  image(imgTxtFar, 243, (241 - imgTxtFar.height) >> 1);
}
