dotenv-vault versions | Dotenv

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
    - Usage
    - Command Details
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

# dotenv-vault versions

List version history for your project in dotenv-vault.

## Usage

#### 1. Run versions command

```
$ npx dotenv-vault versions

remote:   Listing versions... done
Ver    Change                                                                By                           When
────── ───────────────────────────────────────────────────────────────────── ────────────────────── ────────────────────
v35    AIRBRAKE_API_KEY,STRIPE_API_KEY,LOCKBOX_MASTER_KEY,SECRET_S3          [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-05-04T19:25:56Z
v33    SECRET_S3                                                             [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-03-14T07:35:42Z
v31    STRIPE_API_KEY                                                        [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-03-14T07:34:05Z
v30    S3_KEY                                                                [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-03-14T07:33:51Z
v29    AIRBRAKE_API_KEY                                                      [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-03-14T07:33:13Z
v28    S3_KEY                                                                [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-03-14T07:32:10Z
v27    AIRBRAKE_PROJECT_ID,AIRBRAKE_API_KEY,STRIPE_API_KEY,GIVEBRIGHTER_HOST [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-03-14T07:32:09Z
v26    STRIPE_API_KEY                                                        [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection) 2022-03-14T07:30:31Z
...
Pull a version with npx dotenv-vault pull development@v35
```

CopyCopied!

That's it!

---

## Command Details

For more information on the versions command, run dotenv-vault help versions.

```
$ npx dotenv-vault help versions
List version history

USAGE
  $ dotenv-vault versions [ENVIRONMENT] [-m ] [-y]

ARGUMENTS
  ENVIRONMENT  Set environment to check versions against. Defaults to development

FLAGS
  -m, --dotenvMe=         Pass .env.me (DOTENV_ME) credential directly (rather than reading from .env.me file)
  -y, --yes               Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

DESCRIPTION
  List version history

EXAMPLES
  $ dotenv-vault versions
```

CopyCopied!

##### ARGUMENTS

_[ENVIRONMENT]_

Set environment to check versions against. Defaults to development

```
$ npx dotenv-vault versions production
```

CopyCopied!

##### FLAGS

_-m, --dotenvMe_

Pass .env.me (DOTENV_ME) credential directly (rather than reading from .env.me file)

```
$ npx dotenv-vault versions --dotenvMe=me_b1831e…
```

CopyCopied!

_-y, --yes_

Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

```
$ npx dotenv-vault versions -y
```

CopyCopied!

Was this page helpful?

Yes

No

Previous rotatekey

Next whoami

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension