function setClass(el, classToToggle, set) {
  let className = el.className;
  const classes = new Set(className && className.split(" "));

  if (set) {
    classes.add(classToToggle);
  } else {
    classes.delete(classToToggle);
  }

  className = [...classes.keys()].join(" ");

  el.className = className;
}

function toggleClass(el, classToToggle) {
  let className = el.className;
  const classes = new Set(className && className.split(" "));

  const classWasPresent = classes.has(classToToggle);

  if (classWasPresent) {
    classes.delete(classToToggle);
  } else {
    classes.add(classToToggle);
  }

  className = [...classes.keys()].join(" ");

  el.className = className;

  return !classWasPresent;
}

function initializeZoom() {
  function toggleImageZoom(imageEl) {
    toggleClass(imageEl, "zoomed");
  }

  function closeZoomedImage() {
    const zoomedEl = document.querySelector(".zoomed");

    if (zoomedEl) {
      toggleImageZoom(zoomedEl);
    }
  }

  const imageEls = document.querySelectorAll(".zoomable > img");

  for (const imageEl of imageEls) {
    imageEl.addEventListener("click", () => toggleImageZoom(imageEl));
  }

  document.body.addEventListener("keyup", (evt) => {
    if (evt.key === "Escape") {
      closeZoomedImage();
    }
  });
}

function initializeTrails() {
  const trailsContainer = document.createElement("div");
  const trailsCanvas = document.createElement("canvas");

  trailsContainer.setAttribute("id", "trails-container");
  trailsCanvas.setAttribute("id", "trails");

  trailsContainer.appendChild(trailsCanvas);
  document.querySelector("body").appendChild(trailsContainer);

  const dpr = window.devicePixelRatio;

  trailsCanvas.width = trailsCanvas.clientWidth * dpr;
  trailsCanvas.height = trailsCanvas.clientHeight * dpr;

  let lastTrailsMove = null;
  const trails = {
    x: null,
    y: null,
  };

  function moveTrails(x, y) {
    lastTrailsMove = performance.now();
    trails.x = x;
    trails.y = y;

    trailsCanvas.style.left = `${
      trails.x - trailsCanvas.clientWidth / 2 + window.scrollX
    }px`;
    trailsCanvas.style.top = `${
      trails.y - trailsCanvas.clientHeight / 2 + window.scrollY
    }px`;
  }

  document.body.addEventListener("mousemove", (evt) => {
    moveTrails(evt.clientX, evt.clientY);
  });

  document.body.addEventListener("mousedown", (evt) => {
    moveTrails(evt.clientX, evt.clientY);
  });

  document.body.addEventListener("touchstart", (evt) => {
    moveTrails(evt.touches[0].clientX, evt.touches[0].clientY);
  });

  document.body.addEventListener("touchmove", (evt) => {
    moveTrails(evt.touches[0].clientX, evt.touches[0].clientY);
  });

  window.addEventListener("scroll", () => {
    moveTrails(trails.x, trails.y);
  });

  const trailsCtx = trailsCanvas.getContext("2d");

  function renderTrails(t) {
    requestAnimationFrame(renderTrails);

    if (lastTrailsMove === null) {
      return;
    }

    const debug = window.location.search.includes("debug");

    const maxAge = 1000;

    const elapsed = performance.now() - lastTrailsMove;

    if (elapsed > maxAge) {
      return;
    }

    const decayAlpha = 1 - elapsed / maxAge;

    const scale = trailsCanvas.width;

    trailsCanvas.width |= 0;

    if (debug) {
      trailsCtx.strokeStyle = "#fff";
      trailsCtx.strokeRect(0, 0, trailsCanvas.width, trailsCanvas.height);
      trailsCtx.fillStyle = "#fff";
      trailsCtx.font = "40px sans-serif";
      trailsCtx.fillText(`window.scrollY: ${window.scrollY}`, 20, 60);
      trailsCtx.fillText(`trailsY: ${trails.y}`, 20, 120);
    }

    trailsCtx.scale(scale, scale);
    trailsCtx.translate(0.5, 0.5);

    const pixel = 1 / scale;

    trailsCtx.fillStyle = "#a484ff";

    const subs = 16;
    const spacing = trailsCanvas.clientWidth / subs;
    const size = 2;

    for (let i = 0; i < subs; i++) {
      for (let j = 0; j < subs; j++) {
        const x =
          i / subs - 0.5 - (trails.x % spacing) / trailsCanvas.clientWidth;
        const y =
          j / subs - 0.5 - (trails.y % spacing) / trailsCanvas.clientWidth;

        const distance = Math.hypot(x, y);
        const distanceAlpha = 1 - Math.min(distance, 0.5) / 0.5;

        trailsCtx.globalAlpha = decayAlpha * distanceAlpha;

        const displacement = distanceAlpha ** 0.5;
        const dispX = x / displacement;
        const dispY = y / displacement;

        trailsCtx.beginPath();
        trailsCtx.arc(
          dispX - (size / 2) * pixel,
          dispY - (size / 2) * pixel,
          size * pixel,
          0,
          Math.PI * 2
        );
        trailsCtx.fill();
      }
    }
  }

  requestAnimationFrame(renderTrails);
}

function initializeThemeToggle() {
  const toggleLabel = document.createElement("label");

  toggleLabel.setAttribute("id", "theme-toggle-label");
  toggleLabel.setAttribute("class", "hoverable");
  toggleLabel.appendChild(document.createTextNode("Toggle theme"));

  const toggle = document.createElement("input");

  toggle.setAttribute("type", "checkbox");
  toggle.setAttribute("id", "theme-toggle");
  toggle.setAttribute("title", "Toggle theme");

  toggleLabel.appendChild(toggle);
  document.querySelector("main").appendChild(toggleLabel);

  function applyPrefs() {
    const themeOverride = localStorage.getItem("theme-override");
    const lightMode = themeOverride && themeOverride === "light";

    setClass(document.body, "light-mode", lightMode);
    toggle.checked = !lightMode;
  }

  applyPrefs();

  window.addEventListener("storage", applyPrefs);

  toggle.addEventListener("change", () => {
    setClass(document.body, "light-mode", !toggle.checked);
    localStorage.setItem("theme-override", toggle.checked ? "dark" : "light");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeTrails();
  initializeZoom();
  initializeThemeToggle();
});
