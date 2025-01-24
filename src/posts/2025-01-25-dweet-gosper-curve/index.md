---
layout: layouts/post
title: 'Gosper Curve'
description: 'Gosper curve'
image: i/gosper-curve.webp
alt: 'Gosper curve'
date: 2025-01-25
libs:
  - render
  - dweet
draft: true
---

import turtle

def gosper_curve(order: int, size: int, is_A: bool = True) -> None:
"""Draw the Gosper curve."""
if order == 0:
turtle.forward(size)
return
for op in "A-B--B+A++AA+B-" if is_A else "+A-BB--B-A++A+B":
gosper_op_map[op](order - 1, size)

gosper_op_map = {
"A": lambda o, size: gosper_curve(o, size, True),
"B": lambda o, size: gosper_curve(o, size, False),
"-": lambda o, size: turtle.right(60),
"+": lambda o, size: turtle.left(60),
}
size = 10
order = 3
gosper_curve(order, size)

<pre class="dweet play"><code class="language-js">c.width=960
x.moveTo(X=650,Y=85)
g=(o,b)=>o?[...b?"301221121033032":"012112303300321"].map(c=>(c*=1)&1?T+=c-2:g(o-1,c&2)):x.lineTo(X+=9*C(a=T*1.047),Y+=9*S(a))
g(T=4)
x.stroke();
</code></pre>

<pre class="dweet play"><code class="language-js">eval(unescape(escape`󨼮󭽩󩍴󪌽󞜶󜌻󮌮󫝯󭭥󥍯󚍘󟜶󝜰󛍙󟜸󝜩󞽧󟜨󫼬󨬩󟜾󫼿󦼮󛬮󨬿󘬳󜌱󜬲󜜱󜬱󜌳󜼰󜼲󘬺󘬰󜜲󜜱󜬳󜌳󜼰󜌳󜬱󘭝󛭭󨝰󚍣󟜾󚍣󚬽󜜩󙬱󟽔󚼽󨼭󜬺󩼨󫼭󜜬󨼦󜬩󚜺󮌮󫍩󫭥󥍯󚍘󚼽󞜪󠼨󨜽󥌪󜜮󜌴󝼩󛍙󚼽󞜪󤼨󨜩󚜻󩼨󥌽󝌩󞽸󛭳󭍲󫽫󩜨󚜻`.replace(/u../g,'')))
</code></pre>
