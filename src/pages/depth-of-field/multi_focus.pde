/*
   Depth of Field

   by Ates Goral
   Nov 6, 2003

   Based on "A Multifocus Method for Controlling Depth of Field"
   by Paul Haeberli
   http://www.sgi.com/grafica/depth/index.html

   The images used are taken from the original document.

   Instructions:
   - Roll over the photograph to bring the near and far portions in and out of
     focus.
   - Vertical movement controls the near end.
   - Horizontal movement controls the far end.
*/

/* @pjs preload="i/near_in_focus.gif,i/far_in_focus.gif,i/selector.gif,i/txt_far.gif,i/txt_near.gif" */

// Globals
BImage imgNear, imgFar, imgSel, imgTxtNear, imgTxtFar;
boolean bInitial; // Initial paint?

void setup()
{
  size(250, 250);
  cursor(CROSS);

  imgNear = loadImage("i/near_in_focus.gif");
  imgFar = loadImage("i/far_in_focus.gif");
  imgSel = loadImage("i/selector.gif"); // Pixel selector

  imgTxtFar = loadImage("i/txt_far.gif");
  imgTxtNear = loadImage("i/txt_near.gif");

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

void draw()
{
  // Don't bother if the mouse hasn't moved
  if (pmouseX == mouseX && pmouseY == mouseY && !bInitial)
    return;

  float nearFade, farFade;

  if (!bInitial) // If not doing the initial paint, use mouse input
  {
    nearFade = mouseY / 239.0;
    farFade = mouseX / 239.0;
  }
  else // If doing the inital paint, assume 50% fade
  {
    nearFade = 0.5;
    farFade = 0.5;
    bInitial = false;
  }

  for (int y = 0; y < 239; y++)
  {
    int offY = y * 239; // I'm probably not gaining significant performance by
                        // doing this :)

    for (int x = 0; x < 239; x++)
    {
      int offXY = offY + x; // Pixel offset

      float briNear = (imgNear.pixels[offXY] & 0xff) / 255.0;
      float briFar = (imgFar.pixels[offXY] & 0xff) / 255.0;
      int sel = imgSel.pixels[offXY] & 1;

      // Calculate brightness - this expression can probably be simplified,
      // but then it would become harder to follow...
      float bri = (briNear * nearFade + briFar * (1 - nearFade)) * (1 - sel) +
                  (briFar * farFade + briNear * (1 - farFade)) * sel;

      // Plot using a sepia hue
      set(x + 1, y + 1, color(228 * bri, 212 * bri, 180 * bri));
    }
  }

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
