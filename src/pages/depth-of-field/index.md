---
layout: layouts/page
title: Morphing Depth of Field
image: i/near_in_focus.gif
date: 2003-11-06
libs:
  - render
omit: true
---

Two (or more) photographs of the same scene and that have different focal distances can be joined together to create an image where both distant and close objects can be in focus.

Quoting from [A Multifocus Method for Controlling Depth of Field](https://www.graficaobscura.com/depth/index.html) by Paul Haeberli:

> When a photograph is taken with a camera, the lens is focused at a particular distance. Objects nearer or farther than this focal distance will appear blurred. By changing the focus of the lens, near objects or distant objects can be made to appear in sharp focus. If you want to create an image where distant objects as well as close objects are in focus, two or more images can be merged together to make an image with increased depth of field...

Instead of creating a single, in-focus image from two images, I wanted to see how a smooth morphing effect would look like.

Hovering over the image controls how much each of the two images contributes to the final image. Vertical movement controls the contribution amount of the image where the bottle at the front in-focus. Horizontal movement controls the image where the bottle at the back is in-focus.

To get a natural, focus-back-and-forth experience, move the mouse from the top right corner to the bottom left corner and back.

<p class="canvas-container" style="height: auto; padding: 0.5rlh;">
  <canvas id="canvas" class="black" width="239" height="239" style="cursor: crosshair;"></canvas>
</p>

<script type="module">
  async function loadImage(src) {
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'anonymous';

    await img.decode();

    return img;
  }

  function getImageData(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return ctx.getImageData(0, 0, img.width, img.height).data;
  }

  render('canvas', {
    async init(canvas, ctx) {
      canvas.addEventListener('pointermove', (e) => {
        this.mouseX = Math.max(0, e.offsetX);
        this.mouseY = Math.max(0, e.offsetY);
      });

      const imgNear = await loadImage('i/near-in-focus.gif');
      const imgFar = await loadImage('i/far-in-focus.gif');
      const imgSel = await loadImage('i/selector.gif');

      this.dataNear = getImageData(imgNear);
      this.dataFar = getImageData(imgFar);
      this.dataSel = getImageData(imgSel);

      this.ready = true;

      this.mouseX = canvas.width / 2;
      this.mouseY = canvas.height / 2;
    },
    draw(ctx, t) {
      const canvas = ctx.canvas;

      if (!this.ready) {
        const radiusL = canvas.width / 16;
        const radiusS = canvas.width / 64;
        const vel = 2; // Rotations per second

        const a = t / 1000 * Math.PI * 2 * vel;

        canvas.width |= 0;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2 + Math.cos(a) * radiusL,
          canvas.height / 2 + Math.sin(a) * radiusL,
          radiusS,
          0, Math.PI * 2
        );
        ctx.fill();

        return;
      }

      if (this.pmouseX === this.mouseX && this.pmouseY === this.mouseY) return;

      this.pmouseX = this.mouseX;
      this.pmouseY = this.mouseY;

      const normX = this.mouseX / canvas.width;
      const normY = this.mouseY / canvas.height;

      const nearFade = normY;
      const farFade = normX;

      // Sepia
      const color = [228, 212, 180];

      const imageData = new ImageData(canvas.width, canvas.height);

      for (let i = 0; i < imageData.data.length;) {
        const briNear = this.dataNear[i] / 255;
        const briFar = this.dataFar[i] / 255;
        const sel = this.dataSel[i] & 1;

        // Calculate brightness - this expression can probably be simplified,
        // but then it would become harder to follow...
        const bri =
          (briNear * nearFade + briFar * (1 - nearFade)) * (1 - sel) +
          (briFar * farFade + briNear * (1 - farFade)) * sel;

        imageData.data[i++] = color[0] * bri;
        imageData.data[i++] = color[1] * bri;
        imageData.data[i++] = color[2] * bri;
        imageData.data[i++] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
    },
  });
</script>

<!--
This was originally done using [Processing](https://processing.org/), then ported to Processing.js (deprecated) and I've recently ported it to [p5.js](https://p5js.org/) with GPT-4. You can download the original [PDE file](multi_focus.pde) or the ported [p5.js file](sketch.js).
-->

The images I've used are below. They're taken from the original article.

<p class="center">
  <img src="i/far_in_focus.gif" alt="Far in focus">
</p>

<p class="center">
  <img src="i/near_in_focus.gif" alt="Near in focus">
</p>
