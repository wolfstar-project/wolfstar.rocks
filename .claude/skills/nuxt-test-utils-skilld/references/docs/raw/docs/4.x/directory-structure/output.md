# .output

> Nuxt creates the .output/ directory when building your application for production.

<important>

This directory should be added to your [`.gitignore`](/docs/4.x/directory-structure/gitignore) file to avoid pushing the build output to your repository.

</important>

Use this directory to deploy your Nuxt application to production.

<read-more to="/docs/4.x/getting-started/deployment">



</read-more>

<warning>

You should not touch any files inside since the whole directory will be re-created when running [`nuxt build`](/docs/4.x/api/commands/build).

</warning>
