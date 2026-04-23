dotenv-vault login | Dotenv

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
    - Usage
    - Command Details
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

# dotenv-vault login

Log in to dotenv-vault.

## Usage

#### 1. Run login command

```
$ npx dotenv-vault login

local:    Press y (or any key) to open up the browser to login and generate credential (.env.me) or q to exit: y
local:    Opening browser to https://vault.dotenv.org/login?DOTENV_VAULT=vlt_6beaa5‚Ä¶
local:    Waiting for login and credential (.env.me) to be generated... ‚°ø
```

CopyCopied!

#### 2. Click log in

On the next screen, follow the login process and click 'Log in'.



#### 3. View .env.me (optional)

You now have a .env.me file in the root of your project. The .env.me file uniquely authorizes you to access a project's shared .env file. You can think of it like your unique SSH key at GitHub.

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

For more information on the login command, run dotenv-vault help login.

```
$ npx dotenv-vault help login
Log in to dotenv-vault

USAGE
  $ dotenv-vault login [DOTENV_ME] [-y]

ARGUMENTS
  DOTENV_ME  Set .env.me credential. Defaults to generated value.

FLAGS
  -y, --yes  Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

DESCRIPTION
  Log in to dotenv-vault

EXAMPLES
  $ dotenv-vault login
```

CopyCopied!

##### ARGUMENTS

_[DOTENV_ME]_

Set .env.me identifier. Defaults to generated value.

```
$ npx dotenv-vault login me_00c7fa‚Ä¶
```

CopyCopied!

##### FLAGS

_-y, --yes_

Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

```
$ npx dotenv-vault login -y
```

CopyCopied!

Was this page helpful?

Yes

No

Previous new

Next logout

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension