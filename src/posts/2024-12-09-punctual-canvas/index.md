---
layout: layouts/post
title: "Punctual Canvas Rendering"
description: "The techniques I use for punctual canvas rendering, to maintain a consistent frame rate."
image: i/punctual-canvas.png
date: 2024-12-09
draft: true
---

### Time

Let's get moving!

<p class="canvas-container">
  <canvas id="canvas-starfield" class="fit black"></canvas>
</p>

<script>
  render('canvas-starfield', {
    init: (canvas, _ctx) => {
      const {width, height} = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const STAR_COUNT = 50;

      this.stars ||= Array(STAR_COUNT).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random()
      }));
    },
    draw: (ctx) => {
      const canvas = ctx.canvas;
      const dpr = window.devicePixelRatio;

      const SIZE = 5;
      const VELOCITY = 3;
      const PERSPECTIVE = 5;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'white';

      for (const star of this.stars) {
        const {x, y, z} = star;
        const size = SIZE / (1 + z * PERSPECTIVE);

        ctx.fillRect(
          x - size / 2 * dpr,
          y - size / 2 * dpr,
          size * dpr,
          size * dpr
        )

        star.x = (star.x + VELOCITY * (1 - z)) % canvas.width;
      }
    }
  });
</script>
