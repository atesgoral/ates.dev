---
layout: layouts/page
title: Multiple Synthetic Lights
image: i/lighting-09.jpg
libs:
  - render
---

Multiple photographs taken with different light sources can be blended together to create images that appear to have all the light sources simultaneously active. The light sources can be attributed arbitrary colors as well, allowing the creation of an infinite number of synthetic scenes.

Quoting from [Synthetic Lighting for Photography](https://www.graficaobscura.com/synth/) by Paul Haeberli:

> Light from different light sources add together to illuminate objects in a scene. We can use this super-position principle to modify the lighting of a scene after it has been photographed...

I've created an interactive application with three light sources with different colors.

<p class="canvas-container" style="height: auto; padding: 0.5rlh;">
  <canvas id="canvas" width="250" height="250" style="cursor: crosshair;"></canvas>
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

      const imgAmb = await loadImage('i/lighting-11.jpg');
      const imgA = await loadImage('i/lighting-09.jpg');
      const imgB = await loadImage('i/lighting-10.jpg');
      const imgC = await loadImage('i/lighting-14.jpg');

      this.dataAmb = getImageData(imgAmb);
      this.dataA = getImageData(imgA);
      this.dataB = getImageData(imgB);
      this.dataC = getImageData(imgC);

      this.ready = true;

      this.mouseX = 125;
      this.mouseY = 125;
    },
    draw(ctx, t) {
      if (!this.ready) return;

      if (this.pmouseX === this.mouseX && this.pmouseY === this.mouseY) return;

      this.pmouseX = this.mouseX;
      this.pmouseY = this.mouseY;

      const normX = this.mouseX / 250;
      const normY = this.mouseY / 250;

      const coeffA = Math.sqrt(1 - normX);
      const coeffB = 1 - normY;
      const coeffC = Math.sqrt(normX);

      const colorAmb = [0x20, 0x2A, 0x35];
      const colorA = [0x7F, 0x10, 0x25];
      const colorB = [0x8A, 0x87, 0x68];
      const colorC = [0x29, 0x1D, 0x80];

      const imageData = new ImageData(250, 250);

      for (let i = 0; i < imageData.data.length; i++) {
        const comp = i % 4;

        if (comp < 3) {
          imageData.data[i] = (this.dataAmb[i] * colorAmb[comp]
            + this.dataA[i] * colorA[comp] * coeffA
            + this.dataB[i] * colorB[comp] * coeffB
            + this.dataC[i] * colorC[comp] * coeffC) / 255;
        } else {
          imageData.data[i] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    },
  });
</script>

Hover over the image to change the intensities of the three light sources.

This was originally done using [Processing](https://processing.org/), then ported to Processing.js (deprecated), then ported to [p5.js](https://p5js.org/), and then finally directly done with plain old `<canvas>` and JavaScript.

The images I've used are below. They're taken from [this article about lighting direction](https://web.archive.org/web/20071207230006/www.megapixel.net/html/articles/article-lightdir.php).

<p class="center zoomable">
  <img src="i/lighting-11.jpg" alt="Ambient light">
</p>

<p class="center zoomable">
  <img src="i/lighting-09.jpg" alt="Light coming from the left">
</p>

<p class="center zoomable">
  <img src="i/lighting-10.jpg" alt="Light coming from the top">
</p>

<p class="center zoomable">
  <img src="i/lighting-14.jpg" alt="Light coming from the right">
</p>
