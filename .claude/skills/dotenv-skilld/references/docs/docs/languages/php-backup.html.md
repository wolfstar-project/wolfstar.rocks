PHP | Dotenv

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

##### Language Guides

# PHP

ⓘ This guide assumes you are already familiar with phpdotenv. It extends it with phpdotenv-vault.

##  Install

```shell
$ composer require dotenv-org/phpdotenv-vault
```

CopyCopied!

##  Usage (.env)

Development usage works just like phpdotenv.

Add your application configuration to your `.env` file in the root of your project:

```shell
S3_BUCKET=YOURS3BUCKET
SECRET_KEY=YOURSECRETKEYGOESHERE
```

CopyCopied!

When your application loads, these variables will be available in `os.environ` or `os.getenv`:

```python
s3_bucket = os.getenv("S3_BUCKET")
print(s3_bucket)
```

CopyCopied!

##  Deploying

Encrypt your environment variables by doing:

```shell
npx dotenv-vault build
```

CopyCopied!

This will create an encrypted `.env.vault` file along with a `.env.keys` file containing the encryption keys. Set the `DOTENV_KEY` environment variable by copying and pasting the key value from the `.env.keys` file onto your server or cloud provider. For example in heroku:

```shell
heroku config:set DOTENV_KEY=<key string from .env.keys>
```

CopyCopied!

Commit your .env.vault file safely to code and deploy. Your .env.vault fill be decrypted on boot, its environment variables injected, and your app work as expected.

Note that when the `DOTENV_KEY` environment variable is set, environment settings will _always_ be loaded from the `.env.vault` file in the project root. For development use, you can leave the `DOTENV_KEY` environment variable unset and fall back on the `dotenv` behaviour of loading from `.env`.

##  Manage Multiple Environments

Sync your .env file. Run the push command and follow the instructions. learn more

```
$ npx dotenv-vault push
```

CopyCopied!

Manage multiple environments with the included UI. learn more

```
$ npx dotenv-vault open
```

CopyCopied!

Build your `.env.vault` file with multiple environments.

```
$ npx dotenv-vault build
```

CopyCopied!

Access your `DOTENV_KEY`.

```
$ npx dotenv-vault keys
```

CopyCopied!

Set the production `DOTENV_KEY` on your server, recommit your `.env.vault` file to code, and deploy. That's it!

##  FAQ

#### What happens if `DOTENV_KEY` is not set?

Dotenv Vault gracefully falls back to phpdotenv when `DOTENV_KEY` is not set. This is the default for development so that you can focus on editing your `.env` file and save the `build` command until you are ready to deploy those environment variables changes.

#### Should I commit my `.env` file?

No. We **strongly** recommend against committing your `.env` file to version control. It should only include environment-specific values such as database passwords or API keys. Your production database should have a different password than your development database.

#### Should I commit my `.env.vault` file?

Yes. It is safe and recommended to do so. It contains your encrypted envs, and your vault identifier.

#### Can I share the `DOTENV_KEY`?

No. It is the key that unlocks your encrypted environment variables. Be very careful who you share this key with. Do not let it leak.

Was this page helpful?

Yes

No

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension