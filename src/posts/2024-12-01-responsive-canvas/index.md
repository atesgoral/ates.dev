---
layout: layouts/post
title: "Responsive Canvas"
image: i/responsive-canvas.png
date: 2024-12-01
---

<script>
function tailDebounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function render(id, {init, draw, dontResize}) {
  const canvas = document.querySelector(`#${id}`);
  const ctx = canvas.getContext("2d");

  function initOnRaf() {
    requestAnimationFrame(() => {
      init && init(canvas, ctx);
      draw && draw(ctx, 0);
    });
  }

  initOnRaf();

  if (!dontResize) {
    const debouncedInitOnRaf = tailDebounce(initOnRaf, 100);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          debouncedInitOnRaf();
        }
      }
    });

    resizeObserver.observe(canvas);
  }

  function raf(draw) {
    requestAnimationFrame((t) => {
      raf(draw);
      draw(ctx, t);
    });
  }

  draw && raf(draw);
}

function initDprDemo(canvas, ctx, forceDpr) {
  const dpr = window.devicePixelRatio;
  const usedDpr = forceDpr || dpr;

  canvas.width = canvas.clientWidth * usedDpr;
  canvas.height = canvas.clientHeight * usedDpr;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const SIZE = 100;

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    SIZE / 2 * usedDpr,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Display DPR
  ctx.font = '2em monospace';
  ctx.fillText(usedDpr.toFixed(1), 10, 35);

  // 20x20 pixel reference square
  ctx.fillRect(10, 50, 20, 20);
}
</script>

"Responsive" in web development pertains to, in a nutshell, layout: Adjusting the
layout of a page based on the dimensions of the renderable area. A more formal
definition from [Wikipedia][1]:

> Responsive web design (RWD) or responsive design is an approach to web design
> that aims to make web pages render well on a variety of devices and window or
> screen sizes from minimum to maximum display size to ensure usability and
> satisfaction.

Here, I will share a few key techniques I always apply when rendering pixels on
a [`<canvas>`][2] element, while keeping the rendering properly respond to these
factors:

1. Canvas size
2. [Device Pixel Ratio][3] (DPR)
3. Time

Also, how to compose a scene (i.e. define the dimensions of elements) while
taking 1-3 into consideration, without getting into an unmaintainable mess.

This is not a comprehensive tutorial that aims to teach on canvas rendering from
scratch. Code excerpts are partial, only highlighting key changes from the
previous example. Knowledge of JavaScript and some algebra is assumed. This
will progressively get more complicated, fast.

[1]: https://en.wikipedia.org/wiki/Responsive_web_design
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio

### Defaults

Let's start with a default canvas:

```html
<canvas></canvas>
```

<p class="canvas-container">
  <canvas id="canvas-default" class="bordered"></canvas>
</p>

By default, it is a transparent rectangle measuring 300 by 150 pixels
([spec][4]). I have added a border around it to clearly define its size and
position on the page.

[4]: https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element:~:text=The%20width%20attribute%20defaults%20to%20300%2C%20and%20the%20height%20attribute%20defaults%20to%20150.

Now, let's fill it black and then render a 100x100 white square in its middle:

```html
<canvas id="canvas"></canvas>
```

```js
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

ctx.fillRect(0, 0, canvas.width, canvas.height);

const SIZE = 100;

ctx.fillStyle = "white";
ctx.fillRect(
  canvas.width / 2 - SIZE / 2,
  canvas.height / 2 - SIZE / 2,
  SIZE,
  SIZE
);
```

<p class="canvas-container">
  <canvas id="canvas-with-square" class="black"></canvas>
</p>

<script>
render('canvas-with-square', {
  init(canvas, ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const SIZE = 100;

    ctx.fillStyle = 'white';
    ctx.fillRect(
      canvas.width / 2 - SIZE / 2,
      canvas.height / 2 - SIZE / 2,
      SIZE,
      SIZE
    );
  },
});
</script>

### Stretching

Now let's stretch the canvas to 100% of the width of the container:

