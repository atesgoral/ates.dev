---
layout: layouts/page
title: Multiple Synthetic Lights
image: i/lighting-09.jpg
---

Multiple photographs taken with different light sources can be blended together to create images that appear to have all the light sources simultaneously active. The light sources can be attributed arbitrary colors as well, allowing the creation of an infinite number of synthetic scenes.

Quoting from [Synthetic Lighting for Photography](https://www.graficaobscura.com/synth/) by Paul Haeberli:

> Light from different light sources add together to illuminate objects in a scene. We can use this super-position principle to modify the lighting of a scene after it has been photographed...

I've created an interactive application with three light sources with different colors.

<main>
</main>
{: .center}

Hover over the image to change the intensities of the three light sources.

This was originally done using [Processing](https://processing.org/), then ported to Processing.js (deprecated) and I've recently ported it to [p5.js](https://p5js.org/) with GPT-4. You can download the original [PDE file](multi_focus.pde) or the ported [p5.js file](sketch.js).

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

<script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.js"></script>
<script src="sketch.js"></script>
