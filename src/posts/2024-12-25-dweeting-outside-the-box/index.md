---
layout: layouts/post
title: 'Dweeting Outside the Box'
description: 'Demonstration of JavaScript golfing techniques by rendering the "default dweet" in different ways.'
image: i/default-dweet.png
date: 2024-12-25
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

In this particular case, the extra length of `x.scale(50,50)` is not offset by
the savings we got from fewer digits. We went from 65 to 69 characters. The
function call overhead (`x.scale()`) costs more characters than what we save by
using smaller numbers.

In tiny-space coding, intuitions often don't pan out, you just have to try
things for fit.

### Transform

Instead of positioning the elements of the scene by x and y offsets from the top
left, we can use `translate()` to shift the frame of reference to the center of
the canvas. This can yield two benefits:

1. If there are multiple primitives in the scene, we don't have to repeat adding
   offsets to them and therefore save on characters.
2. We can use `rotate()` to rotate them around the center of the canvas.

`translate(960, 540)` moves the origin `(0, 0)` to the center of the canvas.
Assuming we want to rotate by angle `A` using `rotate(A)`, we can combine
these stacked transformations into a single `setTransform()` call, saving
precious space. Let's also throw `Z`, the zoom factor, into the mix. The verbose
form is:

```js
x.setTransform(C(A) * Z, S(A) * Z, -S(A) * Z, C(A) * Z, 960, 540);
```

Here's the default scene using such combined transformations:

<pre class="dweet play"><code class="language-js">for(c.width|=i=9,Z=1,A=0;i--;x.fillRect(-560+i*100+S(t)*300,-140,50,200))x.setTransform(k=C(A)*Z,z=S(A)*Z,-z,k,960,540)
</code></pre>

This transformation setup enables perfect-loop animations like [so][3]:

[3]: https://www.dwitter.net/d/21975

<pre class="dweet play"><code class="language-js">for(c.width|=i=9;i--;x.fillRect(-425+i*100,-103,99-p**.3*50,206))p=t/2%1,Z=2.26+p*7.34,x.setTransform(k=C(A=1.57*p)*Z,z=S(A)*Z,-z,k,960,540)
</code></pre>

And [so][4]:

[4]: https://www.dwitter.net/d/13859

<pre class="dweet play"><code class="language-js">eval(unescape(escape`挮睩摴桼㵦㵢㴾房❣汥慲剥捴✺❦楬汒散琧㭳㵓⡴⤻娽㤵〪猪⨴⬵〻甽䌨琩⩚㭸学⡵㸰⥝⠰ⰰⰲ攳ⰲ攳⤻砮瑲慮獦潲洨甬稽猪娬⵺Ⱶⰹ㘰ⰵ㐰⤻景爨椽ㄸ㭩ⴭ㬩硛昨椦ㄩ崨椭㤬ⴲⰱⰴ⤻`.replace(/u(..)/g,"$1%")))
</code></pre>

That gibberish? It's an oft-used compression hack to stuff more than 140
characters into a dweet. The raw characters are encoded as UTF-16 code units,
and then escaped as UTF-8 code units. While this doesn't technically violate the
"140 characters" rule of Dwitter (since the rule was about characters, not bytes),
it's not as pleasing as fitting a dweet into 140 characters without compression.

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

### Slice and Dice

We can chop up the bars into tiny squares and perturb their individual positions
or colors to create interesting effects. Like [this][8] twirl:

[8]: https://www.dwitter.net/d/2384

<pre class="dweet play"><code class="language-js">c.width|=0;for(j=9;j--;)for(i=100;i--;X=i%5+j*10+S(t)*30,Y=i/5|0,x.fillRect(400+X*10+S(t+X+Y)*C(t)*9,400+Y*10,10,10));
</code></pre>

And [this][9] specular highlight:

[9]: https://www.dwitter.net/d/7283

<pre class="dweet play"><code class="language-js">c.width|=0;for(j=n=10;--j;)for(i=100;i--;X=i%5+j*n+S(t)*30,Y=i/5|0,x.fillStyle=R(r=255-(X-50)**2-Y**2,r,r),x.fillRect(400+X*n,400+Y*n,n,n));
</code></pre>

### XOR

We can also play with different [compositing operations][10]. [Here][11], I'm
overlaying a bunch of rectangles in XOR mode to let them alternate between black
and white to create the default bars. You have to wait a bit to see the reveal:

[10]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
[11]: https://www.dwitter.net/d/22551

<pre class="dweet play"><code class="language-js">c.width=1920
x.globalCompositeOperation='xor'
for(i=18;i--;)x.fillRect(400+i*50+S(t)*300,400+i*S(t/9)**9*200,2e3,200)
</code></pre>

### Unicode

[Here'a][12] silly one with printing text "▮▮▮▮▮▮▮▮▮" instead of rendering
rectangles. The scaling makes the characters stretched out to create the bars:

[12]: https://www.dwitter.net/d/22874

<pre class="dweet play"><code class="language-js">c.width|=0
x.scale(.5,1)
x.font='8cm"'
x.fillText('▮▮▮▮▮▮▮▮▮',800+S(t)*600,600)
</code></pre>

Note the `'8cm"'` as the font value. The `"` character creates a word boundary
after the size unit "cm". While `"` is not a valid font name, browsers are
forgiving of bad syntax and names. This browser forgiveness is a goldmine
for code golfers - we can use `"` instead of valid font names like `Arial` or
`sans-serif`, saving precious characters.

### Thematic End

And here's a [thematic end][13] to this post. Not quite the default bars, but
they're hidden in there:

[13]: https://www.dwitter.net/d/29243

<pre class="dweet play"><code class="language-js">c.width|=0
for(i=17;i--;)for(j=5;j--;)[2057,1,32897,0,2057][j]+87380&1&lt;&lt;i&&x.fillRect(1200-i*50+S(t)*300,400+j*40,50,40)
</code></pre>

A Merry Christmas and a Happy New Year!
