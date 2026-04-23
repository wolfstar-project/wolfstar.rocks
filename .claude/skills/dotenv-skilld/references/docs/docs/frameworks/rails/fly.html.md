Deploy a Rails App to Fly.io | Dotenv

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

##### Frameworks › Rails

# Deploy a Rails App to Fly.io

Deploy a Rails app with an encrypted .env.vault file to Fly.io.

Find a complete code example on GitHub for this guide.

## Initial setup

Install Rails.

```
gem install rails
```

CopyCopied!

Create a new Rails project.

```
rails new yourapp
```

CopyCopied!

Edit `config/routes.rb` and set root to `www#index`.

### config/routes.rb

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  root "www#index"
end
```

CopyCopied!

Create `app/controllers/www_controller.rb`.

### app/controllers/www_controller.rb

```ruby
class WwwController < ApplicationController
  def index
  end
end
```

CopyCopied!

Create `app/views/www/index.html.erb`.

### app/views/www/index.html.erb

```erb
Hello <%= ENV["HELLO"] %>.
```

CopyCopied!

Commit that to code and push it to Fly.io.

```shell
brew install flyctl
flyctl launch
flyctl deploy --remote-only --no-cache
```

CopyCopied!

yourapp.fly.dev



Once deployed, your app will say `'Hello .'` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install dotenv-vault-rails

Add `dotenv-vault-rails` to the top of your Gemfile.

### Gemfile

```ruby
source "https://rubygems.org"
ruby "3.1.3"
gem "dotenv-vault-rails", require: "dotenv-vault/rails-now"
gem "rails", "~> 7.1.1"
...
```

CopyCopied!

```shell
bundle install
```

CopyCopied!

Create a `.env` file in the root of your project.

### .env

```shell
# .env
HELLO="World"
```

CopyCopied!

Try running it locally.

```shell
bin/rails server
=> Booting Puma
=> Rails 7.1.1 application starting in development
* Listening on http://127.0.0.1:3000
* Listening on http://[::1]:3000
```

CopyCopied!

It should say `Hello World`.



Great! `ENV` now has the keys and values you defined in your `.env` file. That covers local development. Let's solve for production next.

## Build .env.vault

Push your latest `.env` file changes and edit your production secrets. Learn more about syncing

```shell
npx dotenv-vault@latest push
npx dotenv-vault@latest open production
```

CopyCopied!

Use the UI to configure those secrets per environment.

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

Set `DOTENV_KEY` on Fly.io.

```shell
flyctl secrets set RAILS_ENV=production DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production'
```

CopyCopied!

## Deploy

Commit those changes safely to code and deploy again.

```shell
flyctl deploy --remote-only --no-cache
```

CopyCopied!

That's it! On deploy, your `.env.vault` file will be decrypted and its production secrets injected as environment variables‚ just in time.

yourapp.fly.dev



You'll know things worked correctly when you see `Loading env from encrypted .env.vault` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

flyctl logs



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension