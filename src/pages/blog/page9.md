---
title: Image Optimization for the Web
description: Techniques for serving the right image at the right size without sacrificing visual quality.
date: "2026-03-07"
tags: performance, images
---

# Image Optimization for the Web

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor.

## Modern formats — WebP and AVIF

Pellentesque nisl felis, vulputate quis dignissim non, auctor vitae lectus. Proin diam justo, scelerisque non eros. Nullam justo enim, consectetuer nec, ullamcorper ac, vestibulum in, elit.

## Responsive images with `srcset`

```html
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="Hero image"
  loading="lazy"
>
```

## Lazy loading

Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi.

> Add `loading="lazy"` to every below-the-fold image — it's a one-attribute performance win.
