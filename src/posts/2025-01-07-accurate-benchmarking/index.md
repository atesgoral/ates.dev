---
layout: layouts/post
title: 'Accurate Benchmarking'
description: 'A technique for discounting loop overhead when benchmarking code'
image: i/dweet-bitmap.png
date: 2025-01-12
draft: true
---

I'll share a mathematical approach to discounting the loop overhead when looping
over a piece of code in order to measure how long it takes (as compared to some
alternative piece of code).

Maybe this is well-known, and possible there are better ways. But it is a method
I came up with and used in the past.

### The premise

We have a piece of code, `method1()`, that we want to benchmark to see how fast
it is as compared to `method2()`.

Since computers are very fast, running something once isn't a viable way to
measure how long it takes to run. We therefore run it many times in a loop and
measure the total amount of time it takes.

### A standard, qualitative approach

A straightforward way to set up a `benchmark()` utility could look something
like this:

```js
function benchmarkTotal(fn, iterations) {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const end = performance.now();
  const total = end - start;

  return total;
}

// Usage:
const elapsed1 = benchmarkTotal(method1, 1_000_000);
const elapsed2 = benchmarkTotal(method2, 1_000_000);
```

This is good enough, when our purpose is to compare `method1` against `method2`,
to qualitatively see which one is faster.

* `method1` is faster than `method2` if `elapsed1` < `elapsed2`
* `method1` is slower than `method2` if `elapsed1` > `elapsed2`

### Factor in the loop overhead for quantitative comparisons

To get a quantitative "X is p% faster than Y", we should factor in the loop
overhead. If `method1` and `method2` are both "slow" methods that take many
computational cycles to run, the tiny overhead of the `for` loop will be
insignificant. The faster the methods we're comparing are, the more the loop
overhead will become significant.

Let's say the total time it takes `method1` to run <math><mi>n</mi></math>
number of times is <math><msub><mi>t</mi><mn>1</mn></msub></math> and the total
time of the loop overhead of the <math><mi>n</mi></math> iterations of the `for`
loop is <math><mi>e</mi></math>. And `method2` takes
<math><msub><mi>t</mi><mn>2</mn></msub></math>.

Then:

<math>
  <mtable>
    <mtr>
      <mtd>
        <msub><mi>elapsed</mi><mn>1</mn></msub>
      </mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub><mi>t</mi><mn>1</mn></msub>
        <mo>+</mo>
        <mi>e</mi>
      </mtd>
    </mtr>
    <mtr>
      <mtd>
        <msub><mi>elapsed</mi><mn>2</mn></msub>
      </mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub><mi>t</mi><mn>2</mn></msub>
        <mo>+</mo>
        <mi>e</mi>
      </mtd>
    </mtr>
  </mtable>
</math>

The only mathematically accurate quantitative result we can derive from the
above is:

<math>
  <mtable>
    <mtr>
      <mtd>
        <mi>delta</mi>
      </mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub><mi>elapsed</mi><mn>1</mn></msub>
        <mo>-</mo>
        <msub><mi>elapsed</mi><mn>2</mn></msub>
      </mtd>
    </mtr>
    <mtr>
      <mtd></mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <mo>(</mo>
        <msub>
          <mi>t</mi>
          <mn>1</mn>
        </msub>
        <mo>+</mo>
        <mi>e</mi>
        <mo>)</mo>
        <mo>-</mo>
        <mo>(</mo>
        <msub>
          <mi>t</mi>
          <mn>2</mn>
        </msub>
        <mo>+</mo>
        <mi>e</mi>
        <mo>)</mo>
      </mtd>
    </mtr>
    <mtr>
      <mtd></mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub>
          <mi>t</mi>
          <mn>1</mn>
        </msub>
        <mo>+</mo>
        <mi>e</mi>
        <mo>-</mo>
        <msub>
          <mi>t</mi>
          <mn>2</mn>
        </msub>
        <mo>-</mo>
        <mi>e</mi>
      </mtd>
    </mtr>
    <mtr>
      <mtd></mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub>
          <mi>t</mi>
          <mn>1</mn>
        </msub>
        <mo>-</mo>
        <msub>
          <mi>t</mi>
          <mn>2</mn>
        </msub>
      </mtd>
    </mtr>
  </mtable>
</math>

We can say that the difference between `method1` and `method2` running
<math><mi>n</mi></math> times is <math><mi>delta</mi></math> milliseconds.

We can also calculate a percentage, `p = delta / elapsed1 * 100`, and say:

* `method2` is `p`% faster than `method1` if `p` is negative
* `method2` is `p`% slower than `method1` if `p` is positive

We can also say the difference between the run time of a single call is
`delta / n`, but what if we want to measure a single call to either function? We
haven't isolated <math><msub><mi>t</mi><mn>1</mn></msub></math> or
<math><msub><mi>t</mi><mn>2</mn></msub></math> yet. We just know their
difference.

### Timing a single call

Here comes the punchline of this post.

If we want to loop <math><mi>n</mi></math> times, we can still loop a total of
<math><mi>n</mi></math> times by looping a bit, and then a bit more. Let's
partition the loop by first calling the method
<math><mfrac><mn>1</mn><mn>3</mn></mfrac></math> times and then calling it twice
<math><mfrac><mn>1</mn><mn>3</mn></mfrac></math> times, to still end up calling
it a total of <math><mi>n</mi></math> times:

```js
function benchmarkSingle(fn, iterations) {
  const oneThird = iterations / 3;

  const start1 = performance.now();

  for (let i = 0; i < oneThird; i++) {
    fn();
  }

  const end1 = performance.now();
  const elapsed1 = end1 - start1;

  const start2 = performance.now();

  for (let i = 0; i < oneThird; i++) {
    fn();
    fn();
  }

  const end2 = performance.now();
  const elapsed2 = end2 - start2;

  const partition = elapsed2 - elapsed1;
  const single = partition / oneThird;

  return single;
}

// Usage:
const elapsed = benchmarkSingle(method, 1_000_000);
```

Let's break it down:

If the time it takes for <math><mfrac><mi>n</mi><mn>3</mn></mfrac></math> calls
to `method` is <math><msub><mi>t</mi><mi>p</mi></msub></math> and the loop
overhead of <math><mfrac><mi>n</mi><mn>3</mn></mfrac></math> iterations is
<math><msub><mi>e</mi><mi>p</mi></msub></math>, then the two loops we have the
following durations:

<math>
  <mtable>
    <mtr>
      <mtd>
        <msub><mi>elapsed</mi><mn>1</mn></msub>
      </mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub><mi>t</mi><mi>p</mi></msub>
        <mo>+</mo>
        <msub><mi>e</mi><mi>p</mi></msub>
      </mtd>
    </mtr>
    <mtr>
      <mtd>
        <msub><mi>elapsed</mi><mn>2</mn></msub>
      </mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <mn>2</mn><msub><mi>t</mi><mi>p</mi></msub>
        <mo>+</mo>
        <msub><mi>e</mi><mi>p</mi></msub>
      </mtd>
    </mtr>
  </mtable>
</math>

Then their difference is:

<math>
  <mtable>
    <mtr>
      <mtd>
        <mi>delta</mi>
      </mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub>
          <mi>elapsed</mi>
          <mn>2</mn>
        </msub>
        <mo>-</mo>
        <msub>
          <mi>elapsed</mi>
          <mn>1</mn>
        </msub>
      </mtd>
    </mtr>
    <mtr>
      <mtd></mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <mo>(</mo>
        <mn>2</mn>
        <msub><mi>t</mi><mi>p</mi></msub>
        <mo>+</mo>
        <msub><mi>e</mi><mi>p</mi></msub>
        <mo>)</mo>
        <mo>-</mo>
        <mo>(</mo>
        <msub><mi>t</mi><mi>p</mi></msub>
        <mo>+</mo>
        <msub><mi>e</mi><mi>p</mi></msub>
        <mo>)</mo>
      </mtd>
    </mtr>
    <mtr>
      <mtd></mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <mn>2</mn>
        <msub><mi>t</mi><mi>p</mi></msub>
        <mo>+</mo>
        <msub><mi>e</mi><mi>p</mi></msub>
        <mo>-</mo>
        <msub><mi>t</mi><mi>p</mi></msub>
        <mo>-</mo>
        <msub><mi>e</mi><mi>p</mi></msub>
      </mtd>
    </mtr>
    <mtr>
      <mtd></mtd>
      <mtd>
        <mo>=</mo>
      </mtd>
      <mtd>
        <msub><mi>t</mi><mi>p</mi></msub>
      </mtd>
    </mtr>
  </mtable>
</math>

We have gotten rid of the loop overhead and isolated
<math><msub><mi>t</mi><mi>p</mi></msub></math>! Then we can accurately compute
the time it takes for a single call to the method by diving
<math><msub><mi>t</mi><mi>p</mi></msub></math> by
<math><mfrac><mi>n</mi><mn>3</mn></mfrac></math>:

<math>
  <mi>single</mi>
  <mo>=</mo>
  <mfrac>
    <mrow>
      <mn>3</mn>
      <msub><mi>t</mi><mi>p</mi></msub>
    </mrow>
    <mi>n</mi>
  </mfrac>
</math>

### Sanity check

Let's use each of `benchmarkTotal` and `benchmarkSingle` 100 times over 10
million iterations of `Math.atan2()` over random numbers and compare results:

```js
// The subject
const fn = () => Math.atan2(Math.random(), Math.random());
const iterations = 10_000_000;

function average(measurer, samples = 100) {
  let total = 0;

  for (let i = 0; i < samples; i++) {
    total += measurer();
  }

  return total / samples;
}

const totalWithOverhead = average(() => benchmarkTotal(fn, iterations));
const single = average(() => benchmarkSingle(fn, iterations));
const total = single * iterations;
```

After a bit of patience:

| technique | variable | value |
| - | - | - |
| simple | `totalWithOverhead` | `130.08399999946357` |
| improved | `total` | `127.3620000086725` |

Conclusion:

It takes `Math.atan2()` ~127ms to run 10 million times over random
numbers. With the simple approach of running a single loop for the measurement,
there is a ~3ms loop overhead, or 2% of the measurement from the simple
technique.

Does a 2% loop overhead really matter? `¯\_(ツ)_/¯`
