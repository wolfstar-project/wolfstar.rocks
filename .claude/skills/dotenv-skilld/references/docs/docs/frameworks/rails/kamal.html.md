Deploy a Rails App with Kamal | Dotenv

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

# Deploy a Rails App with Kamal

Deploy a Rails app with an encrypted .env.vault file with Kamal.

Find a complete code example on GitHub for this guide.

## Initial setup

Install Rails.

```
gem install rails
```

CopyCopied!

Create a new Rails project.

```
rails new kamal-example
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

Commit those changes safely to code. Next, we'll set up Kamal.

## Set up Kamal

Install Kamal.

```shell
gem install kamal
```

CopyCopied!

Initialize Kamal.

```shell
kamal init
```

CopyCopied!

Edit your `config/deploy.yml` file.

### config/deploy.yml

```yaml
# Name of your application. Used to uniquely configure containers.
service: kamal-example

# Name of the container image.
image: yourdockerorg/kamal-example

# Deploy to these servers. Replace with your server(s) ip address(es)
servers:
  - 5.78.32.32 # your_server_ip

# Credentials for your image host.
registry:
  # Specify the registry server, if you're not using Docker Hub
  # server: registry.digitalocean.com / ghcr.io / ...
  username: your_username_on_docker_hub

  # Always use an access token rather than real password when possible.
  password:
    - KAMAL_REGISTRY_PASSWORD

# Inject ENV variables into containers (secrets come from .env).
# Remember to run \`kamal env push\` after making changes!
# env:
#   clear:
#     DB_HOST: 192.168.0.2
#   secret:
#     - RAILS_MASTER_KEY
env:
  secret:
    - RAILS_MASTER_KEY

# https://dev.to/adrienpoly/deploying-a-rails-app-with-mrsk-on-hetzner-a-beginners-guide-39kp
volumes:
  - "storage:/rails/storage"
```

CopyCopied!

Make sure you can ssh to your server.

```shell
ssh root@your_server_ip
```

CopyCopied!

Then modify your `.env` file, setting your `KAMAL_REGISTRY_PASSWORD` to your docker registry's password and your `RAILS_MASTER_KEY`. Find your RAILS_MASTER_KEY at `config/master.key`.

### .env

```shell
KAMAL_REGISTRY_PASSWORD=your-docker-registry-password
RAILS_MASTER_KEY=11011070047a1cf7bacd3f7fd6bacd9b
```

CopyCopied!

Turn off `force_ssl`.

### config/environments/production.rb

```ruby
Rails.application.configure do
  ...
  # Assume all access to the app is happening through a SSL-terminating reverse proxy.
  # Can be used together with config.force_ssl for Strict-Transport-Security and secure cookies.
  # config.assume_ssl = true

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = false
  ...
end
```

CopyCopied!

Then run `kamal setup`.

```shell
kamal setup
```

CopyCopied!

This will bootstrap your server with everything it needs - docker and your Rails application.

Visit your server's ip address.

your_server_ip



Your app will say `'Hello .'` at **your_server_ip** as it doesn't have a way to access the environment variable yet. Let’s do that next.

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

Add `HELLO=World` to your `.env` file.

### .env

```shell
KAMAL_REGISTRY_PASSWORD=your-docker-registry-password
RAILS_MASTER_KEY=11011070047a1cf7bacd3f7fd6bacd9b
HELLO=World
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

localhost:3000



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

Set `DOTENV_KEY` for Kamal's `.env` file.

### .env

```shell
KAMAL_REGISTRY_PASSWORD=your-docker-registry-password
RAILS_MASTER_KEY=11011070047a1cf7bacd3f7fd6bacd9b
HELLO=World
DOTENV_KEY="dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production"
```

CopyCopied!

And `DOTENV_KEY` to Kamal's `config/deploy.yml` `env.secret` section.

### config/deploy.yml

```yaml
...
env:
  secret:
    - RAILS_MASTER_KEY
    - DOTENV_KEY
...
```

CopyCopied!

Push those `ENV` changes to Kamal.

```shell
kamal env push
```

CopyCopied!

## Deploy Kamal

Commit those changes safely to code and deploy with Kamal.

```shell
kamal deploy
```

CopyCopied!

That's it! On build and deploy, your `.env.vault` file will be decrypted and its production secrets injected as environment variables – just in time.

your_server_ip



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension