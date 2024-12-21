function tailDebounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const visibilityCallbacks = new WeakMap();

const visibilityObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      entry.target.setAttribute('data-in-viewport', entry.isIntersecting);
      visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
    }
  },
  {
    threshold: 0.75,
  },
);

const resizeCallbacks = new WeakMap();

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      resizeCallbacks.get(entry.target)?.();
    }
  }
});

function render(idOrNode, {init, draw, resize = true}) {
  const canvas =
    typeof idOrNode === 'string'
      ? document.querySelector(`#${idOrNode}`)
      : idOrNode;
  const ctx = canvas.getContext('2d');
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