```css
canvas {
  width: 100%;
  height: 150px;
}
```

<p class="canvas-container">
  <canvas id="canvas-with-square-fit" class="fit black"></canvas>
</p>

<script>
render('canvas-with-square-fit', {
  init(canvas, ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const SIZE = 100;

    ctx.fillStyle = 'white';
    ctx.fillRect(
      canvas.width / 2 - SIZE / 2,
      canvas.height / 2 - SIZE / 2,
      SIZE,
      SIZE
    );
  },
});
</script>

What happened to our perfectly square square? Because we resized the canvas with
CSS and didn't attach `width` and `height` attributes to the `<canvas>` tag, the
intrinsic dimensions of the canvas are still the defaults, 300x150.

To fix the dimensions of the rendering context, we can set the `width` and
`height` properties of the canvas DOM element to the measured pixel dimensions:

```js
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
```

<p class="canvas-container">
  <canvas id="canvas-with-square-fit-fix" class="fit black"></canvas>
</p>

<script>
render('canvas-with-square-fit-fix', {
  init(canvas, ctx) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const SIZE = 100;

    ctx.fillStyle = 'white';
    ctx.fillRect(
      canvas.width / 2 - SIZE / 2,
      canvas.height / 2 - SIZE / 2,
      SIZE,
      SIZE
    );
  },
});
</script>

### Crisp rendering

Next, let's switch to rendering a circle to achieve anti-aliased edges. And let's also print "1.0", and render a reference 20x20 square, both of which will become significant soon.

```js
ctx.beginPath();
ctx.arc(canvas.width / 2, canvas.height / 2, SIZE / 2, 0, Math.PI * 2);
ctx.fill();

ctx.font = '2em monospace';
ctx.fillText('1.0', 10, 35);

// 20x20 pixel reference square
ctx.fillRect(10, 50, 20, 20);
```

<p class="canvas-container">
  <canvas id="canvas-with-circle" class="fit black"></canvas>
</p>

<script>
render('canvas-with-circle', {
  init: (canvas, ctx) => initDprDemo(canvas, ctx, 1)
});
</script>

The CSS dimensions we set on the canvas are the logical pixel dimensions. Your browser's DPR (Device Pixel Ratio) is a multiplier that determines the physical pixel density of your screen. For example, if your DPR is `2.0`, then for every logical pixel, there are 4 physical pixels (2x2). To render this circle in the
crispiest way possible we will apply the DPR as a multiplier to the
canvas dimensions. We'll also print your actual DPR instead of the "1.0" we hard-coded earlier:

```js
const dpr = window.devicePixelRatio;

canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
```

But then, we also have to start factoring in DPR in all size units when using
the drawing primitives:

```js
ctx.beginPath();
ctx.arc(
  canvas.width / 2,
  canvas.height / 2,
  (SIZE / 2) * dpr, // Adjust for DPR
  0,
  Math.PI * 2
);
ctx.fill();

// Display DPR
ctx.font = '2em monospace';
ctx.fillText(dpr.toFixed(2), 10, 35);
```

<p class="canvas-container">
  <canvas id="canvas-with-circle-dpr" class="fit black"></canvas>
</p>

<script>
render('canvas-with-circle-dpr', {
  init: (canvas, ctx) => initDprDemo(canvas, ctx)
});
</script>

If your DPR is greater than `1.0`, you should see the 20x20 pixel reference
square rendered as something smaller than 20x20 while our circle remains the
same size. And the anti-aliased edges of the circle should now look as crisp as
physically possible on your screen (without getting into subpixel rendering).

In case your DPR is `1.0`, and you don't see a difference above, here's what the
comparison would have **approximately** looked like against a DPR of `2.0`:

<p class="canvas-container">
  <canvas id="canvas-dpr-compare" class="fit black"></canvas>
</p>

