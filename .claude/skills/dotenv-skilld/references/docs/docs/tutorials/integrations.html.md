Integrate Everywhere | Dotenv

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
    - Run dotenv-vault build
    - Set DOTENV_KEY
    - Require dotenv >= 16.1.0
  - Adding teammates
  - Managing access
- Sign in

##### Tutorials

# Integrate Everywhere

## Run dotenv-vault build

Open terminal, enter your project's root directory (where your .env.vault file is), and run dotenv-vault build.

```
$ npx dotenv-vault build
```

CopyCopied!



Your `.env.vault` file should now look something like this.

```
DOTENV_VAULT=vlt_509ada...
DOTENV_VAULT_DEVELOPMENT="Z53YGRqDcfkQZ..."
DOTENV_VAULT_CI="Ib3n/NKbTVO..."
DOTENV_VAULT_STAGING="up1/d3F13uCKrbsU..."
DOTENV_VAULT_PRODUCTION="oJ6qWV1erwlU1TP4..."
```

CopyCopied!

As you can see, your environment variables are encrypted per environment.

## Set DOTENV_KEY

The `DOTENV_KEY` decrypts the encrypted values from `DOTENV_VAULT_PRODUCTION`. Run dotenv-vault keys production.

```
$ npx dotenv-vault keys production
```

CopyCopied!

That will output your DOTENV_KEY.

```
dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production
```

CopyCopied!

Set `DOTENV_KEY` on your infrastructure. For example, on Heroku:

```
$ heroku config:set DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production'
```

CopyCopied!

## Require dotenv >= 16.1.0

The last step is to require dotenv >= 16.1.0 into your code.

As early as possible in your application, import and configure dotenv:

```
require('dotenv').config()
console.log(process.env) // remove this after you've confirmed it working
```

CopyCopied!

Note: Other languages like Ruby, Python, PHP, etc are also supported.

That's it!

When your app boots, it will recognize the `DOTENV_KEY`, decrypt the `.env.vault` file, and load the variables to `ENV`. If a `DOTENV_KEY` is not set (like during development on your local machine) it will fall back to regular dotenv.

Was this page helpful?

Yes

No

Previous Manage environments

Next Adding teammates

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension