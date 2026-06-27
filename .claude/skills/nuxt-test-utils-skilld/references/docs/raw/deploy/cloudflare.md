# Cloudflare

> Deploy your Nuxt Application to Cloudflare infrastructure.

## Cloudflare Pages

<tip>

**Zero Configuration **

<br />

Integration with Cloudflare Pages is possible with zero configuration, learn more.

</tip>

<important>

Use [@nuxthub/core](/modules/hub) to add database, KV, blob storage, and cache to your Nuxt application. NuxtHub works on Vercel, Cloudflare, Netlify, and more. Learn more on hub.nuxt.com.

</important>

### Git Integration

If you use the GitHub/GitLab integration with Cloudflare Pages, **no configuration is required**. Pushing to your repository will automatically build your project and deploy it.

<note>

Nuxt will detect the environment to set the correct Server/Nitro preset.

</note>

To leverage server-side rendering on the edge, set the build command to: `nuxt build`

To statically generate your website, set the build command to: `nuxt generate`

### Route matching

On CloudFlare Pages, if an HTML file is found with a matching path to the current route requested, it will serve it. It will also redirect HTML pages to their extension-less counterparts: for instance, `/contact.html` will be redirected to `/contact`, and `/about/index.html` will be redirected to `/about/`.

To match Cloudflare route matching rules, set the nitro option `autoSubfolderIndex` to `false`.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    prerender: {
      autoSubfolderIndex: false
    }
  }
})
```

### Direct Upload

Alternatively, you can use wrangler to upload your project to Cloudflare.

In this case, you will have to set the preset manually.

1. Build your project for Cloudflare Pages:

```bash [Terminal]
npx nuxi build --preset=cloudflare_pages
```

1. Deploy, it will ask you to create a project for the first time:

```bash [Terminal]
npx wrangler pages deploy dist/
```

## Learn more

<read-more target="_blank" to="https://nitro.unjs.io/deploy/providers/cloudflare">

Head over **Nitro documentation** to learn more about the Cloudflare deployment preset.

</read-more>

<read-more target="_blank" to="https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/#use-bindings-in-your-nuxt-application">

Head over **CloudFlare Pages** documentation to learn more about it.

</read-more>

## Templates

<card-group>
<card :ui="{"icon":{"base":"text-black dark:text-white"}}" icon="i-simple-icons-github" target="_blank" title="Atidone" to="https://github.com/atinux/atidone">

A todos application with user authentication, SSR and Cloudflare D1.

</card>

<card :ui="{"icon":{"base":"text-black dark:text-white"}}" icon="i-simple-icons-github" target="_blank" title="Atinotes" to="https://github.com/atinux/atinotes">

An editable website with universal rendering based on Cloudflare KV.

</card>

<card :ui="{"icon":{"base":"text-black dark:text-white"}}" icon="i-simple-icons-github" target="_blank" title="Atidraw" to="https://github.com/atinux/atidraw">

Web application that lets you to draw and share your drawings with the world, with Cloudflare R2 & AI.

</card>

<card :ui="{"icon":{"base":"text-black dark:text-white"}}" icon="i-simple-icons-github" target="_blank" title="Nuxt Image Gallery" to="https://github.com/flosciante/nuxt-image-gallery">

An image gallery to upload, edit and share your images to the world, with Cloudflare R2.

</card>
</card-group>

## Learn more

<read-more target="_blank" to="https://v2.nitro.build/deploy/providers/cloudflare">

Head over **Nitro documentation** to learn more about the cloudflare deployment preset.

</read-more>
