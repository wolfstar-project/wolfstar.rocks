CI/CD in Remix.js with GitHub Actions | Dotenv

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

##### Frameworks › Remix.js

# CI/CD in Remix.js with GitHub Actions

Run Remix.js CI/CD in GitHub Actions with an encrypted .env.vault file

Find a complete code example on GitHub for this guide.

## Initial setup

Create a Remix.js application.

```bash
npx create-remix@latest
```

CopyCopied!

This will create a handful of files.

```shell
ls -1
README.md
app/
build/
node_modules/
package-lock.json
package.json
public/
remix.config.js
remix.env.d.ts
tsconfig.json
```

CopyCopied!

Edit `app/routes/_index.tsx` to include `process.env.HELLO` using a Remix loader.

### app/routes/_index.tsx

```js
import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  return json({
    ENV: {
      HELLO: process.env.HELLO, // HELLO="World" in .env file
    },
  });
}

export default function Index() {
  const data = useLoaderData()

  return (
    <div>
      Hello {data.ENV.HELLO}.
    </div>
  );
}
```

CopyCopied!

Create `.github/worksflows/ci.yml` file.

### .github/workflows/ci.yml

```yaml
# .github/workflow/ci.yml
name: npm run build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 16
    - run: npm install
    - run: npm run build
      env:
        DOTENV_KEY: ${{ secrets.DOTENV_KEY }}
```

CopyCopied!

Commit that to code and push to GitHub.

Once pushed, the GitHub Actions build contents will say `Hello .` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Preload dotenv

Install `dotenv`.

```shell
npm install dotenv --save # Requires dotenv >= 16.1.0
```

CopyCopied!

Create a `.env` file in the root of your project.

### .env

```shell
# .env
HELLO="World"
```

CopyCopied!

Preload Remix.js scripts using dotenv. This will inject environment variables ahead of Remix.js.

### package.json

```json
"scripts": {
  "build": "node -r dotenv/config ./node_modules/.bin/remix build",
  "dev": "node -r dotenv/config ./node_modules/.bin/remix dev",
  "start": "node -r dotenv/config ./node_modules/.bin/remix-serve build",
},
```

CopyCopied!

Try running it locally.

```shell
npm run dev
# Visit http://localhost:3000
```

CopyCopied!

It will say 'Hello World'.



Great! `process.env` now has the keys and values you defined in your `.env` file.

That covers local simulation of the CI. Let's solve for the real CI environment next.

## Build .env.vault

Push your latest `.env` file changes and edit your CI secrets. Learn more about syncing

```shell
npx dotenv-vault@latest push
npx dotenv-vault@latest open ci
```

CopyCopied!

Use the UI to configure the CI environment secrets.

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

# ci
DOTENV_VAULT_CI="x26PuIKQ/xZ5eKrYomKngM+dO/9v1vxhwslE/zjHdg3l+H6q6PheB5GVDVIbZg=="
DOTENV_VAULT_CI_VERSION=2
```

CopyCopied!

## Set DOTENV_KEY

Fetch your CI `DOTENV_KEY`.

```shell
npx dotenv-vault@latest keys ci
# outputs: dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=ci
```

CopyCopied!

Set `DOTENV_KEY` on GitHub Actions.



## Build CI

Commit those changes safely to code and rerun the build.

That's it! On rerun, your `.env.vault` file will be decrypted and its CI secrets injected as environment variables – just in time.

You'll know things worked correctly when you see `'Loading env from encrypted .env.vault'` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

github actions build



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension