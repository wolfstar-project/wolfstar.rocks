# DigitalOcean

> Deploy your Nuxt Application to DigitalOcean infrastructure.

Nuxt supports deploying on the DigitalOcean App Platform with minimal configuration.

## Setup

1. Create a new DigitalOcean app following the guide.
2. Next, you'll need to configure environment variables. In your app settings, ensure the following app-level environment variables:```bash
SERVER_PRESET=digital-ocean
```
3. You will need to ensure you set an `engines.node` field in your app's `package.json` to ensure DigitalOcean uses a supported version of Node.js:```json [package.json]
{
  "engines": {
      "node": "20.x"
  }
}
```
4. You'll also need to add a run command so DigitalOcean knows what command to run after a build. You can do so by adding a start script to your `package.json`:```json [package.json]
{
  "scripts": {
      "start": "node .output/server/index.mjs"
  }
}
```
5. Finally, you'll need to add this start script to your DigitalOcean app's run command. Go to `Components > Settings > Commands`, click "Edit", then add `npm run start`

<tip>

Your Nuxt app should be live at a DigitalOcean generated URL and you can now follow the rest of the DigitalOcean deployment guide.

</tip>

## Learn more

<read-more target="_blank" to="https://nitro.unjs.io/deploy/providers/digitalocean">

Head over **Nitro documentation** to learn more about the digitalocean deployment preset.

</read-more>
