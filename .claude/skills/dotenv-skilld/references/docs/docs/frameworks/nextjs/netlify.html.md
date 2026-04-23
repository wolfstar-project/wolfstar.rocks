Deploy a Next.js App to Netlify | Dotenv

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

##### Frameworks › Next.js

# Deploy a Next.js App to Netlify

Deploy a Next.js app with an encrypted .env.vault file to Netlify.

Find a complete code example on GitHub for this guide.

## Initial setup

Generate a **next.js** application.

```shell
npx create-next-app@latest --example hello-world .
```

CopyCopied!

This will create a handful of files.

```shell
ls -1
README.md
next-env.d.ts
node_modules
package-lock.json
package.json
pages
tsconfig.json
```

CopyCopied!

Edit `pages/index.tsx` to include `process.env.NEXT_PUBLIC_HELLO`.

### pages/index.tsx

```js
export default function IndexPage() {
  return (
    <div>
      Hello {process.env.NEXT_PUBLIC_HELLO}.
    </div>
  )
}
```

CopyCopied!

Add `netlify.toml`.

### netlify.toml

```yaml
[build]
  command = "npm run build"
  publish = ".next"
```

CopyCopied!

Commit that to code and deploy it to Netlify.

```shell
npx netlify-cli@latest deploy --build --prod
```

CopyCopied!

yourapp.vercel.app



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
NEXT_PUBLIC_HELLO="World"
```

CopyCopied!

Preface your npm `package.json scripts` with dotenv preloading.

### package.json

```json
"scripts": {
  "dev": "node -r dotenv/config ./node_modules/.bin/next",
  "build": "node -r dotenv/config ./node_modules/.bin/next build",
  "start": "node -r dotenv/config ./node_modules/.bin/next start"
}
```

CopyCopied!

Try running it locally.

```shell
npm run dev
started server on 0.0.0.0:3000, url: http://localhost:3000
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

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension