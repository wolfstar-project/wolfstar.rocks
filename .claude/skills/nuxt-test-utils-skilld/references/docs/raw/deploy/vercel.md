# Vercel

> Deploy your Nuxt Application to Vercel infrastructure.

<tip>

**Zero Configuration **

<br />

Integration with Vercel is possible with zero configuration, learn more.

</tip>

<important>

Use [@nuxthub/core](/modules/hub) to add database, KV, blob storage, and cache to your Nuxt application. NuxtHub works on Vercel, Cloudflare, Netlify, and more. Learn more on hub.nuxt.com.

</important>

## Deploy using Git

1. Push your code to your git repository (GitHub, GitLab, Bitbucket).
2. Import your project into Vercel.
3. Vercel will detect that you are using Nitro and will enable the correct settings for your deployment.
4. Your application is deployed!

After your project has been imported and deployed, all subsequent pushes to branches will generate Preview Deployments, and all changes made to the Production Branch (commonly “main”) will result in a Production Deployment.

Learn more about Vercel’s Git Integration.

## Custom Build Output Configuration

You can provide additional build output configuration using `nitro.vercel.config` key inside `nuxt.config.ts`. It will be merged with built-in auto generated config.

## Templates

<card-group>
<card :ui="{"icon":{"base":"text-black dark:text-white"}}" icon="i-simple-icons-github" target="_blank" title="Nuxt Vercel ISR" to="https://github.com/danielroe/nuxt-vercel-isr">

Example of a Nuxt application with hybrid rendering deployed on Vercel.

</card>

<card :ui="{"icon":{"base":"text-black dark:text-white"}}" icon="i-simple-icons-github" target="_blank" title="Nuxt on the Edge on Vercel" to="https://github.com/pi0/nuxt-on-the-edge">

Example of a Nuxt application running on Vercel Edge Functions.

</card>
</card-group>

## Learn More

<read-more target="_blank" to="https://nitro.unjs.io/deploy/providers/vercel">

Head over **Nitro documentation** to learn more about On-Demand Incremental Static Regeneration or more advanced options.

</read-more>
