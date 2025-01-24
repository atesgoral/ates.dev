function dweetRenderer(src) {
  const u = new Function('t', src);

  const wrapped = new Function(
    'state',
    'time',
    `
    with (state) {
      (${u})(time);
    }
  `,
  );

  const minFrameTimeMs = 1000 / 60;
  let lastRenderTime = null;

  return {
    init(canvas, ctx) {
      Object.assign(this, {
        frame: 0,
        c: canvas,
        x: ctx,
        S: Math.sin,
        C: Math.cos,
        T: Math.tan,
        R: (r, g, b, a) => {
          a = a === undefined ? 1 : a;
          return (
            'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' + a + ')'
          );
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

          if ((time * 60) | (0 == this.frame - 1)) {
            time += 0.000001;
          }

          this.frame++;

          wrapped(this, time);
        }
      }
    },
    resize: false,
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const lengthTemplate = document.querySelector('#dweet-length-template');
  const playerTemplate = document.querySelector('#dweet-player-template');
  const dweets = document.querySelectorAll('.dweet');

  dweets.forEach((dweet) => {
    const src = dweet.querySelector('code').textContent.trim();
    const length = lengthTemplate.querySelector('div').cloneNode(true);

    length.querySelector('span').innerText = [...src].length;

    if (src.length > 140) {
      length.classList.add('too-long');
    }

    dweet.appendChild(length);

    if (dweet.classList.contains('play')) {
      const player = playerTemplate.querySelector('p').cloneNode(true);
      const canvas = player.querySelector('canvas');

      dweet.parentNode.insertBefore(player, dweet.nextSibling);

      render(canvas, dweetRenderer(src));
    }
  });
});
