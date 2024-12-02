---
layout: layouts/post
title: "Responsive Canvas"
image: i/responsive-canvas.png
date: 2024-12-01
---

Be responsible.

<script>
function render(id, {init, draw}) {
  const canvas = document.querySelector(`#${id}`);
  const ctx = canvas.getContext("2d");

  init && init(canvas, ctx);

  function raf(draw) {
    requestAnimationFrame((t) => {
      raf(draw);
      draw(ctx, t);
    });
  }

  draw && raf(draw);
}
</script>

<canvas id="canvas-1"></canvas>

<script>
render('canvas-1', {
  init(canvas) {
    //
  },
  draw(ctx, t) {
    ctx.fillRect(10, 10, 10, 10);
  }
});
</script>
