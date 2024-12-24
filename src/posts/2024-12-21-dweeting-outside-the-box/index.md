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

### Transform

Instead of positioning the elements of the scene by x and y offsets from the top
left, we can use `translate()` to shift the frame of reference to the center of
the canvas. This can yield two benefits:

1. If there are multiple primitives in the scene, we don't have to repeat adding
   offsets to them and therefore save on characters.
2. We can use `rotate()` to rotate them around the center of the canvas.

`translate(960, 540)` moves the origin `(0, 0)` to the center of the canvas.
Assume we're going to rotate by angle `A` using `rotate(A)`. We can combine
these stacked transformations into a single `setTransform()` call, saving
precious space. Let's also throw `Z`, the zoom factor, into the mix. The verbose
form is:

```js
x.setTransform(C(A) * Z, S(A) * Z, -S(A) * Z, C(A) * Z, 960, 540);
```

Here's the default scene using such combined transformations:

<pre class="dweet play"><code class="language-js">for(c.width|=i=9,Z=1,A=0;i--;x.fillRect(-560+i*100+S(t)*300,-140,50,200))x.setTransform(k=C(A)*Z,z=S(A)*Z,-z,k,960,540)
</code></pre>

This transformation setup unlocks perfect-loop opportunities like [so][3]:

[3]: https://www.dwitter.net/d/21975

<pre class="dweet play"><code class="language-js">for(c.width|=i=9;i--;x.fillRect(-425+i*100,-103,99-p**.3*50,206))p=t/2%1,Z=2.26+p*7.34,x.setTransform(k=C(A=1.57*p)*Z,z=S(A)*Z,-z,k,960,540)
</code></pre>

And [so][4]:

[4]: https://www.dwitter.net/d/13859

<pre class="dweet play"><code class="language-js">eval(unescape(escape`挮睩摴桼㵦㵢㴾房❣汥慲剥捴✺❦楬汒散琧㭳㵓⡴⤻娽㤵〪猪⨴⬵〻甽䌨琩⩚㭸学⡵㸰⥝⠰ⰰⰲ攳ⰲ攳⤻砮瑲慮獦潲洨甬稽猪娬⵺Ⱶⰹ㘰ⰵ㐰⤻景爨椽ㄸ㭩ⴭ㬩硛昨椦ㄩ崨椭㤬ⴲⰱⰴ⤻`.replace(/u(..)/g,"$1%")))
</code></pre>

That gibberish? It's an oft-used compression hack to stuff more than 140
characters into a dweet. The raw characters are encoded as UTF-16 code units,
and then escaped as UTF-8 code units. It doesn't necessarily go against the
"140 characters" rule of Dwitter, because the rule was never about "bytes", but
rather "characters". But it's not as pleasing as fitting a dweet into 140
characters without compression.

A quick way to see what the uncompressed version is, is to replace the `eval()`
with a `throw`. The [perpetual-beta version of Dwitter][5] comes with a toggle
to show uncompressed code.

Here's the uncompressed version of the dweet above:

<pre class="dweet"><code class="language-js">c.width|=f=b=>b?'clearRect':'fillRect';s=S(t);Z=950*s**4+50;u=C(t)*Z;x[f(u>0)](0,0,2e3,2e3);x.transform(u,z=s*Z,-z,u,960,540);for(i=18;i--;)x[f(i&1)](i-9,-2,1,4)
</code></pre>

To compress, you can use the wonderful [CapJS][6] tool created by the one and
only [Frank Force][7].

[5]: https://beta.dwitter.net/
[6]: https://capjs.3d2k.com/
[7]: https://frankforce.com/

<!--
# Attic

We can also scale the canvas itself, but we'll heavily compromise on rendering
quality. However, it's often an aesthetic choice to get things super blurry.

Let's make the canvas ~50 times smaller. `1920 / 50 = 38.4`. `38` should be
good enough for our purposes.

<pre class="dweet play"><code class="language-js">c.width=38;for(i=9;i--;)x.fillRect(8+i*2+S(t)*6,8,1,4)
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
-->
