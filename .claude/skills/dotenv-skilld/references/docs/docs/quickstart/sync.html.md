Sync .env files | Dotenv

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
    - Create .env file
    - Set up .env.vault
    - Log in .env.vault
    - Push .env
    - Pull .env
    - Conclusion
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

##### Quickstart

# Sync .env files

Sync your `.env` files using this quickstart guide.

     

> In just a couple minutes, you'll be able to sync your `.env` files across machines, teams, and environments.
>
> I built dotenv-vault to scratch my own itch. I wanted it to be developer-first and cli-first (like a lot of my favorite dev tools). There's a bit of a learning curve with the cli (also like a lot of my favorite dev tools), but once you use it a couple times it becomes familiar, and I think you will like it. I hope you do. Let's get started together. ###### Mot
## Create .env file

Create a `.env` file.

### .env

```bash
# development
HELLO="World"
```

CopyCopied!

Next, set up it's `.env.vault`.

## Set up .env.vault

Run dotenv-vault's **new** command.

```bash
npx dotenv-vault new
```

CopyCopied!

npx dotenv-vault new



Running this command sets up your project on Dotenv and creates your project's `.env.vault` file. It will look like this.

### .env.vault

```ini
#/-------------------.env.vault---------------------/
#/         cloud-agnostic vaulting standard         /
#/--------------------------------------------------/
DOTENV_VAULT="vlt_1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a"
```

CopyCopied!

The `.env.vault` file uniquely identifies your project on Dotenv. You can think of it like a unique git url at GitHub. It identifies your project so that you and your teammates pull the correct `.env` file from Dotenv. Read more about `.env.vault` files.

Next, log in to your `.env.vault`.

## Log in .env.vault

Run the **login** command.

```bash
npx dotenv-vault login
```

CopyCopied!

npx dotenv-vault login



Running this command authenticates you against your project on Dotenv and securely generates your `.env.me` credential. Your `.env.me` file will look like this.

### .env.me

```ini
#/!!!!!!!!!!!!!!!!!!!!.env.me!!!!!!!!!!!!!!!!!!!!!!!/
#/ credential file. DO NOT commit to source control /
#/--------------------------------------------------/
DOTENV_ME="me_1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z1z"
```

CopyCopied!

The `.env.me` file uniquely authorizes you to access your project's env vault. You can think of it like your unique SSH key at GitHub. It identifies your machine so that you can safely and securely sync your `.env` file from Dotenv. Read more about `.env.me` files.

Next, push your `.env` file.

## Push .env

Run the **push** command.

```bash
npx dotenv-vault push
```

CopyCopied!

npx dotenv-vault push



This securely pushes your `.env` file to your Dotenv Account. It works a lot like git.

## Pull .env

You can pull the latest changes too. Run the **pull** command.

```bash
npx dotenv-vault pull
```

CopyCopied!

npx dotenv-vault pull



## Conclusion

Congrats! You synced your `.env` file and completed this quickstart guide. What's next? I recommend learning how to manage multiple environments like `.env.production` next.

- Manage multiple environments like `.env.production`
- Add teammates to your projects

Thanks for using Dotenv!

Was this page helpful?

Yes

No

Previous Addons

Next Environments

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension