---
title: "Complex Image Mapping"
date: 2023-05-17
permalink: /posts/2022/08/Complex-Image-Mapping/
tags:
  - Math
  - Computer Science
  - Complex Numbers
  - Algebra
---

In this blog post I will be talking about a piece of software I made for my final project in my Senior year highschool art class.

We were given a very open prompt and where pretty much allowed to do anything we wanted. So I decided to create a project idea that I had been thinking would look cool for a while.

The project involves using complex valued functions to warp images in interesting ways.

# How it works

We will start with a complex value function specified by the user f(z). And then for each pixel in a given image located at (x,y) we will interpret its location as a complex number x + yi. Then we run this location through f giving us the location/complex number f(x + yi) which will then be the final location we will move the initial pixel to.

After doing this with every pixel the image will be warped in a way according to the complex function given. From this different properties of the function can be seen in how it warps the image. Continuous functions will smoothly stretch and warp the image. where discontinuous functions will show sharp discontinuities in the output image.

# Find and try it out

All the code, how to run it, and demos are on my [github post](https://github.com/patrickDugan04/complex-image-mapping)
