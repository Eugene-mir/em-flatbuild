---
title: JavaScript Module Patterns
description: Exploring the module pattern, ES modules, and how to avoid polluting the global scope.
date: "2026-02-25"
tags: javascript, modules
---

# JavaScript Module Patterns

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.

## The old way — IIFEs

Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.

## ES Modules

Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos.

## Private fields with `#`

Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.

```js
class Counter {
  #count = 0;

  increment() {
    this.#count++;
  }

  get value() {
    return this.#count;
  }
}
```

> Private class fields are natively supported in all modern browsers since 2021.
