Deploy a Turborepo App to Vercel | Dotenv

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
    - Initial setup
    - Install dotenv-cli
    - Build .env.vault
    - Set DOTENV_KEY
    - Deploy
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

##### Frameworks › Turborepo

# Deploy a Turborepo App to Vercel

Deploy a Turborepo app with an encrypted .env.vault file to Vercel.

Find a complete code example on GitHub for this guide.

## Initial setup

Create a new monorepo.

```bash
npx create-turbo@latest
```

CopyCopied!

This will create a handful of files and a couple workspaces (apps).

```shell
ls -1
README.md
apps/
node_modules/
package-lock.json
package.json
packages/
turbo.json
```

CopyCopied!

Edit `apps/web/app/page.tsx` to include `process.env.NEXT_PUBLIC_HELLO` and say 'Hello World'.

### apps/web/app/page.tsx

```js
export default function Page() {
  return (
    <>
      Hello {process.env.NEXT_PUBLIC_HELLO}.
    </>
  );
}
```

CopyCopied!

Declare the environment variable in `turbo.json`.

```js
{
  ..
  "globalEnv": [
    "NEXT_PUBLIC_HELLO"
  ]
}
```

CopyCopied!

If you prefer to set an environment variable on a workspace only and not globally across your turborepo, you can do that with the pipeline env key.

Add `.vercelignore` file.

### .vercelignore

```shell
.env*
!.env.vault
```

CopyCopied!

Commit that to code and deploy it to Vercel.

```shell
npx vercel@latest deploy --prod
```

CopyCopied!

Your first deploy will likely fail because you need to add a couple custom configurations. Go to project settings and do the following.

Set `Build & Development Settings` > `Framework Preset` to Next.js and override the build command with `cd ../.. && npm run build --filter=web`.

vercel.com/org/project/settings



Set the root directory to `apps/web`.

vercel.com/org/project/settings



Deploy again.

```shell
npx vercel@latest deploy --prod
```

CopyCopied!

yourapp.vercel.app



Once deployed, your app will say `'Hello .'` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install dotenv-cli

Install `dotenv-cli`.

```shell
npm install github:motdotla/dotenv-cli --save
```

CopyCopied!

We are installing from motdotla/dotenv-cli temporarily. Once entropitor/dotenv-cli upgrades to `\[email protected\]` we will recommend the simpler `npm install dotenv-cli --save` command.

Create a `.env` file in the root of your project.

### .env

```shell
# .env
NEXT_PUBLIC_HELLO="World"
```

CopyCopied!

Adjust your `package.json` scripts to inject the environment variables into the `turbo` command.

### package.json

```json
"scripts": {
  "build": "dotenv -- turbo run build",
  "dev": "dotenv -- turbo run dev",
  "lint": "dotenv -- turbo run lint",
},
```

CopyCopied!

See more about using environment variables with turborepo.

Try running it locally.

```shell
npm run dev
docs:dev: - ready started server on 0.0.0.0:3001, url: http://localhost:3001
web:dev: - ready started server on 0.0.0.0:3002, url: http://localhost:3002
```

CopyCopied!

Visit localhost:3002



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

Set `DOTENV_KEY` on Vercel using the CLI.

```shell
npx vercel@latest env add DOTENV_KEY
```

CopyCopied!

```shell
? What’s the value of DOTENV_KEY? dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production
✅  Added Environment Variable DOTENV_KEY to Project nodejs-vercel [94ms]
```

CopyCopied!

Or use Vercel's UI.

vercel.com



## Deploy

Commit those changes safely to code and deploy.

```shell
npx vercel@latest deploy --prod
```

CopyCopied!

That's it! On deploy, your `.env.vault` file will be decrypted and its production secrets injected as environment variables – just in time.

yourapp.vercel.app



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

Previous SvelteKit

Next Vite

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension