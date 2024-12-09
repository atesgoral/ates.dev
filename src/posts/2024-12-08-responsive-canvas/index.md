---
layout: layouts/post
title: "Responsive Canvas Rendering"
description: "Techniques for responsive canvas rendering to maintain crisp visuals across varying screen sizes."
image: i/responsive-canvas.png
alt: "A filled circle and an empty circle on an HTML canvas, with a zoomed-in view of the anti-aliasing at their edges."
date: 2024-12-08
---

<script>
function tailDebounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

const visibilityCallbacks = new WeakMap();

const visibilityObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    entry.target.setAttribute('data-in-viewport', entry.isIntersecting);
    visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
  }
}, {
  threshold: 0.75,
});

const resizeCallbacks = new WeakMap();

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      resizeCallbacks.get(entry.target)?.();
    }
  }
});

function render(id, {init, draw, resize = true}) {
  const canvas = document.querySelector(`#${id}`);
  const ctx = canvas.getContext("2d");
  const state = {};
  let visible = false;
  let rafId = null;

  function initOnRaf() {
    requestAnimationFrame(() => init.call(state, canvas, ctx));
  }

  function raf(draw) {
    rafId = requestAnimationFrame((t) => {
      raf(draw);
      draw.call(state, ctx, t);
    });
  }

  if (init) {
    initOnRaf();
  }

  if (draw) {
    visibilityCallbacks.set(canvas, (newVisible) => {
      if (newVisible) {
        if (!visible) {
          raf(draw);
        }
      } else {
        if (visible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }

      visible = newVisible;
    });

    visibilityObserver.observe(canvas);
  }

  if (resize && init) {
    const debouncedInitOnRaf = tailDebounce(initOnRaf, 100);

    resizeCallbacks.set(canvas, debouncedInitOnRaf);
    resizeObserver.observe(canvas);
  }
}

function initDprDemo(canvas, ctx, forceDpr) {
  const dpr = window.devicePixelRatio;
  const usedDpr = forceDpr || dpr;
  const {width, height} = canvas.getBoundingClientRect();

  canvas.width = width * usedDpr;
  canvas.height = height * usedDpr;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const RADIUS = 50;
  const radius = RADIUS * usedDpr;

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    radius,
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

window.addEventListener('DOMContentLoaded', () => {
  const autoResizables = document.querySelectorAll('.canvas-subcontainer.auto-resize');

  autoResizables.forEach((el) => visibilityObserver.observe(el));

  const epoch = performance.now();

  function setWidths() {
    requestAnimationFrame(setWidths);

    const elapsed = performance.now() - epoch;
    const width = clamp(Math.sin(elapsed / 1000) * 200 + 200, 100, 300);

    autoResizables.forEach((el) => {
      if (el.getAttribute('data-in-viewport') === 'true') {
        el.style.width = `${width}px`;
      }
    });
  }

  requestAnimationFrame(setWidths);
});
</script>

In web development, 'responsive' typically refers to layout. Adjusting the
layout of a page based on the dimensions of the renderable area. A more formal
definition from [Wikipedia][1]:

> Responsive web design (RWD) or responsive design is an approach to web design
> that aims to make web pages render well on a variety of devices and window or
> screen sizes from minimum to maximum display size to ensure usability and
> satisfaction.

Here, I will share a few key techniques I always apply when rendering pixels on
a [`<canvas>`][2] element, while ensuring the rendering properly responds to
canvas size and [Device Pixel Ratio][3] (DPR).

This is not a comprehensive tutorial that aims to teach on canvas rendering from
scratch. Code excerpts are partial, only highlighting key changes from the
previous example. Knowledge of JavaScript and some algebra is assumed.

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

By default, the canvas is a transparent rectangle measuring 300x150 pixels
([spec][4]). I have added a border around it to clearly define its size and
position on the page.

[4]: https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element:~:text=The%20width%20attribute%20defaults%20to%20300%2C%20and%20the%20height%20attribute%20defaults%20to%20150.

### Reference square

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

### Intrinsic dimensions

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

Why is our square no longer square? Because we resized the canvas with
CSS and didn't attach `width` and `height` attributes to the `<canvas>` tag, the
intrinsic dimensions of the canvas are still the defaults, 300x150.

We can fix this by setting the `width` and `height` properties of the canvas
element to its pixel dimensions:

```js
const {width, height} = canvas.getBoundingClientRect();

canvas.width = width;
canvas.height = height;
```

<p class="canvas-container">
  <canvas id="canvas-with-square-fit-fix" class="fit black"></canvas>
</p>

<script>
render('canvas-with-square-fit-fix', {
  init(canvas, ctx) {
    const {width, height} = canvas.getBoundingClientRect();

    canvas.width = width;
    canvas.height = height;

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

### Reference circle

Next, let's switch to rendering a circle to achieve anti-aliased edges. And
let's also print "1.0", and render a reference 20x20 square, both of which will
become significant soon.

```js
const RADIUS = 50;

ctx.beginPath();
ctx.arc(canvas.width / 2, canvas.height / 2, RADIUS, 0, Math.PI * 2);
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

### Crisp rendering

The CSS dimensions we set on the canvas are the logical pixel dimensions. Your
browser's DPR (Device Pixel Ratio) is a multiplier that determines the physical
pixel density of your screen. For example, if your DPR is `2.0`, then for every
logical pixel, there are 4 physical pixels (2x2). To render this circle in the
crispiest way possible we apply the DPR as a multiplier to the canvas
dimensions. We'll also print your actual DPR instead of the "1.0" we hard-coded
earlier:

```js
const dpr = window.devicePixelRatio;
const {width, height} = canvas.getBoundingClientRect();

canvas.width = width * dpr;
canvas.height = height * dpr;
```

But then, we also have to start factoring in DPR in all size units when using
the drawing primitives:

```js
// Adjust for DPR
const radius = RADIUS * dpr;

ctx.beginPath();
ctx.arc(
  canvas.width / 2,
  canvas.height / 2,
  radius,
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

### DPR comparison

If your DPR is greater than `1.0`, you should see the 20x20 pixel reference
square rendered as something smaller than 20x20 while our circle remains the
same size. And the anti-aliased edges of the circle should now look as crisp as
possible on your screen (without getting into subpixel rendering).

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
    const {width, height} = canvas.getBoundingClientRect();

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const s = t / 1000 | 0;
    const fakeDpr = 2;
    const virtualDpr = s & 1 ? fakeDpr : 1;

    ctx.reset();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = dpr / virtualDpr;

    ctx.scale(scale, scale);

    const RADIUS = 50;
    const r = RADIUS * virtualDpr * virtualDpr / fakeDpr;

    const x = canvas.width / 2 / scale;
    const y = canvas.height / 2 / scale;

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

### Scene layout

In the examples so far we've used hard-coded dimensions for the elements because
we knew the canvas height was always 150px. A square 100px across or a circle
50px in radius would nicely fit.

Defining the scene in proportions, such as a fraction of the canvas height,
simplifies dynamic layouts. So, let's switch to rendering our circle with a
radius of 1/3 of the canvas height:

```js
const radius = canvas.height / 3;

ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(
  canvas.width / 2,
  canvas.height / 2,
  radius,
  0,
  Math.PI * 2
);
ctx.fill();
```

<script>
  function drawCircleScene(ctx) {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio;

    const {width, height} = canvas.getBoundingClientRect();

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const radius = canvas.height / 3;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      radius,
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
    resize: false,
    init: (_canvas, ctx) => drawCircleScene(ctx)
  });
</script>

### Resizing

Typically, a canvas will be set up to be dynamically resized to fit its
container. After rendering the circle once, let's start changing the width of
the canvas container:

<p class="canvas-container">
  <span class="canvas-subcontainer auto-resize">
    <canvas id="canvas-resize-stretch" class="fit black bordered"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-stretch', {
    resize: false,
    init: (_canvas, ctx) => drawCircleScene(ctx)
  });
</script>

As the container width changes, the circle stretches into an ellipse because the
canvas pixels are resampled to fit the new dimensions.

#### Brute-force rendering

One way to address this is to set up a rendering loop to keep adjusting the
intrinsic dimensions of the canvas and rendering the scene every frame. This
way, the entire scene will always be rendered at the correct proportions. We'll
use a [requestAnimationFrame][5] (RAF) loop for this:

[5]: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

```js
function draw() {
  // Request the next frame before we draw this one
  requestAnimationFrame(draw);

  const dpr = window.devicePixelRatio;
  const {width, height} = canvas.getBoundingClientRect();

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radius = canvas.height / 6;

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    radius,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Kick off the loop
requestAnimationFrame(draw);
```

<p class="canvas-container raf">
  <span class="canvas-subcontainer auto-resize">
    <canvas id="canvas-resize-draw" class="fit black bordered"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-draw', {
    resize: false,
    draw: (ctx) => drawCircleScene(ctx)
  });
</script>

The circle remains a circle now.

#### Preserving the aspect ratio

Instead of rendering a static scene every frame, another option is to preserve
the aspect ratio of the canvas so that the scene doesn't stretch or squash. We
can render the canvas once and let CSS do its thing:

```html
<div class="container">
  <canvas></canvas>
</div>
```

```css
/* How this container itself fits into the layout is up to you */
.container {
  aspect-ratio: 300 / 150;
}

canvas {
  /* Alternatively, use Flexbox */
  width: 100%;
  height: 100%;
}
```

<p class="canvas-container">
  <span class="canvas-subcontainer auto-resize" style="width: 300px; min-height: 0; height: auto; aspect-ratio: 300 / 150;">
    <canvas id="canvas-resize-stretch-ar" class="black bordered" style="width: 100%; height: 100%;"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-stretch-ar', {
    resize: false,
    init: (_canvas, ctx) => drawCircleScene(ctx)
  });