<script>
render('canvas-dpr-compare', {
  draw: (ctx, t) => {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio;

    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    const s = t / 1000 | 0;
    const fakeDpr = 2;
    const virtualDpr = s & 1 ? fakeDpr : 1;

    ctx.reset();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = dpr / virtualDpr;

    ctx.scale(scale, scale);

    const SIZE = 100;

    const x = canvas.width / 2 / scale;
    const y = canvas.height / 2 / scale;
    const r = SIZE / 2 * virtualDpr * virtualDpr / fakeDpr;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Display DPR
    ctx.font = '2em monospace';
    ctx.fillText(virtualDpr.toFixed(1), 10, 35);

    // 20x20 pixel reference square
    ctx.fillRect(10, 50, 20, 20);

    ctx.imageSmoothingEnabled = false;

    const u = r * 2 / virtualDpr;

    ctx.drawImage(
      canvas,
      (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale,
      x - u, y - u, u * 2, u * 2
    );

    const zx = x + Math.cos(Math.PI / 4) * u;
    const zy = y - Math.sin(Math.PI / 4) * u;

    ctx.drawImage(
      canvas,
      (zx - u / 6) * scale, (zy - u / 6) * scale, u / 3 * scale, u / 3 * scale,
      x + u + u / 3, y - u + u / 3, u / 3 * 4, u / 3 * 4,
    );

    ctx.strokeStyle = '#00c0ff';
    ctx.lineWidth = 3 / scale;

    ctx.strokeRect(zx - u / 6, zy - u / 6, u / 3, u / 3);
    ctx.strokeRect(
      x + u + u / 3,
      y - u + u / 3,
      u / 3 * 4,
      u / 3 * 4,
    );

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2 / scale;

    ctx.strokeRect(
      zx - u / 6 + 1 / scale,
      zy - u / 6 + 1 / scale,
      u / 3 - 2 / scale,
      u / 3 - 2 / scale,
    );
    ctx.strokeRect(
      x + u + u / 3 + 1 / scale,
      y - u + u / 3 + 1 / scale,
      u / 3 * 4 - 2 / scale,
      u / 3 * 4 - 2 / scale,
    );
  }
});
</script>

### Layout

<script>
  function drawCircleScene(ctx) {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio;

    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = canvas.height / 4;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      size / 2 * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
</script>

<p class="canvas-container">
  <span class="canvas-subcontainer">
    <canvas id="canvas-resize-layout" class="fit black"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-layout', {
    dontResize: true,
    init: (_canvas, ctx) => drawCircleScene(ctx)
  });
</script>

### Resizing

<script>
  setInterval(() => {
    const width = `${Math.random() * 100 + 200}px`

    document.querySelectorAll('.canvas-subcontainer.auto-resize').forEach((el) => el.style.width = width);
  }, 1000);
</script>

<p class="canvas-container">
  <span class="canvas-subcontainer auto-resize">
    <canvas id="canvas-resize-stretch" class="fit black"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-stretch', {
    dontResize: true,
    init: (_canvas, ctx) => drawCircleScene(ctx)
  });
</script>

<p class="canvas-container">
  <span class="canvas-subcontainer auto-resize">
    <canvas id="canvas-resize-draw" class="fit black"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-draw', {
    dontResize: true,
    draw: (ctx) => drawCircleScene(ctx)
  });
</script>

<p class="canvas-container">
  <span class="canvas-subcontainer auto-resize" style="width: 300px; height: auto; aspect-ratio: 300 / 150;">
    <canvas id="canvas-resize-stretch-ar" class="black" style="width: 100%; height: 100%;"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-stretch-ar', {
    dontResize: true,
    init: (_canvas, ctx) => drawCircleScene(ctx)
  });
</script>

<p class="canvas-container">
  <span id="canvas-resize-stretch-tiny-container" class="canvas-subcontainer" style="width: 80px; height: 40px;">
    <canvas id="canvas-resize-stretch-tiny" class="black" style="width: 100%; height: 100%;"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-stretch-tiny', {
    dontResize: true,
    init: (canvas, ctx) => {
      drawCircleScene(ctx);

      const container = document.querySelector('#canvas-resize-stretch-tiny-container');
      container.style.width = '300px';
      container.style.height = '150px';
    }
  });
</script>
