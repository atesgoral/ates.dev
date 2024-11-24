/*
   Multiple Lights

   by Ates Goral
   Sometime, 2003

   Based on "Synthetic Lighting for Photography"
   by Paul Haeberli
   http://www.sgi.com/misc/grafica/synth/index.html

   The images used are found through Google Image Search, but I've lost the
   source.

   Instructions:
   - Roll over the photograph to change the intensities of three different
     light sources.
*/

/* @pjs preload="i/lighting-11.jpg,i/lighting-09.jpg,i/lighting-10.jpg,i/lighting-14.jpg" */

// Globals
BImage imgAmb, imgA, imgB, imgC;
float[] ambs, diffA, diffB, diffC;
color clrAmb, clrA, clrB, clrC;
boolean bInitial; // Initial paint?

// Calculate the difference between an image and the ambient image
void genDiff(BImage img, float[] arr)
{
  for (int y = 0; y < 250; y++)
    for (int x = 0; x < 250; x++)
    {
      int offs = y * 250 + x;
      float sub = red(img.pixels[offs]) / 255.0 - ambs[offs];
      if (sub < 0)
        sub = 0;

      arr[offs] = sub;
    }
}

void setup()
{
  size(250, 250);
  cursor(CROSS);

  imgAmb = loadImage("i/lighting-11.jpg"); // Ambient
  imgA = loadImage("i/lighting-09.jpg");
  imgB = loadImage("i/lighting-10.jpg");
  imgC = loadImage("i/lighting-14.jpg");

  ambs = new float[250 * 250];
  diffA = new float[250 * 250];
  diffB = new float[250 * 250];
  diffC = new float[250 * 250];

  for (int y = 0; y < 250; y++)
    for (int x = 0; x < 250; x++)
    {
      int offs = y * 250 + x;
      ambs[offs] = red(imgAmb.pixels[offs]) / 255.0; // Normalize to 1.0
    }

  genDiff(imgA, diffA);
  genDiff(imgB, diffB);
  genDiff(imgC, diffC);

  // Colors
  clrAmb = #202A35;
  clrA = #7F1025;
  clrB = #8A8768;
  clrC = #291D80;

  bInitial = true; // Enforce initial paint
}

void draw()
{
  // Don't bother if the mouse hasn't moved
  if (pmouseX == mouseX && pmouseY == mouseY && !bInitial)
    return;

  float mX, mY;

  if (!bInitial) // If not doing the initial paint, use mouse input
  {
    mX = mouseX / 250.0;
    mY = mouseY / 250.0;
  }
  else // If doing the inital paint, assume 50% fade
  {
    mX = 0.5;
    mY = 0.5;
    bInitial = false;
  }

  // Coefficients
  float coeffA = pow((1 - mX), 0.5);
  float coeffC = pow(mX, 0.5);
  float coeffB = (1 - mY);

  for (int y = 0; y < 250; y++)
    for (int x = 0; x < 250; x++)
    {
      int offs = y * 250 + x;
      float amb = ambs[offs];

      // Contribution of each light source
      float contrA = diffA[offs] * coeffA;
      float contrB = diffB[offs] * coeffB;
      float contrC = diffC[offs] * coeffC;

      // Calculate components
      float cmpR = red(clrAmb) * amb +
                   red(clrA) * contrA +
                   red(clrB) * contrB +
                   red(clrC) * contrC;

      float cmpG = green(clrAmb) * amb +
                   green(clrA) * contrA +
                   green(clrB) * contrB +
                   green(clrC) * contrC;

      float cmpB = blue(clrAmb) * amb +
                   blue(clrA) * contrA +
                   blue(clrB) * contrB +
                   blue(clrC) * contrC;

      set(x, y, color(cmpR, cmpG, cmpB));
    }
}
