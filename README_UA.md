# em-Flatbuild

Сучасний генератор статичних сайтів для швидкої веб-розробки.
Натхненний [Panini](https://github.com/foundation/panini), але автономний - без залежності від Gulp.

**Handlebars** шаблонізація &bull; **SCSS** компіляція &bull; **Markdown** сторінки &bull; **Live reload** dev server

---

## Зміст

- [Швидкий старт](#швидкий-старт)
- [Структура проєкту](#структура-проєкту)
- [Сторінки](#сторінки)
- [Layouts](#layouts)
- [Includes](#includes)
- [Дані](#дані)
- [Пагінація](#пагінація)
- [Markdown](#markdown)
- [Helpers](#helpers)
- [SCSS](#scss)
- [Assets](#assets)
- [Лінтери](#лінтери)
- [Конфігурація](#конфігурація)
- [CLI довідка](#cli-довідка)
- [Програмний API](#програмний-api)
- [Ліцензія](#ліцензія)

---

## Швидкий старт

```bash
# Запустити dev server з live reload
npx em-flatbuild dev

# Зібрати для production
npx em-flatbuild build --minify
```

Розмістіть файли проєкту в директорії `src/`, потім запустіть `dev` і відкрийте [http://localhost:3000](http://localhost:3000).

---

## Структура проєкту

```
my-project/
├── src/
│   ├── pages/          # .html / .hbs / .md сторінки з front matter
│   ├── layouts/        # Шаблони-обгортки (default.html обов'язковий)
│   ├── includes/       # Перевикористовувані HTML-фрагменти
│   ├── helpers/        # Кастомні Handlebars helpers (.js)
│   ├── data/           # Глобальні дані - JSON / YAML / JS
│   ├── assets/         # Статичні файли (JS, зображення, шрифти)
│   └── scss/           # SCSS стилі
├── dist/               # Результат збірки (генерується)
└── em-flatbuild.config.js # Конфігурація (необов'язково)
```

---

## Сторінки

Сторінки розміщуються в `src/pages/` і підтримують розширення `.html`, `.hbs`, `.handlebars` та `.md`. Кожна сторінка може містити YAML **front matter** на початку:

```html
---
title: Про нас
layout: default
customVar: hello
---

<h1>{{title}}</h1>
<p>{{customVar}}</p>
```

Змінні з front matter доступні як контекст Handlebars всередині сторінки та її layout.

### Пріоритет вибору layout

| Пріоритет | Джерело | Приклад |
|-----------|---------|---------|
| 1 (найвищий) | Ключ `layout` у front matter | `layout: blog-post` |
| 2 | `pageLayouts` у конфігурації | `{ 'blog': 'blog' }` |
| 3 (за замовчуванням) | Використовується `default` | `src/layouts/default.html` |

Вкажіть `layout: none`, щоб відрендерити сторінку без layout-обгортки.

### Об'єкт `page`

Кожен шаблон сторінки отримує об'єкт `page` з метаданими:

```handlebars
{{page.name}}   <!-- ім'я файлу без розширення: "about" -->
{{page.path}}   <!-- відносний шлях: "about.html" або "blog/post.html" -->
{{page.title}}  <!-- з front matter -->
```

---

## Layouts

Layouts визначають зовнішню HTML-оболонку, яка обгортає вміст сторінки. Розміщуються в `src/layouts/`.

Використовуйте спеціальний partial `{{> body}}` для вставки вмісту сторінки:

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{#if title}}{{title}} | {{/if}}{{site.name}}</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  {{> header}}

  <main>
    {{> body}}
  </main>

  {{> footer}}
  <script src="/assets/js/main.js"></script>
</body>
</html>
```

Layout з іменем `default.html` є **обов'язковим** - це fallback для всіх сторінок.

Створюйте додаткові layouts (наприклад, `blog-post.html`, `landing.html`) і посилайтесь на них у front matter.

---

## Includes

Перевикористовувані HTML-фрагменти в `src/includes/`. Будь-який `.html` або `.hbs` файл автоматично реєструється як Handlebars partial.

```
src/includes/
├── header.html          →  {{> header}}
├── footer.html          →  {{> footer}}
└── cards/
    └── product.html     →  {{> cards/product}}
```

Вкладені файли використовують імена через слеш. Includes отримують той самий контекст даних, що й шаблон, який їх викликає.

---

## Дані

Зовнішні файли даних у `src/data/` стають **глобальними змінними шаблонів**, доступними в кожній сторінці, layout та include.

| Формат | Приклад файлу | Доступ у шаблоні |
|--------|--------------|------------------|
| JSON | `site.json` | `{{site.name}}` |
| YAML | `team.yml` | `{{#each team}}...{{/each}}` |
| JS | `build.js` | `{{build.date}}` |

**JSON приклад** - `src/data/site.json`:

```json
{
  "name": "My Site",
  "description": "Сайт, зібраний з em-Flatbuild",
  "url": "https://example.com"
}
```

**YAML приклад** - `src/data/team.yml`:

```yaml
- name: Аліса
  role: Розробник
- name: Борис
  role: Дизайнер
```

**JS приклад** - `src/data/build.js` (використовуйте ESM `export default`):

```js
export default {
  date: new Date().toISOString(),
  env: process.env.NODE_ENV || 'development',
};
```

---

## Пагінація

Будь-яку сторінку-список можна розбити на кілька статичних HTML-файлів, додавши два ключі у front matter: `paginate` і `perPage`.

```html
---
title: Блог
layout: blogs
paginate: blogs
perPage: 10
---
```

| Ключ | Тип | Опис |
|------|-----|------|
| `paginate` | `string` | Ім'я змінної даних для пагінації (має бути масивом) |
| `perPage` | `number` | Кількість елементів на сторінку. За замовчуванням `10` |

### Структура виводу

Для `src/pages/blogs.html` з 25 елементами і `perPage: 10` збірка генерує:

```
dist/
├── blogs.html        ← сторінка 1
├── blogs/
│   ├── 2.html        ← сторінка 2
│   └── 3.html        ← сторінка 3
```

### Об'єкт `pagination`

Кожна пронумерована сторінка отримує об'єкт `pagination` у контексті шаблону:

| Властивість | Тип | Опис |
|-------------|-----|------|
| `pagination.current` | `number` | Номер поточної сторінки (починаючи з 1) |
| `pagination.total` | `number` | Загальна кількість елементів по всіх сторінках |
| `pagination.totalPages` | `number` | Загальна кількість сторінок |
| `pagination.perPage` | `number` | Кількість елементів на сторінку |
| `pagination.prev` | `string \| null` | URL попередньої сторінки або `null` на першій сторінці |
| `pagination.next` | `string \| null` | URL наступної сторінки або `null` на останній сторінці |

Змінна даних (`blogs` у прикладі) автоматично замінюється **зрізом поточної сторінки** - ручне нарізання не потрібне.

### Приклад UI пагінації

```html
---
title: Блог
layout: blogs
paginate: blogs
perPage: 10
---

<div class="blogs__grid">
  {{#each blogs}}
    <a class="blog-card" href="{{this.url}}">
      <h2 class="blog-card__title">{{this.title}}</h2>
      <time class="blog-card__date" datetime="{{this.date}}">{{this.date}}</time>
    </a>
  {{/each}}
</div>

{{#gt pagination.totalPages 1}}
<nav class="pagination" aria-label="Blog navigation">
  {{#if pagination.prev}}
    <a class="pagination__link pagination__link--prev" href="{{pagination.prev}}">← Назад</a>
  {{/if}}
  <span class="pagination__info">Сторінка {{pagination.current}} з {{pagination.totalPages}}</span>
  {{#if pagination.next}}
    <a class="pagination__link pagination__link--next" href="{{pagination.next}}">Далі →</a>
  {{/if}}
</nav>
{{/gt}}
```

### Структура URL

| Сторінка | Файл виводу | URL |
|----------|-------------|-----|
| 1 | `dist/blogs.html` | `/blogs.html` |
| 2 | `dist/blogs/2.html` | `/blogs/2.html` |
| 3 | `dist/blogs/3.html` | `/blogs/3.html` |

Перша сторінка завжди зберігає оригінальне ім'я файлу, щоб існуючі посилання залишалися валідними.

> Пагінація є **універсальною** - вона працює з будь-яким масивом даних, не лише з блогами. Додайте `paginate: products` на сторінку списку товарів - принцип той самий.

---

## Markdown

### Markdown-сторінки

Файли `.md` у `src/pages/` є повноцінними сторінками. Handlebars-вирази обробляються **першими**, потім результат конвертується в HTML через [marked](https://github.com/markedjs/marked) і обгортається layout.

```markdown
---
title: Блог
layout: blog-post
---

# Ласкаво просимо до {{site.name}}

Ця сторінка написана у **Markdown**.

- Handlebars-вирази працюють всередині `.md` файлів
- Повна підтримка markdown-синтаксису
- Автоматичне обгортання layout

> Цитати, блоки коду, таблиці - все працює.
```

Конвеєр обробки: **Front matter → Handlebars → Markdown → HTML → Layout → Файл**.

### Markdown helper

Використовуйте helper `{{markdown}}` для рендерингу markdown **всередині HTML-сторінок**:

**Блоковий режим** - вбудований markdown-контент:

```handlebars
{{#markdown}}
## Цей заголовок - **markdown**

І цей параграф з [посиланням](https://example.com) теж.
{{/markdown}}
```

**Інлайн-режим** - рендеринг змінної, що містить markdown:

```handlebars
{{markdown product.description}}
```

---

## Helpers

### Кастомні helpers

Розміщуйте `.js` файли в `src/helpers/`. Кожен файл повинен експортувати функцію (ESM `export default`). Ім'я файлу стає іменем helper.

```js
// src/helpers/uppercase.js
export default function (str) {
  if (typeof str !== 'string') return '';
  return str.toUpperCase();
};
```

Використання:

```handlebars
{{uppercase "hello"}}  →  HELLO
```

Більш просунутий приклад:

```js
// src/helpers/truncate.js
export default function (str, len) {
  if (typeof str !== 'string') return '';
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
};
```

```handlebars
{{truncate description 100}}
```

### Вбудовані helpers

| Helper | Тип | Використання | Опис |
|--------|-----|-------------|------|
| `eq` | Block | `{{#eq a b}}так{{else}}ні{{/eq}}` | Перевірка на рівність |
| `neq` | Block | `{{#neq a b}}...{{/neq}}` | Не рівне |
| `gt` | Block | `{{#gt a b}}...{{/gt}}` | Більше ніж |
| `lt` | Block | `{{#lt a b}}...{{/lt}}` | Менше ніж |
| `and` | Block | `{{#and a b}}...{{/and}}` | Обидва truthy |
| `or` | Block | `{{#or a b}}...{{/or}}` | Хоча б один truthy |
| `repeat` | Block | `{{#repeat 3}}<div>{{@index}}</div>{{/repeat}}` | Повторити N разів |
| `markdown` | Both | `{{#markdown}}**жирний**{{/markdown}}` або `{{markdown var}}` | Markdown → HTML |
| `icon` | Inline | `{{icon "star"}}` | Інлайн SVG іконка |
| `join` | Inline | `{{join tags ", "}}` | Масив у рядок |
| `json` | Inline | `{{json data}}` | Форматований JSON |
| `year` | Inline | `{{year}}` | Поточний рік (напр. `2026`) |

---

## Іконки

SVG іконки з `src/assets/icons/` можна вставляти безпосередньо в HTML через helper `{{icon}}`. SVG код інжектиться як чистий HTML з семантичними CSS класами - без `<img>` тегів, без зайвих HTTP-запитів.

### Використання

```handlebars
{{icon "logo"}}
```

Читає `src/assets/icons/logo.svg` і виводить SVG розмітку з `class="icon icon-logo"`:

```html
<svg class="icon icon-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="..."/>
</svg>
```

### Опції

**Додаткові класи:**

```handlebars
{{icon "arrow" class="icon--large"}}
```

```html
<svg class="icon icon-arrow icon--large" ...>...</svg>
```

**Кастомний розмір** (встановлює `width` і `height`):

```handlebars
{{icon "star" size="24"}}
```

```html
<svg class="icon icon-star" width="24" height="24" ...>...</svg>
```

**Комбіновано:**

```handlebars
{{icon "menu" class="header__icon" size="20"}}
```

### Структура файлів

```
src/assets/icons/
├── logo.svg       →  {{icon "logo"}}
├── arrow.svg      →  {{icon "arrow"}}
├── menu.svg       →  {{icon "menu"}}
└── search.svg     →  {{icon "search"}}
```

Іконки також копіюються в `dist/assets/icons/` як статичні файли, тому залишаються доступними через URL за потреби.

### Стилізація

Всі іконки отримують однакові імена класів для зручної CSS стилізації:

```css
.icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
}

.icon-logo {
  width: 32px;
  height: 32px;
}
```

---

## SCSS

SCSS файли в `src/scss/` компілюються в CSS автоматично. Результат потрапляє в `dist/css/`.

Файли, що починаються з `_` (partials), **не** компілюються як самостійні - вони призначені для `@import`.

```
src/scss/
├── main.scss          →  dist/css/main.css
├── _variables.scss    →  тільки @import
└── _reset.scss        →  тільки @import
```

Використовуйте прапорець `--minify` при збірці для стисненого виводу:

```bash
em-flatbuild build --minify
```

Source maps генеруються в режимі розробки (без `--minify`).

---

## Assets

Статичні файли в `src/assets/` копіюються як є в `dist/assets/`, зберігаючи структуру директорій.

```
src/assets/
├── js/
│   └── main.js        →  dist/assets/js/main.js
├── images/
│   └── logo.svg       →  dist/assets/images/logo.svg
└── fonts/
    └── inter.woff2    →  dist/assets/fonts/inter.woff2
```

Посилання в шаблонах:

```html
<script src="/assets/js/main.js"></script>
<img src="/assets/images/logo.svg" alt="Лого">
```

---

## Лінтери

Проєкт включає конфіги лінтерів, налаштовані під BEM методологію.

### Конфіги

| Файл | Інструмент | Призначення |
|------|-----------|-------------|
| `eslint.config.js` | [ESLint](https://eslint.org/) | Лінтинг JavaScript (flat config, ESM) |
| `.stylelintrc.json` | [Stylelint](https://stylelint.io/) | Лінтинг SCSS + BEM іменування класів |
| `.prettierrc.json` | [Prettier](https://prettier.io/) | Форматування коду (JS, SCSS, HTML, JSON, MD) |
| `.editorconfig` | [EditorConfig](https://editorconfig.org/) | Єдині налаштування редактора |

### Stylelint - BEM правила

Конфіг Stylelint валідує BEM іменування через `selector-class-pattern` regex:

```
block
block--modifier
block__element
block__element--modifier
```

Валідні приклади: `header`, `header__nav`, `header__link--active`, `product-card__title`.

Додаткові SCSS правила:

| Правило | Значення | Що контролює |
|---------|----------|-------------|
| `selector-max-id` | `0` | Заборона ID в селекторах |
| `selector-max-compound-selectors` | `4` | Макс. 4 рівні складених селекторів |
| `max-nesting-depth` | `4` | Макс. вкладеність SCSS |
| `declaration-no-important` | `true` | Заборона `!important` |
| `color-named` | `never` | Тільки hex/rgb, не `red`/`blue` |
| `no-descending-specificity` | `true` | Правильний порядок специфічності |

### ESLint - JS правила

Flat config з окремими середовищами:

- **Browser JS** (`src/assets/**/*.js`) - `console` як warning, `prefer-const`, `eqeqeq`
- **Helpers** (`src/helpers/**/*.js`) - Node.js ESM globals

### npm scripts

Спочатку встановіть dev-залежності у вашому проєкті:

```bash
npm install --save-dev eslint @eslint/js globals stylelint stylelint-config-standard-scss prettier
```

Потім додайте скрипти до `package.json`:

```json
{
  "scripts": {
    "lint": "npm run lint:js && npm run lint:scss",
    "lint:js": "eslint .",
    "lint:scss": "stylelint \"src/**/*.scss\"",
    "lint:fix": "eslint . --fix && stylelint \"src/**/*.scss\" --fix",
    "format": "prettier --write \"**/*.{js,json,md,scss,html}\"",
    "format:check": "prettier --check \"**/*.{js,json,md,scss,html}\""
  }
}
```

Використання:

```bash
npm run lint          # Перевірка JS + SCSS
npm run lint:fix      # Автофікс JS + SCSS
npm run format        # Форматування всіх файлів
npm run format:check  # Перевірка форматування (CI)
```

---

## Конфігурація

Створіть `em-flatbuild.config.js` у корені проєкту. Всі опції **необов'язкові** - значення за замовчуванням показані нижче:

```js
export default {
  // Шляхи (відносно кореня проєкту)
  root: 'src/pages',
  layouts: 'src/layouts',
  includes: 'src/includes',
  helpers: 'src/helpers',
  data: 'src/data',
  assets: 'src/assets',
  scss: 'src/scss',
  output: 'dist',

  // Dev server
  port: 3000,
  open: false,       // Відкрити браузер при запуску `dev`

  // Автоматичне призначення layouts за папкою
  pageLayouts: {
    // 'blog': 'blog',     // Всі сторінки в src/pages/blog/ використовують layout blog
    // 'docs': 'docs',
  },
};
```

### `pageLayouts`

Автоматично призначає layout усім сторінкам у папці без додавання front matter до кожного файлу:

```js
pageLayouts: {
  'blog': 'blog',       // src/pages/blog/*.html → layouts/blog.html
  'docs': 'sidebar',    // src/pages/docs/*.html → layouts/sidebar.html
}
```

---

## CLI довідка

```
Використання: em-flatbuild <команда> [опції]

Команди:
  build [опції]       Зібрати сайт для production
  dev [опції]         Запустити dev server з live reload

Опції build:
  --minify            Мініфікувати CSS

Опції dev:
  -p, --port <число>  Порт dev server (за замовчуванням: 3000)
  --open              Відкрити браузер при старті

Загальні:
  -V, --version       Показати версію
  -h, --help          Показати довідку
```

### Приклади

```bash
# Dev server на іншому порту
em-flatbuild dev -p 8080

# Dev server з відкриттям браузера
em-flatbuild dev --open

# Production збірка з мініфікованим CSS
em-flatbuild build --minify
```

---

## Програмний API

em-Flatbuild можна використовувати як Node.js бібліотеку:

```js
import { resolveConfig, build, serve } from 'em-flatbuild';

// Збірка
const buildConfig = await resolveConfig(process.cwd(), { minify: true });
const result = await build(buildConfig);
console.log(`Зібрано ${result.pages} сторінок за ${result.elapsed}мс`);

// Dev server
const devConfig = await resolveConfig();
await serve(devConfig);
```

---

## Ліцензія

MIT
