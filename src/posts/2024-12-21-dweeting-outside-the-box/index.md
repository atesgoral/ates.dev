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

Changing up how you render a scene often opens up new opportunities for visual
effects because it's like stepping into another dimension.

Let's start with recalling the default dweet:

<pre class="dweet play"><code class="language-js">c.width|=0;for(i=9;i--;)x.fillRect(400+i*100+S(t)*300,400,50,200)
</code></pre>

### Scale

Seeing that the bars click into a 50x50 grid, one might be tempted to scale the
context to save on digits. Let's scale the context by 50 and divide all
dimensions by 50:

<pre class="dweet play"><code class="language-js">c.width|=0;x.scale(50,50);for(i=9;i--;)x.fillRect(8+i*2+S(t)*6,8,1,4)
</code></pre>

I this particular case, the extra length of `x.scale(50,50)` is not offset by
the savings we got from fewer digits. We went from 65 to 69 characters.

In tiny-space coding, intuitions often don't pan out. You just have to try
things for fit.

We can also scale the canvas itself, but we'll heavily compromise on rendering
quality. However, it's often an aesthetic choice to get things super blurry.

Let's make the canvas ~50 times smaller. `1920 / 50 = 38.4`. `38` should be
good enough for our purposes.

<pre class="dweet play"><code class="language-js">c.width=38;for(i=9;i--;)x.fillRect(8+i*2+S(t)*6,8,1,4)
</code></pre>

### Transform

<pre class="dweet play"><code class="language-js">for(c.width|=i=9,Z=1,A=0;i--;x.fillRect(-560+i*100+S(t)*300,-140,50,200))x.setTransform(k=C(A)*Z,z=S(A)*Z,-z,k,960,540)
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

Let's golf this down to fit in 140 characters.

#### Exponential notation

`2e3`, which means `2 * 10^3`, is shorter than `2000`. And 2000 is a perfectly
good substitute for 1920 and 1080. The canvas API doesn't mind if you draw or
clear outside of it.

And since the minimum value of `X` is 100, the minimum value of `1070-X` is 970.
We could use `970` or `1e3`, to the same effect.

Let's replace some numbers:

<pre class="dweet play"><code class="language-js">x.fillRect(0,0,2e3,2e3)
x.clearRect(0,0,2e3,400)
x.clearRect(0,600,2e3,480)
X=400+S(t)*300
x.clearRect(0,400,X,200)
x.clearRect(X+850,400,1e3,200)
for(i=8;i--;)x.clearRect(X+50+i*100,400,50,200)
</code></pre>

And let's introduce a utility function, `p`, to reduce repetition:

<pre class="dweet play"><code class="language-js">p=(X,Y,W,H)=>x.clearRect(X,Y,W,H)
x.fillRect(0,0,2e3,2e3)
p(0,0,2e3,400)
p(0,600,2e3,480)
X=400+S(t)*300
p(0,400,X,200)
p(X+850,400,1e3,200)
for(i=8;i--;)p(X+50+i*100,400,50,200)
</code></pre>
