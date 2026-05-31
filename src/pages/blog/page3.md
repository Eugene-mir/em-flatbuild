---
title: BEM Methodology in Practice
description: A practical guide to writing maintainable CSS with BEM naming conventions and SCSS.
date: "2026-02-16"
tags: css, bem, scss
---

# BEM Methodology in Practice

BEM (Block, Element, Modifier) keeps your CSS predictable and scalable. Here's how we use it in em-Flatbuild projects.

## Naming convention

```
block
block__element
block--modifier
block__element--modifier
```

Words within a name are separated by hyphens:

```css
.product-card { }
.product-card__title { }
.product-card__title--highlighted { }
```

## SCSS structure

One BEM block per file. Use nesting for elements and modifiers:

```scss
.product-card {
  padding: 24px;
  border-radius: 8px;

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__price {
    color: $color-primary;
  }

  &--featured {
    border: 2px solid $color-primary;
  }
}
```

## Common mistakes

1. **Nested elements** — `block__element__sub` is wrong, flatten to `block__sub`
2. **Styling via IDs** — always use classes
3. **Deep selectors** — keep max 3-4 levels
4. **Using `!important`** — fix specificity instead

## Specificity target

Aim for `0 1 0` (single class) wherever possible. The Stylelint config enforces BEM naming automatically.

> Consistent naming is the foundation of maintainable CSS at scale.
