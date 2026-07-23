# IIS

> Deploy your Nuxt Application to IIS infrastructure.

## Using IISnode

1. Install the latest LTS version of Node.js on your Windows Server.
2. Install IISnode
3. Install IIS `URLRewrite` Module.
4. In IIS, add `.mjs` as a new mime type and set its content type to `application/javascript`.
5. Build you application with the following command:
```bash [Terminal]
npx nuxi build --preset=iis_node
```
6. Deploy the contents of your `.output` folder to your website in IIS.

## More options

<read-more target="_blank" to="https://nitro.unjs.io/deploy/providers/iis">

Head over **Nitro documentation** to learn more about the IIS deployment presets.

</read-more>
