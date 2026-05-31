---
title: Node.js Streams — A Practical Introduction
description: Understanding readable, writable, and transform streams in Node.js with hands-on examples.
date: "2026-03-16"
tags: javascript, node.js
---

# Node.js Streams — A Practical Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo.

## Why streams?

Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.

## Readable streams

Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.

```js
import { createReadStream } from 'node:fs';

const stream = createReadStream('large-file.txt', { encoding: 'utf-8' });

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

## Transform streams

Nullam varius, turpis molestie dictum semper, est augue tincidunt diam, nec accumsan velit quam vel metus. Phasellus dolor arcu, gravida nec, placerat at, blandit ut, augue.

> Streams process data chunk by chunk — ideal for large files that shouldn't be loaded into memory all at once.
