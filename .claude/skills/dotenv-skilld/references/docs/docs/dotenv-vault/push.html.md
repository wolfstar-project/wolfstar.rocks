dotenv-vault push | Dotenv

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
    - Usage
    - Command Details
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

##### CLI

# dotenv-vault push

Push .env securely with dotenv-vault.

## Usage

#### 1. Run push command

```
$ npx dotenv-vault push

remote:   Securely pushing (.env)... done
remote:   Securely pushed development (.env)
```

CopyCopied!

That's it!

---

## Command Details

For more information on the push command, run dotenv-vault help push.

```
$ npx dotenv-vault help push
Push .env securely

USAGE
  $ dotenv-vault push [ENVIRONMENT] [FILENAME] [-m ] [-y]

ARGUMENTS
  ENVIRONMENT  Set environment to push to. Defaults to development
  FILENAME     Set input filename. Defaults to .env

FLAGS
  -m, --dotenvMe=  Pass .env.me (DOTENV_ME) credential directly (rather than reading from .env.me file)
  -y, --yes               Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

DESCRIPTION
  Push .env securely

EXAMPLES
  $ dotenv-vault push
```

CopyCopied!

##### ARGUMENTS

_[ENVIRONMENT]_

Set environment to push to. Defaults to development

```
$ npx dotenv-vault push production
```

CopyCopied!

_[FILENAME]_

Set input filename. Defaults to .env for development and .env.[ENVIRONMENT] for other environments

```
$ npx dotenv-vault push production .env.production
```

CopyCopied!

##### FLAGS

_-m, --dotenvMe_

Pass .env.me (DOTENV_ME) credential directly (rather than reading from .env.me file)

```
$ npx dotenv-vault push --dotenvMe=me_b1831e‚Ä¶
```

CopyCopied!

_-y, --yes_

Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

```
$ npx dotenv-vault push -y
```

CopyCopied!

Was this page helpful?

Yes

No

Previous open

Next pull

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension