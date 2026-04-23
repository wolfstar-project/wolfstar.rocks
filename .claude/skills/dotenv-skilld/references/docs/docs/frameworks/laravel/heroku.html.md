Deploy a Laravel App to Heroku | Dotenv

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

##### Frameworks › Laravel

# Deploy a Laravel App to Heroku

Deploy a Laravel app with an encrypted .env.vault file to Heroku.

Find a complete code example on GitHub for this guide.

## Initial setup

Install Laravel and create a new Laravel project.

```
composer create-project laravel/laravel yourapp
```

CopyCopied!

Add a `Procfile` to run your Laravel app.

### Procfile

```yaml
web: heroku-php-apache2 public/
```

CopyCopied!

Edit `resources/views/welcome.blade.php`.

### resources/views/welcome.blade.php

```php
Hello {{ env('HELLO') }}.
```

CopyCopied!

Create your project on Heroku.

```shell
heroku create
```

CopyCopied!

Generate a Laravel `APP_KEY` and set it on Heroku.

```bash
php artisan key:generate --show
heroku config:set APP_KEY='base64:1234...'
```

CopyCopied!

Commit everything to code and push it to Heroku.

```shell
git push heroku
```

CopyCopied!

yourapp.herokuapp.com



Once deployed, your app will say `'Hello .'` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install dotenv-vault-laravel

Require `dotenv-vault-laravel` in your `composer.json` file.

```shell
composer require davidcochrum/dotenv-vault-laravel
```

CopyCopied!

### composer.json

```php
...
"require": {
  "davidcochrum/dotenv-vault-laravel": "^1.1",
  ...
}
...
```

CopyCopied!

Add `HELLO=World` to the bottom of your `.env` file.

### .env

```shell
...
HELLO="World"
```

CopyCopied!

Try running it locally.

```shell
php artisan serve
INFO  Server running on [http://127.0.0.1:8000]
```

CopyCopied!

It should say `Hello World`.



Great! `ENV` now has the keys and values you defined in your `.env` file. That covers local development. Let's solve for production next.

## Build .env.vault

Push your latest `.env` file changes and edit your production secrets. Learn more about syncing `.env` files

```shell
npx dotenv-vault@latest new
npx dotenv-vault@latest push
npx dotenv-vault@latest open production
```

CopyCopied!

Use the compare environments feature to copy Laravel's development values to production. (Additionally, modify any production values as needed.)

www.dotenv.org



Next, modify `HELLO` to `production`.

www.dotenv.org



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

Set `DOTENV_KEY` on Heroku using the CLI.

```shell
heroku config:set DOTENV_KEY='dotenv://:key_1234…@dotenv.org/vault/.env.vault?environment=production'
```

CopyCopied!

Or use Heroku's UI.

www.heroku.com



## Deploy

Commit those changes safely to code and deploy.

That's it! On deploy, your `.env.vault` file will be decrypted and its production secrets injected as environment variables‚ just in time.

yourapp.herokuapp.com



You'll know things worked correctly when you see `Loading env from encrypted .env.vault` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

heroku logs --tail



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension