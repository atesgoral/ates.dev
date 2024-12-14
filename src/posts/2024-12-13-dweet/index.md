---
layout: layouts/post
title: 'Dweet'
description: ''
image: i/default-dweet.png
date: 2024-12-13
draft: true
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

function render(idOrNode, {init, draw, resize = true}) {
  const canvas = typeof id === 'string'
    ? document.querySelector(`#${idOrNode}`)
    : idOrNode;
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
      try {
        draw.call(state, ctx, t);
      } catch (error) {
        console.error('Error on draw', error);
        cancelAnimationFrame(rafId);
      }
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

function dweetRenderer(src) {
  const u = new Function('t', src);

  const wrapped = new Function('state', 'time', `
    with (state) {
      (${u})(time);
    }
  `);

  const minFrameTimeMs = 1000 / 60
  let lastRenderTime = null;

  return {
    init(canvas, ctx) {
      canvas.width = 1920;
      canvas.height = 1080;

      Object.assign(this, {
        frame: 0,
        c: canvas,
        x: ctx,
        S: Math.sin,
        C: Math.cos,
        T: Math.tan,
        R: (r,g,b,a) => {
          a = a === undefined ? 1 : a;
          return 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' + a + ')';
        },
      });
    },
    draw(ctx, t) {
      const now = performance.now();

      if (lastRenderTime === null) {
        lastRenderTime = now - minFrameTimeMs;
      } else {
        const elapsedTime = now - lastRenderTime;

        if (elapsedTime >= minFrameTimeMs) {
          lastRenderTime = now;

          let time = this.frame / 60;

          if (time * 60 | 0 == this.frame - 1) {
            time += 0.000001;
          }

          this.frame++;

          wrapped(this, time);
        }
      }
    },
    resize: false,
  }
}
</script>

<script>
window.addEventListener('DOMContentLoaded', () => {
  const lengthTemplate = document.querySelector('#dweet-length-template');
  const playerTemplate = document.querySelector('#dweet-player-template');
  const playableDweets = document.querySelectorAll('.dweet.play');

  playableDweets.forEach((playableDweet) => {
    const src = playableDweet.querySelector('code').textContent.trim();
    const length = lengthTemplate.querySelector('div').cloneNode(true);
    const player = playerTemplate.querySelector('p').cloneNode(true);
    const canvas = player.querySelector('canvas');

    length.querySelector('span').innerText = src.length;

    playableDweet.appendChild(length);

    playableDweet.parentNode.insertBefore(player, playableDweet.nextSibling);

    render(canvas, dweetRenderer(src));
  });
});
</script>

<div id="dweet-length-template" style="display: none">
  <div class="length"><span></span>/140</div>
</div>

<div id="dweet-player-template" style="display: none">
  <p class="canvas-container">
    <span class="canvas-subcontainer">
      <canvas class="fit white"></canvas>
    </span>
  </p>
</div>

<pre class="dweet play"><code class="language-js">c.width=1920 // clear the canvas
for(i=0;i<9;i++)
x.fillRect(400+i*100+S(t)*300,400,50,200) // draw 50x200 rects
</code></pre>

### Obvious things

<pre class="dweet"><code class="language-js">c.width=1920;for(i=0;i<9;i++)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

### Idempotency

```
c.width=1920
c.width|=0
++++++++++--
```

### Loop inversion

```
for(i=0;i<9;i++)
for(i=9;i--;)
+++++++++++++---
```

<pre class="dweet"><code class="language-js">c.width|=0;for(i=9;i--;)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

### Compromising

```
c.width|=0;for(i=9;i--;)
for(c.width|=i=9;i--;)
++++++++++++++++++++++--
```

<pre class="dweet play"><code class="language-js">for(c.width|=i=9;i--;)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

<pre class="dweet play"><code class="language-js">x.beginPath();x.arc(960,540,400,0,Math.PI*2);x.fill()
</code></pre>

```
Math.PI*2
7
+--------
```

<pre class="dweet play"><code class="language-js">x.beginPath();x.arc(960,540,400,0,7);x.fill()
</code></pre>