</script>

The circle remains a circle.

#### Avoid resampling

However, the ugly truth is that you will lose all the crispy rendering you got
at the start by updating the intrinsic dimensions of the canvas with DPR in
mind. Even when initially rendering big and then scaling down, resampling can
cause undesirable artifacts. And initially rendering small and then scaling up
will create blurry results:

<p class="canvas-container">
  <span id="canvas-resize-stretch-tiny-container" class="canvas-subcontainer" style="width: 80px; height: 40px;">
    <canvas id="canvas-resize-stretch-tiny" class="black" style="width: 100%; height: 100%;"></canvas>
  </span>
</p>

<script>
  render('canvas-resize-stretch-tiny', {
    resize: false,
    init: (canvas, ctx) => {
      drawCircleScene(ctx);

      const container = document.querySelector('#canvas-resize-stretch-tiny-container');
      container.style.width = '300px';
      container.style.height = '150px';
    }
  });
</script>

#### Debounced redraw

We can watch for the resizing of the canvas and redraw the scene on a debounce.
This approach allows resampling during resizing but ensures accurate proportions
once resizing stops.

Let's do this efficiently. To watch for resizing, we'll use the `ResizeObserver`
browser API:

```js
// One could always use Lodash's debounce
function tailDebounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

let contentRect = null;

const draw = () => {
  // Always draw when the time is right
  requestAnimationFrame(() => {
    const dpr = window.devicePixelRatio;
    const rect = contentRect || canvas.getBoundingClientRect();
    const {width, height} = rect;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const radius = canvas.height / 3;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
};

const debouncedDraw = tailDebounce(draw, 100);

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target === canvas && entry.contentRect) {
      contentRect = entry.contentRect;
      debouncedDraw();
    }
  }
});

draw();
resizeObserver.observe(canvas);
```

<p class="canvas-container">
  <span
    id="canvas-size-update-container"
    class="canvas-subcontainer auto-resize"
    style="width: 100px; min-height: 0; height: auto; aspect-ratio: 300 / 150;"
  >
    <canvas
      id="canvas-size-update"
      class="black bordered"
      style="width: 100%; height: 100%;"
    ></canvas>
  </span>
</p>

<script>
  render('canvas-size-update', {
    resize: false,
    init: (canvas, ctx) => {
      let contentRect = null;

      const draw = () => {
        requestAnimationFrame(() => {
          if (!contentRect) {
            return;
          }

          const dpr = window.devicePixelRatio;

          canvas.width = contentRect.width * dpr;
          canvas.height = contentRect.height * dpr;

          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const radius = canvas.height / 3;

          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      };

      const debouncedDraw = tailDebounce(draw, 100);

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === canvas && entry.contentRect) {
            contentRect = entry.contentRect;
            debouncedDraw();
          }
        }
      });

      draw();
      resizeObserver.observe(canvas);
    }
  });
</script>

If you look closely, especially when scaling up, you can see the scene being
resampled, creating a blurry edge around the circle. When the resizing stops
for at least 100ms, the scene is redrawn and the crispiness is restored.

### Stroke width and font size

Here's a hollow circle with a 3px border, with the text "circle" in the middle:

```js
ctx.lineWidth = 3;

ctx.strokeStyle = 'white';
ctx.beginPath();
ctx.arc(
  canvas.width / 2,
  canvas.height / 2,
  radius,
  0,
  Math.PI * 2
);
ctx.stroke();

const fontSize = 1 * dpr;
const fontFace = 'Varela Round';

ctx.fillStyle = 'white';
ctx.font = `${fontSize}em ${fontFace}`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('circle', canvas.width / 2, canvas.height / 2);
```

<p class="canvas-container">
  <canvas id="canvas-stroke" class="fit black"></canvas>
</p>

<script>
function renderStrokeScene(ctx, forceDpr) {
  const canvas = ctx.canvas;
  const {width, height} = canvas.getBoundingClientRect();

  const dpr = window.devicePixelRatio;
  const usedDpr = forceDpr || dpr;

  canvas.width = width * usedDpr;
  canvas.height = height * usedDpr;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radius = canvas.height / 3;

  ctx.lineWidth = 3;

  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    radius,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  const fontSize = 1 * usedDpr;
  const fontFace = 'Varela Round';

  ctx.fillStyle = 'white';
  ctx.font = `${fontSize}em ${fontFace}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('circle', canvas.width / 2, canvas.height / 2);

  const x = canvas.width / 2 + radius;
  const y = canvas.height / 2;

  const SAMPLE = 11;
  const ZOOM = 7;

  ctx.strokeStyle = '#00c0ff';
  ctx.lineWidth = 2 * usedDpr;

  ctx.strokeRect(
    x - SAMPLE / 2 * usedDpr | 0,
    y - SAMPLE / 2 * usedDpr | 0,
    SAMPLE * usedDpr,
    SAMPLE * usedDpr
  );

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    canvas,
    x - SAMPLE / 2 * usedDpr | 0,
    y - SAMPLE / 2 * usedDpr | 0,
    SAMPLE * usedDpr,
    SAMPLE * usedDpr,
    x + SAMPLE * usedDpr,
    y - SAMPLE * ZOOM / 2 * usedDpr,
    SAMPLE * ZOOM * usedDpr,
    SAMPLE * ZOOM * usedDpr
  );
}

render('canvas-stroke', {
  init: (_canvas, ctx) => renderStrokeScene(ctx),
});
</script>

The stroke width is not affected by the intrinsic resolution of the canvas. When
you set the stroke width to 3, it will always be 3 logical pixels wide. Font
size, however, needs to account for DPR adjustments.

Here's the same scene without the DPR adjustment:

<p class="canvas-container">
  <canvas id="canvas-stroke-no-dpr" class="fit black"></canvas>
</p>

<script>
render('canvas-stroke-no-dpr', {
  init: (_canvas, ctx) => renderStrokeScene(ctx, 1)
});
</script>

If your DPR is greater than 1, the border should still appear more or less the
same thickness as the previous one, but blurrier.

Solid shapes, images, and text should consider DPR for clarity. Strokes not so.

