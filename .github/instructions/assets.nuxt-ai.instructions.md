---
applyTo: **/{assets,public}/**/*.{css,scss,less,styl,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot}
---

# Nuxt Assets and Static Files

## Context

Rules for managing assets in Nuxt applications.

- Assets in assets/ are processed by build tools
- Files in public/ are served as-is
- Use Nuxt Image for optimized images
- Use proper font loading strategies
- Implement proper CSS organization

## Requirements

- Use Nuxt Image for optimized images
- Implement proper image lazy loading
- Use responsive image sizes
- Implement proper font loading
- Use font preloading for critical fonts
- Implement proper CSS organization
- Use CSS variables for theming
- Implement proper media queries
- Use proper asset optimization
- Handle static files correctly

## Examples

<example>
// Example of proper CSS handling with Nuxt assets
export default `
// assets/css/main.css
@import './variables.css';
@import './typography.css';
@import './utilities.css';

:root {
/_ Use CSS variables for theming _/
--primary-color: theme('colors.primary');
--text-color: theme('colors.gray.900');
--background-color: theme('colors.white');
}

/_ Use proper media queries _/
@media (prefers-color-scheme: dark) {
:root {
--text-color: theme('colors.gray.100');
--background-color: theme('colors.gray.900');
}
}

/_ Use proper CSS nesting _/
.container {
max-width: theme('screens.xl');
margin: 0 auto;
padding: theme('spacing.4');

@media (min-width: theme('screens.lg')) {
padding: theme('spacing.6');
}

& > _ + _ {
margin-top: theme('spacing.4');
}
}

/_ Use proper CSS custom properties _/
.button {
background-color: var(--primary-color);
color: var(--background-color);
padding: theme('spacing.2') theme('spacing.4');
border-radius: theme('borderRadius.md');
transition: opacity 0.2s ease;

&:hover {
opacity: 0.9;
}

&:focus {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
}

/_ Use proper utility classes _/
.visually-hidden {
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
clip: rect(0, 0, 0, 0);
white-space: nowrap;
border: 0;
}
`

</example>

<example>
// Example of proper font handling with Nuxt assets
export default `
// assets/css/fonts.css
/* Define font faces with proper formats and descriptors */
@font-face {
  font-family: 'CustomFont';
  src: url('../fonts/CustomFont.woff2') format('woff2'),
       url('../fonts/CustomFont.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+000-5FF; /* Latin glyphs */
}

@font-face {
font-family: 'CustomFont';
src: url('../fonts/CustomFont-Bold.woff2') format('woff2'),
url('../fonts/CustomFont-Bold.woff') format('woff');
font-weight: 700;
font-style: normal;
font-display: swap;
unicode-range: U+000-5FF;
}

/_ Define font variables _/
:root {
--font-primary: 'CustomFont', system-ui, sans-serif;
--font-mono: ui-monospace, 'SF Mono', monospace;
--font-size-base: 1rem;
--line-height-base: 1.5;
}

/_ Apply fonts with proper fallbacks _/
body {
font-family: var(--font-primary);
font-size: var(--font-size-base);
line-height: var(--line-height-base);
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

code {
font-family: var(--font-mono);
font-size: 0.9em;
}

/_ Use proper font loading _/

<script>
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/CustomFont.woff2',
          crossorigin: 'anonymous'
        }
      ]
    }
  }
})
</script>

`

</example>

<example>
// Example of proper image handling with Nuxt Image
export default `
<script setup lang="ts">
// Define image props with proper types
interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  format?: 'webp' | 'jpeg' | 'png'
}

const props = withDefaults(defineProps<Props>(), {
width: 800,
height: 600,
format: 'webp'
})

// Use computed for dynamic sources
const optimizedSrc = computed(() => {
const base = props.src.startsWith('http')
? props.src // Remote image
: \`/assets/images/\${props.src}\` // Local image

return {
src: base,
width: props.width,
height: props.height,
format: props.format,
quality: 80
}
})
</script>

<template>
  <figure>
    <!-- Use Nuxt Image component for optimized images -->
    <nuxt-img
      v-bind="optimizedSrc"
      :alt="alt"
      loading="lazy"
      sizes="sm:100vw md:50vw lg:800px"
      placeholder
    />
    <figcaption>
      <slot />
    </figcaption>
  </figure>
</template>

<style scoped>
figure {
  margin: 0;
  position: relative;
}

img {
  width: 100%;
  height: auto;
  display: block;
}
</style>

`

</example>

<example type="invalid">
// Example of poor CSS handling and organization
export default `
/* ❌ Wrong: Global styles without proper organization */
.button {
  /* Wrong: Hardcoded colors */
  background-color: #00dc82;
  color: white;
  /* Wrong: Magic numbers */
  padding: 12px 24px;
  border-radius: 4px;
}

/_ Wrong: No media queries or responsive design _/
.container {
width: 1200px;
margin: 0 auto;
}

/_ Wrong: No CSS variables or theming _/
.text-primary {
color: #00dc82;
}

/_ Wrong: No proper nesting or organization _/
.card .card-title {
font-size: 24px;
}
.card .card-body {
padding: 16px;
}
.card .card-footer {
border-top: 1px solid #eee;
}
`

</example>

<example type="invalid">
// Example of poor font handling and loading
export default `
/* ❌ Wrong: Poor font loading and fallbacks */
@font-face {
  /* Wrong: Missing font formats and descriptors */
  font-family: 'CustomFont';
  src: url('/fonts/custom.ttf');
}

/_ Wrong: No font variables or system fallbacks _/
body {
font-family: CustomFont;
}

/_ Wrong: No font preloading _/
h1, h2, h3 {
/_ Wrong: Hardcoded font stack _/
font-family: Arial, sans-serif;
}

/_ Wrong: No font optimization _/
@import url('https://fonts.googleapis.com/css2?family=OpenSans');
`

</example>

<example type="invalid">
// Example of poor image handling without optimization
export default `
<template>
  <!-- ❌ Wrong: Not using Nuxt Image -->
  <div>
    <!-- Wrong: No lazy loading -->
    <img src="/images/large-image.jpg" />

    <!-- Wrong: No width/height attributes -->
    <img src="https://external-site.com/image.jpg" alt="" />

    <!-- Wrong: No optimization or responsive handling -->
    <img src="~/assets/images/photo.jpg" style="width: 100%" />

  </div>
</template>
`

</example>

## Critical Rules

- ALWAYS use Nuxt Image for image optimization
- Implement proper font loading strategies
- Use proper CSS organization and variables
- Handle responsive assets properly
- Optimize assets for production
- Use proper static file handling
