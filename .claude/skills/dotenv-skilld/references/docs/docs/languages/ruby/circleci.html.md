CI/CD in Ruby with CircleCI | Dotenv

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

##### Languages › Ruby

# CI/CD in Ruby with CircleCI

Run Ruby CI/CD in CircleCI with an encrypted .env.vault file

Find a complete code example on GitHub for this guide.

## Initial setup

Create a `build.rb` file. It's a very simple build script that outputs 'Hello World'.

### build.rb

```ruby
# build.rb
puts "Hello #{ENV["HELLO"]}"
```

CopyCopied!

Create a `Gemfile`.

### Gemfile

```ruby
# frozen_string_literal: true

source "https://rubygems.org"
```

CopyCopied!

Run `bundle install` to generate the `Gemfile.lock`.

```
bundle install
```

CopyCopied!

Create a `.circleci/config.yml` file.

### .circleci/config.yml

```yaml
# .circleci/config.yml
version: 2.1
orbs:
  ruby: circleci/ [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)
jobs:
  build:
    docker:
      - image: cimg/ruby:2.7.3
    steps:
      - checkout
      - ruby/install-deps
      - run:
          name: Ruby build
          command: ruby build.rb
```

CopyCopied!

Commit all that to code and push to GitHub. Then connect your GitHub repo to CircleCI.

app.circleci.com



app.circleci.com



Once pushed, the CircleCI build will say `'Hello '` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install dotenv-vault

Install `dotenv-vault`.

```shell
bundle add dotenv-vault
```

CopyCopied!

Create a `.env` file in the root of your project.

### .env

```shell
# .env
HELLO="World"
```

CopyCopied!

As early as possible in your application, import and configure `dotenv-vault` along with `bundler/setup`.

### build.rb

```ruby
# build.rb
require "bundler/setup"
require "dotenv-vault/load"
puts "Hello #{ENV["HELLO"]}"
```

CopyCopied!

Try running it locally.

```shell
ruby build.rb
Hello World
```

CopyCopied!

Perfect. `ENV` now has the keys and values you defined in your `.env` file.

That covers local simulation of the CI. Let's solve for the real CI environment next.

## Build .env.vault

Push your latest `.env` file changes and edit your CI secrets. Learn more about syncing

```shell
npx dotenv-vault@latest push
npx dotenv-vault@latest open ci
```

CopyCopied!

Use the UI to configure those secrets per environment.

dotenv.org



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

# ci
DOTENV_VAULT_CI="x26PuIKQ/xZ5eKrYomKngM+dO/9v1vxhwslE/zjHdg3l+H6q6PheB5GVDVIbZg=="
DOTENV_VAULT_CI_VERSION=2
```

CopyCopied!

## Set DOTENV_KEY

Fetch your CI `DOTENV_KEY`.

```shell
npx dotenv-vault@latest keys ci
# outputs: dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=ci
```

CopyCopied!

Set `DOTENV_KEY` on CircleCI.

app.circleci.com



## Build CI

Commit those changes safely to code and rerun the build.

That's it! On rerun, your `.env.vault` file will be decrypted and its CI secrets injected as environment variables – just in time. It will say `Hello ci`.

app.circleci.com build



You'll know things worked correctly when you see `'Loading env from encrypted .env.vault'` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension