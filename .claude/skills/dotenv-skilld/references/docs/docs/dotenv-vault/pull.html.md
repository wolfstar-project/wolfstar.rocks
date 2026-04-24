dotenv-vault pull | Dotenv

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
    - Usage
    - Command Details
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

# dotenv-vault pull

Pull .env securely with dotenv-vault.

## Usage

#### 1. Run pull command

```
$ npx dotenv-vault pull

remote:   Securely pulling... done
remote:   Securely pulled development (.env)
```

CopyCopied!

#### 2. View .env (optional)

You now have a .env file in the root of your project. The .env file holds your environment variables - their names and secrets.

Run ls -al to view it.

```
$ ls -al
Jul 28 17:54 .
Jul 27 13:46 ..
Jul 27 14:51 .env
Jul 28 18:11 .env.me
Jul 28 18:09 .env.vault
Jul 28 17:54 .gitignore
...
```

CopyCopied!



That's it!

---

## Command Details

For more information on the pull command, run dotenv-vault help pull.

```
$ npx dotenv-vault help pull
Pull .env securely

USAGE
  $ dotenv-vault pull [ENVIRONMENT] [FILENAME] [-m ] [-y]

ARGUMENTS
  ENVIRONMENT  Set environment to pull from. Defaults to development
  FILENAME     Set output filename. Defaults to .env for development and .env.{environment} for other environments

FLAGS
  -m, --dotenvMe=         Pass .env.me (DOTENV_ME) credential directly (rather than reading from .env.me file)
  -y, --yes               Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

DESCRIPTION
  Pull .env securely

EXAMPLES
  $ dotenv-vault pull
```

CopyCopied!

##### ARGUMENTS

_[ENVIRONMENT]_

Set environment to pull from. Defaults to development

```
$ npx dotenv-vault pull production
```

CopyCopied!

_[FILENAME]_

Set output filename. Defaults to .env for development and .env.[ENVIRONMENT] for other environments

```
$ npx dotenv-vault pull production .env.production
```

CopyCopied!

##### FLAGS

_-m, --dotenvMe_

Pass .env.me (DOTENV_ME) credential directly (rather than reading from .env.me file)

```
$ npx dotenv-vault pull --dotenvMe=me_b1831e‚Ä¶
```

CopyCopied!

_-y, --yes_

Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

```
$ npx dotenv-vault pull -y
```

CopyCopied!

Was this page helpful?

Yes

No

Previous push

Next build

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension