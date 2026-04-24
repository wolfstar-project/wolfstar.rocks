Deploy an Astro.js App to Netlify | Dotenv

Home Documentation

Find something...````K``

Home Documentation

- Help & Support

Log in

- ## Documentation
  - Introduction
  - Quickstart
  - CLI
  - Security
  - Features
  - Addons
- ## Quickstart Guides
  - Sync
  - Environments
  - Load
  - Deploy
- ## Languages
  - Node.js
  - Python
  - Ruby
  - Go
  - PHP
  - Rust
- ## Frameworks
  - Angular
  - Astro
    - Initial setup
    - Install dotenv
    - Build .env.vault
    - Set DOTENV_KEY
    - Deploy
  - Express
  - Laravel
  - Gatsby
  - Nest.js
  - Next.js
  - Nuxt.js
  - PM2
  - Remix
  - Serverless
  - SvelteKit
  - Turborepo
  - Vite
  - FastAPI
  - Flask
  - Rails
  - Sinatra
  - Rocket
- ## Platforms
  - AWS Lambda
  - Cloud66
  - Digital Ocean
  - Docker
  - Edgio
  - Fly
  - Gatsby Edge
  - Heroku
  - Kamal
  - Laravel Forge
  - Netlify
  - Northflank
  - Railway
  - Render
  - Vercel
- ## CI/CDs
  - AWS Beanstalk
  - Bitbucket
  - Buddy
  - CircleCI
  - Dagger
  - GitHub Actions
  - Gitlab CI/CD
  - Google Cloud Build
  - Jenkins
  - Pulumi
  - Travis
- ## CLI
  - new
  - login
  - logout
  - open
  - push
  - pull
  - build
  - keys
  - rotatekey
  - versions
  - whoami
  - status
  - help
- ## Security
  - .env
  - .env.vault
  - .env.me
  - DOTENV_KEY
  - IT Tokens
  - Vault
- ## Features
  - Sync .env files
  - Unlimited projects
  - Teammates
  - Multiple environments
  - Compare environments
  - Encrypted deploys
  - CLI
  - Add-ons
  - VSCode
  - Personal secrets
  - Custom environments
  - Access controls
  - Version history
- ## Add-ons
  - Overview
  - VSCode
  - External Share
  - GitHub Build
  - Slack Notifications
  - Sync to AWS Parameter Store
  - Sync to AWS Secrets
  - Sync to Heroku
  - Sync to Vercel
- ## Tutorials
  - Sync .env files
  - Manage environments
  - Integrate everywhere
  - Adding teammates
  - Managing access
- Sign in

##### Frameworks › Astro.js

# Deploy an Astro.js App to Netlify

Deploy an Astro.js app with an encrypted .env.vault file to Netlify.

Find a complete code example on GitHub for this guide.

## Initial setup

Generate an **astro.js** application. When prompted, choose the Empty project option.

```shell
npm create astro@latest
```

CopyCopied!

This will create a handful of files.

```shell
ls -1
README.md
astro.config.mjs
node_modules/
package-lock.json
package.json
public/
src/
tsconfig.json
```

CopyCopied!

Edit `src/pages/index.astro` to include `import.meta.env.PUBLIC_HELLO`.

### src/pages/index.astro

```html
---
---

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<meta name="viewport" content="width=device-width" />
		<meta name="generator" content={Astro.generator} />
		<title>Astro</title>
	</head>
	<body>
		<h1>Hello {import.meta.env.PUBLIC_HELLO}.</h1>
	</body>
</html>
```

CopyCopied!

Add the astro netlify adapter.

```
npx astro add netlify
```

CopyCopied!

Add `netlify.toml`.

### netlify.toml

```yaml
[build]
  command = "npm run build"
  publish = "dist"
```

CopyCopied!

Commit that to code and deploy it to Netlify.

```shell
npx netlify-cli@latest deploy --build --prod
```

CopyCopied!

yourapp.netlify.app



Once deployed, your app will say `Hello .` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install dotenv

Install `dotenv`.

```shell
npm install dotenv --save # Requires dotenv >= 16.1.0
```

CopyCopied!

Create a `.env` file in the root of your project.

### .env

```shell
# .env
PUBLIC_HELLO="World"
```

CopyCopied!

Preface your npm `package.json scripts` with dotenv preloading.

### package.json

```json
{
  ...
  "scripts": {
    "dev": "node -r dotenv/config ./node_modules/.bin/astro dev",
    "start": "node -r dotenv/config ./node_modules/.bin/astro dev",
    "build": "node -r dotenv/config ./node_modules/.bin/astro build",
    "preview": "node -r dotenv/config ./node_modules/.bin/astro preview",
    "astro": "node -r dotenv/config ./node_modules/.bin/astro"
  },
  ...
}
```

CopyCopied!

Try running it locally.

```shell
npm run dev
Local    http://localhost:3000/
```

CopyCopied!

Visit localhost:3000



Perfect. `process.env` now has the keys and values you defined in your `.env` file.

That covers local development. Let's solve for production next.

## Build .env.vault

Push your latest `.env` file changes and edit your production secrets. Learn more about syncing

```shell
npx dotenv-vault@latest push
npx dotenv-vault@latest open production
```

CopyCopied!

Use the UI to configure those secrets per environment.

dotenv.org



Then build your encrypted `.env.vault` file.

```shell
npx dotenv-vault@latest build
```

CopyCopied!

Its contents should look something like this.

### .env.vault

```shell
#/-------------------.env.vault---------------------/
#/         cloud-agnostic vaulting standard         /
#/   [how it works](https://dotenv.org/env-vault)   /
#/--------------------------------------------------/

# development
DOTENV_VAULT_DEVELOPMENT="/HqNgQWsf6Oh6XB9pI/CGkdgCe6d4/vWZHgP50RRoDTzkzPQk/xOaQs="
DOTENV_VAULT_DEVELOPMENT_VERSION=2

# production
DOTENV_VAULT_PRODUCTION="x26PuIKQ/xZ5eKrYomKngM+dO/9v1vxhwslE/zjHdg3l+H6q6PheB5GVDVIbZg=="
DOTENV_VAULT_PRODUCTION_VERSION=2
```

CopyCopied!

## Set DOTENV_KEY

Fetch your production `DOTENV_KEY`.

```shell
npx dotenv-vault@latest keys production
# outputs: dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production
```

CopyCopied!

Set `DOTENV_KEY` on Netlify using the CLI.

```shell
npx netlify-cli@latest env:set DOTENV_KEY "dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production"
```

CopyCopied!

Or use Netlify's UI.



## Deploy

Commit those changes safely to code and redeploy to netlify.

```shell
npx netlify-cli@latest deploy --build --prod
```

CopyCopied!

yourapp.netlify.app



That's it! On deploy, your `.env.vault` file will be decrypted and its production secrets injected as environment variables – just in time.

You'll know things worked correctly when you see `'Loading env from encrypted .env.vault'` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

npx netlify-cli@latest deploy --build --prod



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

Previous Angular

Next Express

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension