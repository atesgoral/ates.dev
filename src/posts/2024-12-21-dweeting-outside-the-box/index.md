---
layout: layouts/post
title: 'Dweeting Outside the Box'
description: 'Demonstration of JavaScript golfing techniques by rendering the "default dweet" in different ways.'
image: i/default-dweet.png
date: 2024-12-21
libs:
  - render
  - dweet
draft: true
---

This is a continuation of my [previous post][1] on Dwitter, where I gave an
overview of [Dwitter][2] and a few JavaScript golfing tricks.

[1]: /posts/2024-12-20-intro-to-dwitter
[2]: https://www.dwitter.net/

The subject was the "default dweet", which renders 9 bars swaying back and
forth. I'll keep the subject the same, but show rendering those 9 bars in
different ways.

Let's start with recalling the default dweet:

<pre class="dweet play"><code class="language-js">c.width|=0;for(i=9;i--;)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

### Punching holes

You can use `clearRect()` whenever you want to render a white rectangle over a
dark background because Dwitter sets the background of the canvas to white.

First, let's render our hole punchers in different colors to see their
positions:

<pre class="dweet play no-length"><code class="language-js">// black background
x.fillStyle = "black";
x.fillRect(0, 0, 1920, 1080);

// punch out top
x.fillStyle = "hsl(0,100%,50%)";
x.fillRect(0, 0, 1920, 400);

// punch out bottom
x.fillStyle = "hsl(30,100%,50%)";
x.fillRect(0, 600, 1920, 480);

// left edge of bars
X = 400 + S(t) * 300;

// punch out left
x.fillStyle = "hsl(60,100%,50%)";
x.fillRect(0, 400, X, 200);

// punch out right
x.fillStyle = "hsl(90,100%,50%)";
x.fillRect(X + 850, 400, 1070 - X, 200); // punch out right

// punch out bars
for (i = 8; i--; ) {
  x.fillStyle = `hsl(${120 + i * 30},100%,50%)`;
  x.fillRect(X + 50 + i * 100, 400, 50, 200);
}
</code></pre>

And with actually clearing out the rectangles, and with some minimal effort in
golfing this down in length:

<pre class="dweet play"><code class="language-js">x.fillRect(0,0,1920,1080)
x.clearRect(0,0,1920,400)
x.clearRect(0,600,1920,480)
X=400+S(t)*300
x.clearRect(0,400,X,200)
x.clearRect(X+850,400,1070-X,200)
for(i=8;i--;)x.clearRect(X+50+i*100,400,50,200)
</code></pre>

Let's properly golf this down to fit in 140 characters.

#### Exponential notation

`2e3`, which means `2 * 10^3`, is shorter than `2000`. And 2000 is a perfectly
good substitute for `1920` and `1080`. The canvas API doesn't mind if you
draw or clear outside of it. Let's replace some numbers:

<pre class="dweet play"><code class="language-js">x.fillRect(0,0,2e3,2e3)
x.clearRect(0,0,2e3,400)
x.clearRect(0,600,2e3,480)
X=400+S(t)*300
x.clearRect(0,400,X,200)
x.clearRect(X+850,400,1070-X,200)
for(i=8;i--;)x.clearRect(X+50+i*100,400,50,200)
</code></pre>

And let's introduce a utility function to clear rectangles to reduce repetition:

<p class="meta">Check out my originals and remixes
over at Dwitter under "<a href="https://www.dwitter.net/u/magna/top">magna</a>" to see some of these tricks in action.</p>
