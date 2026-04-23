Deploy a Gatsby.js App to Gatsby Edge Network | Dotenv

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
    - Initial setup
    - Build .env.vault
    - Set DOTENV_KEY
    - Deploy
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

##### Frameworks › Gatsby

# Deploy a Gatsby.js App to Gatsby Edge Network

Deploy a Gatsby.js app with an encrypted .env.vault file to Gatsby Edge.

Find a complete code example on GitHub for this guide.

## Initial setup

Generate a gatsby.js application.

```shell
npm init gatsby
```

CopyCopied!

This will create a handful of files.

```shell
ls -1
README.md
gatsby-config.js
node_modules/
package-lock.json
package.json
src/
```

CopyCopied!

Install the latest dotenv. This is **important** because the Gatsby framework is currently using an old version of dotenv without `.env.vault` support.

```shell
npm install dotenv --save
```

CopyCopied!

Edit `src/pages/index.js` to the following.

### src/pages/index.js

```js
import * as React from "react"

const IndexPage = () => {
  return (
    <div>Hello {process.env.GATSBY_HELLO}.</div>
  )
}

export default IndexPage
```

CopyCopied!

Require dotenv at the top of `gatsby-config.js`.

### gatsby-config.js

```js
/**
 * @type {import('gatsby').GatsbyConfig}
 */
require('dotenv').config()
console.log(process.env) // for debugging purposes. remove when ready.

module.exports = {
  siteMetadata: {
    title: \`gatsby-edge\`,
    siteUrl: \`https://www.yourdomain.tld\`,
  },
  plugins: [],
}
```

CopyCopied!

Create `.env` file.

### .env

```bash
# .env
GATSBY_HELLO="World"
```

CopyCopied!

Run Gatsby.

```shell
npm run develop
started server on http://localhost:8000/
```

CopyCopied!

Visit localhost:8000



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

Test production `DOTENV_KEY` locally using the CLI.

```shell
DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production' npm run develop
```

CopyCopied!



Next set up your site on Gatsby Edge and then set the DOTENV_KEY as an environment variable.

Gatsby has an easy to follow tutorial for deploying to their edge network.



## Deploy

Commit those changes safely to code and deploy.

That's it! When the build runs, your `.env.vault` file will be decrypted and its production secrets injected as environment variables – just-in-time.

You'll know things worked correctly when you see `'Loading env from encrypted .env.vault'` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

If successful you'll see the message `Loading env from encrypted .env.vault` in your Gatsby Edge Network logs.

gatsbyjs.com/dashboard



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

Previous Fly

Next Heroku

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension