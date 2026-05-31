import Handlebars from 'handlebars';
import { marked } from 'marked';

/**
 * Create and configure a Handlebars instance with includes, helpers, icons, and built-in extras.
 */
export function createEngine({ includes, helpers, icons }) {
  const hbs = Handlebars.create();

  // Register includes as Handlebars partials
  for (const [name, content] of includes) {
    hbs.registerPartial(name, content);
  }

  // Register user helpers
  for (const [name, fn] of helpers) {
    hbs.registerHelper(name, fn);
  }

  // ── Built-in helpers ──────────────────────────────────────

  /**
   * {{#eq a b}}...{{else}}...{{/eq}}
   */
  hbs.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  /**
   * {{#neq a b}}...{{/neq}}
   */
  hbs.registerHelper('neq', function (a, b, options) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });

  /**
   * {{#gt a b}}...{{/gt}}
   */
  hbs.registerHelper('gt', function (a, b, options) {
    return a > b ? options.fn(this) : options.inverse(this);
  });

  /**
   * {{#lt a b}}...{{/lt}}
   */
  hbs.registerHelper('lt', function (a, b, options) {
    return a < b ? options.fn(this) : options.inverse(this);
  });

  /**
   * {{#and a b}}...{{/and}}
   */
  hbs.registerHelper('and', function (a, b, options) {
    return a && b ? options.fn(this) : options.inverse(this);
  });

  /**
   * {{#or a b}}...{{/or}}
   */
  hbs.registerHelper('or', function (a, b, options) {
    return a || b ? options.fn(this) : options.inverse(this);
  });

  /**
   * {{join array ", "}}
   */
  hbs.registerHelper('join', function (arr, separator) {
    if (!Array.isArray(arr)) return '';
    return arr.join(typeof separator === 'string' ? separator : ', ');
  });

  /**
   * {{json obj}}
   * Output a variable as pretty-printed JSON.
   */
  hbs.registerHelper('json', function (context) {
    return new hbs.SafeString(JSON.stringify(context, null, 2));
  });

  /**
   * {{year}}
   * Current year - handy for copyright.
   */
  hbs.registerHelper('year', function () {
    return new Date().getFullYear();
  });

  /**
   * {{#repeat n}}...{{/repeat}}
   */
  hbs.registerHelper('repeat', function (n, options) {
    let out = '';
    for (let i = 0; i < n; i++) {
      out += options.fn({ ...this, '@index': i });
    }
    return out;
  });

  /**
   * {{icon "name"}}
   * {{icon "name" class="extra-class"}}
   * {{icon "name" size="24"}}
   *
   * Inlines an SVG icon from src/assets/icons/ with class="icon icon-{name}".
   * Optional `class` hash adds extra classes. Optional `size` hash sets width/height.
   */
  hbs.registerHelper('icon', function (name, options) {
    if (typeof name !== 'string') return '';

    const svg = icons.get(name);
    if (!svg) return `<!-- icon "${name}" not found -->`;

    const hash = options && options.hash ? options.hash : {};
    const extraClass = hash.class ? ` ${hash.class}` : '';
    const size = hash.size || null;

    let result = svg;

    // Add or replace class attribute
    if (result.match(/<svg[^>]*\sclass="/)) {
      result = result.replace(
        /(<svg[^>]*\sclass=")([^"]*")/,
        `$1icon icon-${name}${extraClass}" `
      );
    } else {
      result = result.replace('<svg', `<svg class="icon icon-${name}${extraClass}"`);
    }

    // Set width/height if size is provided
    if (size) {
      if (result.match(/<svg[^>]*\swidth="/)) {
        result = result.replace(/\swidth="[^"]*"/, ` width="${size}"`);
      } else {
        result = result.replace('<svg', `<svg width="${size}"`);
      }

      if (result.match(/<svg[^>]*\sheight="/)) {
        result = result.replace(/\sheight="[^"]*"/, ` height="${size}"`);
      } else {
        result = result.replace('<svg', `<svg height="${size}"`);
      }
    }

    return new hbs.SafeString(result);
  });

  /**
   * {{#markdown}}...{{/markdown}}  - block helper
   * {{markdown text}}              - inline helper
   * Full markdown rendering via `marked`.
   */
  hbs.registerHelper('markdown', function (textOrOptions, _options) {
    // Block usage: {{#markdown}}content{{/markdown}}
    if (textOrOptions && typeof textOrOptions === 'object' && textOrOptions.fn) {
      const raw = textOrOptions.fn(this);
      return new hbs.SafeString(marked.parse(raw));
    }

    // Inline usage: {{markdown someVar}}
    if (typeof textOrOptions === 'string') {
      return new hbs.SafeString(marked.parse(textOrOptions));
    }

    return '';
  });

  return hbs;
}
