let imgAmb, imgA, imgB, imgC;
let ambs = [],
  diffA = [],
  diffB = [],
  diffC = [];
let clrAmb, clrA, clrB, clrC;
let bInitial; // Initial paint?

function preload() {
  imgAmb = loadImage("i/lighting-11.jpg"); // Ambient
  imgA = loadImage("i/lighting-09.jpg");
  imgB = loadImage("i/lighting-10.jpg");
  imgC = loadImage("i/lighting-14.jpg");
}

// Calculate the difference between an image and the ambient image
function genDiff(img, arr) {
  img.loadPixels();
  for (let y = 0; y < 250; y++) {
    for (let x = 0; x < 250; x++) {
      let offs = 4 * (y * 250 + x); // 4 because of RGBA
      let sub = img.pixels[offs] / 255.0 - ambs[y * 250 + x];
      if (sub < 0) sub = 0;
      arr[y * 250 + x] = sub;
    }
  }
}

function setup() {
  createCanvas(250, 250);
  cursor(CROSS);

  imgAmb.loadPixels();
  for (let y = 0; y < 250; y++) {
    for (let x = 0; x < 250; x++) {
      let offs = 4 * (y * 250 + x); // 4 because of RGBA
      ambs[y * 250 + x] = imgAmb.pixels[offs] / 255.0; // Normalize to 1.0
    }
  }

  genDiff(imgA, diffA);
  genDiff(imgB, diffB);
  genDiff(imgC, diffC);

  // Colors
  clrAmb = color("#202A35");
  clrA = color("#7F1025");
  clrB = color("#8A8768");
  clrC = color("#291D80");

  bInitial = true; // Enforce initial paint
}

function draw() {
  // Don't bother if the mouse hasn't moved
  if (pmouseX == mouseX && pmouseY == mouseY && !bInitial) return;

  let mX, mY;

  if (!bInitial) {
    // If not doing the initial paint, use mouse input
    mX = mouseX / 250.0;
    mY = mouseY / 250.0;
  } else {
    // If doing the initial paint, assume 50% fade
    mX = 0.5;
    mY = 0.5;
    bInitial = false;
  }

  // Coefficients
  let coeffA = pow(1 - mX, 0.5);
  let coeffC = pow(mX, 0.5);
  let coeffB = 1 - mY;

  for (let y = 0; y < 250; y++) {
    for (let x = 0; x < 250; x++) {
      let offs = y * 250 + x;
      let amb = ambs[offs];

      // Contribution of each light source
      let contrA = diffA[offs] * coeffA;
      let contrB = diffB[offs] * coeffB;
      let contrC = diffC[offs] * coeffC;

      // Calculate components
      let cmpR =
        red(clrAmb) * amb +
        red(clrA) * contrA +
        red(clrB) * contrB +
        red(clrC) * contrC;
      let cmpG =
        green(clrAmb) * amb +
        green(clrA) * contrA +
        green(clrB) * contrB +
        green(clrC) * contrC;
      let cmpB =
        blue(clrAmb) * amb +
        blue(clrA) * contrA +
        blue(clrB) * contrB +
        blue(clrC) * contrC;

      set(x, y, color(cmpR, cmpG, cmpB));
    }
  }
  updatePixels();
}
