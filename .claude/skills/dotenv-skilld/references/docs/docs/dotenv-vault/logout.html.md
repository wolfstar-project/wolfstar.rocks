dotenv-vault logout | Dotenv

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
    - Usage
    - Command Details
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

##### CLI

# dotenv-vault logout

Log out of dotenv-vault.

## Usage

#### 1. Run logout command

```
$ npx dotenv-vault logout

local:    Press y (or any key) to logout and revoke credential (.env.me) or q to exit: y
local:    Opening browser to https://vault.dotenv.org/logout?DOTENV_VAULT=vlt_6beaae5‚Ä¶
local:    Waiting for logout and credential (.env.me) to be revoked... ‚°ø
```

CopyCopied!

#### 2. Click revoke

On the next screen, click 'Revoke'.



That's it!

Attempting to use the revoked .env.me credential for any further dotenv-vault push or dotenv-vault pull commands will be denied.

---

## Command Details

For more information on the logout command, run dotenv-vault help logout.

```
$ npx dotenv-vault help logout
Log out

USAGE
  $ dotenv-vault logout [-y]

FLAGS
  -y, --yes  Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

DESCRIPTION
  Log out

EXAMPLES
  $ dotenv-vault logout
```

CopyCopied!

##### FLAGS

_-y, --yes_

Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

```
$ npx dotenv-vault logout -y
```

CopyCopied!

Was this page helpful?

Yes

No

Previous login

Next open

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension