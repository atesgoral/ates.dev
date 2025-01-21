---
layout: layouts/post
title: 'A Brain Teaser and a Digression into XOR'
description: ''
image: i/missing-item-with-xor.png
alt:
date: 2024-12-13
draft: true
---

Suppose there’s a 100-item array made up of integers 0 through 99 (inclusive). One item is randomly taken out of the array. If you’re only given the resultant 99-item array, how would you find the the number that was taken out? Assume the array is not sorted.

Perhaps due to the “not sorted” qualifier acting as a red herring, one might be inclined to sorting the array as a first step:

Sort the array, and then walk through it once, looking at the difference between subsequent items. The missing number can be found at the point the difference is not 1.

This is a valid algorithm, but would be unnecessarily computationally expensive due to the sorting that is involved. What about a solution that would only require iterating through the array once?

What follows is just one of several optimal answers. Afterwards, I'll show an alternative, more “hacky” answer — and it is that answer that prompted me to write this short article in the first place.

If you add all the items in the 99-item array, and if you know the expected sum of all integers between 0 and 99, you can find the missing number by subtracting the sum of the items in the array from this expected sum.

The sum of integers 0..n ] can be calculated using [the following formula:

```js
n \* (n + 1) / 2
```

So, for integers [0..99 ] we know the sum to be:

```js
99 \* (99 + 1) / 2 === 4950
```

By the way, here’s how an array with a missing number can be prepared (not part of the question or answer, but you can use this setup to test different answers):

```js
const n = 99;

// Will hold all numbers [0..99 ]
const all = [ ];

for (let i = 0; i Math.random() - 0.5);

// Get a clone not to mess with the original array
const partial = all.slice(0);

// Remove a random item
partial.splice(partial.length \* Math.random() | 0, 1);
```

Then, a conventional implementation for our answer would be:

```js
const expectedSum = 99 \* (99 + 1) / 2;

let partialSum = 0;

for (let i = 0; i s + n);
```

And if we just hard-code the known sum, we get this terse one-liner that directly evaluates to the missing number:

```js
const missingNumber = 4950 - partial.reduce((s, n) => s + n);
```

We now have the answer in missingNumber. For all intents and purposes, this is a correct answer and we’re done.

In the above answer, we used summation to find the missing number directly by subtracting the partial sum from the expected sum. We are essentially using a known checksum to find a discrepancy (e.g. a missing item) in a set of values.

Summation is not the only operation that comes into play at computing checksums. A useful operator that pops up in checksum computations as well as cryptography is XOR (exclusive or.)

Another way we can directly find the missing number is by XORing the XOR of all items in the partial array with the known XOR of all integers [0..99 ]. The resulting implementation simply looks a lot more interesting. We’ll get to it in a bit.

First, a quick recap of what XOR (^) does. At the bit level:

| a   | b   | a ^ b |
| --- | --- | ----- |
| 0   | 0   | 0     |
| 0   | 1   | 1     |
| 1   | 0   | 1     |
| 1   | 1   | 0     |

Beyond single bits, XORing any two numbers means aligning their bits by their least significant bits and XORing each aligned bit pair. Let’s take `3 ^ 5` as an example. `3` in binary is `011` and `5` in binary is `101`:

```
  011
^ 101
-----
  110
```

Therefore the result of `3 ^ 5` in binary is `110`. Or in decimal, `6`.

XOR has the following properties of interest to us:

1. `0` is the identity element: `a ^ 0 === a`
2. Each number is its own inverse element: `a ^ a === 0`
3. Associativity: `(a ^ b) ^ c === a ^ (b ^ c)`

From the above, it follows that you can restore the value of a number `a` by XORing it twice with any number `b`. Suppose `c` is obtained by:

```js
c = a ^ b;
```

Then what is the result of XORing `c` again with `b`? In 4 steps:

1. Substitution: `c ^ b === (a ^ b) ^ b`
2. Associativity: `c ^ b === a ^ (b ^ b)`
3. Inverse element: `c ^ b === a ^ 0`
4. Identity: `c ^ b === a`

We get the original value, `a`.

From this we can intuit the following: Given a number `a`, if we first XOR it with 99 other numbers and then XOR the result with the same 99 numbers, we should get back `a`.

We can therefore find the missing number in the question by:

1. Computing or hard-coding the XOR of all 100 numbers `[0..99]`
2. Computing the XOR of all 99 numbers given to us in the partial array
3. XORing the two results from above to directly find the missing number

So, let’s compute the XOR of all numbers `[0..99]` in order to hard-code it in our answer. But let’s do this while watching the intermediate values of `xor`, as binary:

```js
function binary(n) {
  return n.toString(2).padStart(7, '0');
}

let xor = 0; // 0 is the identity for XOR

for (let n = 0; n < 100; n++) {
  const newXor = xor ^ n;
  console.log(`${binary(xor)} ^ ${binary(n)} === ${binary(newXor)}`);
  xor = newXor;
}
```

Using XOR in this context is nothing technically groundbreaking. It’s just serendipitous that the XOR of numbers [0..99 ] turns out to be 0, which makes the second answer look a lot more interesting, and creates a good excuse to write a digression into XOR like this.

Bonus

I dabble in JavaScript code golfing and hang out at the jsgolf Slack team. I asked this question there to see to what extremes the golfing community would take the already-very-terse a.reduce((x,n)=>x^n) (called the array a and removed the spaces) answer.

Here’s the result:

eval(a.join ^ )

Credits for the above answer go to veubeke and corruptio.

P.S. Thanks to Leigh Bryant for copy-editing an earlier version of this article.
