---
layout: layouts/post
title: 'A Short Introduction to Dwitter and JavaScript Golfing'
description: 'A very short introduction to JavaScript golfing on Dwitter, with a focus on the "default dweet".'
image: i/default-dweet.png
date: 2024-12-20
libs:
  - render
  - dweet
---

This is a brief introduction to [JavaScript golfing][1] &mdash; not the competitive
kind, but the kind on [Dwitter][2]: a community for sharing visual JavaScript
demos in 140 characters.

The Dwitter community has a friendly and collaborative remix culture (where
users "fork" each other's works and build on them). And there's also a culture
of sharing tips and tricks.

Sidestepping the numerous online resources for writing unreadably compact
JavaScript, I will share the tricks I know and use, and try to present them in
a progressive manner.

<p class="meta">Check out my originals and remixes
over at Dwitter under "<a href="https://www.dwitter.net/u/magna/top">magna</a>" to see some of these tricks in action.</p>

[1]: https://en.wikipedia.org/wiki/Code_golf
[2]: https://www.dwitter.net/

### Dweet

Demos posted on Dwitter are called "dweets". The premise is, there's a rendering
loop that keeps calling the function `u(t)` where `t` is time in seconds since
the start of the demo, and you have to fit function `u`'s body into 140
characters.

You're using the `<canvas>` API, with a 2D context. Dwitter gives you the
following global variables:

| Variable | Value                                |
| -------- | ------------------------------------ |
| `c`      | the 1920x1080 canvas element         |
| `x`      | the 2D context                       |
| `S`      | the sine function (`Math.sin`)       |
| `C`      | the cosine function (`Math.cos`)     |
| `T`      | the tangent function (`Math.tan`)    |
| `R`      | a function for creating RGBA colors  |
| `frame`  | a counter, incremented on each frame |

The `R` function takes four optional parameters: red, green, blue, and alpha. e.g. `R(255, 0, 0, 0.5)` is a semi-transparent red color. Skipped arguments default to 0 except for alpha, which defaults to 1.

### The Default Scene

When you hit the **New** button on Dwitter, you're presented with this default
scene:

<pre class="dweet play"><code class="language-js">c.width=1920 // clear the canvas
for(i=0;i<9;i++)
x.fillRect(400+i*100+S(t)*300,400,50,200) // draw 50x200 rects
</code></pre>

9 black rectangles, swaying back and forth, following a sine wave.

This default scene is the main subject of many dweets, employing different
creative/surprising techniques to draw the rectangles. Or a subject that makes
a sudden entrance into an existing scene through a remix.

It's a Dwitter meme.

The default dweet is 112 characters in its initial form. Let's start shaving
some characters off, bit by bit.

### Obvious things

Let's start with the banally obvious: Remove comments and whitespace.

<pre class="dweet"><code class="language-js">c.width=1920;for(i=0;i<9;i++)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

We're down to 70.

### Idempotency

Assigning the width or height of a canvas resets the canvas, even if the value
is the same as the current value.

That's why the default scene sets the canvas width to 1920: To clear the canvas
before drawing each frame.

But what we really need is a no-op assignment to clear the canvas. Any
idempotent operation will do. So we can binary OR the canvas width with 0:

<pre><code>c.width=19<span class="remove">20</span>
c.width|=0
</code></pre>

We shave another 2 characters off.

We could have added 0 or multiplied by 1. You get the idea.

### Loop inversion

When loop order is unimportant, we can invert loops to shave characters.

<pre><code>for(i=0;i<9;i<span class="remove">++)</span>
for(i=9;i--;)
</code></pre>

We shave 3 characters off.

<pre class="dweet"><code class="language-js">c.width|=0;for(i=9;i--;)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

Down to 65.

This is the maximum we can shave off, without resorting to other API methods, or
starting to mess with the scene composition.

### Compromising

Well, we often can mess with the scene composition. We can compromise accuracy
when the result is visually indistinguishable.

OR'ing with 0 is idempotent. So is OR'ing with 9, when we're willing to
compromise and accept 1929 as the new 1920.

OR'ing with 9 results in 1929 (`1920 | 9`), but the 9-pixel difference is imperceptible.

<pre><code>c.width|=0;for(i=9;i--<span class="remove">;)</span>
for(c.width|=i=9;i--;)
</code></pre>

We shave another 2 characters off.

<pre class="dweet play"><code class="language-js">for(c.width|=i=9;i--;)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

Down to 63.

And with that, one Dwitter article down, `n` to go.

<p class="meta">This was a short one, but there's more where this came from.
</p>
