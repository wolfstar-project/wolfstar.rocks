dotenv-vault new | Dotenv

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
    - Usage
    - Command Details
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

##### CLI

# dotenv-vault new

Create a .env.vault for your project. Keep your secrets safe in it.

## Usage

#### 1. Run new command

```
$ npx dotenv-vault new

local:    Press y (or any key) to open up the browser to create a new project vault (.env.vault) or q to exit: y
local:    Opening browser to https://vault.dotenv.org/new?project_name=Name
local:    Waiting for project vault (.env.vault) to be created... ‚°ø
```

CopyCopied!

#### 2. Name your project

On the page that opens, name your project (typically prefilled for you), and enter your email address.



#### 3. View .env.vault (optional)

A .env.vault was generated for your project. It uniquely identifies your project in dotenv-vault. Think of it like a unique git url at GitHub. It identifies your project so that you (and your teammates) pull the correct .env from dotenv-vault.

Run ls -al to view it.

```
$ ls -al
Jul 28 17:54 .
Jul 27 13:46 ..
Jul 27 14:51 .env
Jul 28 18:09 .env.vault
Jul 28 17:54 .gitignore
...
```

CopyCopied!



That's it!

---

## Command Details

For more information on the new command, run dotenv-vault help new.

```
$ npx dotenv-vault help new
Create your project

USAGE
  $ dotenv-vault new [DOTENV_VAULT] [-y]

ARGUMENTS
  DOTENV_VAULT  Set .env.vault identifier. Defaults to generated value.

FLAGS
  -y, --yes  Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

DESCRIPTION
  Create your project

EXAMPLES
  $ dotenv-vault new
```

CopyCopied!

##### ARGUMENTS

_[DOTENV_VAULT]_

Set .env.vault identifier. Defaults to generated value.

```
$ npx dotenv-vault new vlt_6beaae5‚Ä¶
local:    Adding .env.vault (DOTENV_VAULT)... done
local:    Added to .env.vault (DOTENV_VAULT=vlt_6beaa...)
```

CopyCopied!

##### FLAGS

_-y, --yes_

Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

```
$ npx dotenv-vault new -y
```

CopyCopied!

Was this page helpful?

Yes

No

Previous Travis

Next login

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension