Deploy a Rocket App to Heroku | Dotenv

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
    - Initial setup
    - Install dotenv-vault
    - Build .env.vault
    - Set DOTENV_KEY
    - Deploy
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

##### Frameworks › Rocket

# Deploy a Rocket App to Heroku

Deploy a Rocket app with an encrypted .env.vault file to Heroku.

Find a complete code example on GitHub for this guide.

## Initial setup

Install rocket.

```
cargo new yourapp
cd yourapp
cargo add rocket
```

CopyCopied!

Rocket uses advanced Rust features so install the nightly version of Rust.

```
rustup override set nightly
```

CopyCopied!

Modify `src/main.rs` file with the web server code.

### sr/main.rs

```rust
#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

#[get("/")]
fn index() -> String {
    let hello = std::env::var("HELLO").unwrap_or("".to_string());
    format!("Hello {}.", hello)
}

fn main() {
    rocket::ignite().mount("/", routes![index]).launch();
}
```

CopyCopied!

Add a `Procfile` to run your app on Heroku.

### Procfile

```yaml
web: ROCKET_PORT=$PORT ROCKET_KEEP_ALIVE=0 ./target/release/yourapp
```

CopyCopied!

Create a `rust-toolchain` file to tell Heroku to run the nightly rust version.

### rust-toolchain

```yaml
nightly-2023-11-15
```

CopyCopied!

Commit that to code, set the rust buildpack, and push it to Heroku.

```shell
heroku create
heroku buildpacks:set emk/rust
git push heroku
```

CopyCopied!

yourapp.herokuapp.com



Once deployed, your app will say `Hello .` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install dotenv-vault

Install `dotenv-vault`.

```shell
cargo add dotenv-vault
```

CopyCopied!

Create a `.env` file in the root of your project.

### .env

```shell
# .env
HELLO="World"
```

CopyCopied!

As early as possible in your `main` function, load dotenv.

### src/main.rs

```rust
...

fn main() {
    let _ = dotenv_vault::dotenv();

    rocket::ignite().mount("/", routes![index]).launch();
}
```

CopyCopied!

Try running it locally.

```shell
cargo run

Rocket has launched from http://localhost:8000
```

CopyCopied!

It should say `Hello World.`.



Great! `process.env` now has the keys and values you defined in your `.env` file. That covers local development. Let's solve for production next.

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



You'll know things worked correctly when you see `'Loading env from encrypted .env.vault'` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

heroku logs --tail



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

Previous Sinatra

Next AWS Lambda

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension