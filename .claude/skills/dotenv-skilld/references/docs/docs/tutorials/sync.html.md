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
    - Run dotenv-vault new
    - Name your project
    - View .env.vault file (optional)
    - Run dotenv-vault login
    - Click log in
    - View .env.me file (optional)
    - Run dotenv-vault push
    - Run dotenv-vault open (bonus)
  - Manage environments
  - Integrate everywhere
  - Adding teammates
  - Managing access
- Sign in

##### Tutorials

# Sync .env files

## Run dotenv-vault new

Open terminal, enter your project's root directory (where you keep your .env file), and run dotenv-vault new.

```
$ npx dotenv-vault new
```

CopyCopied!

FYI: npx is a very powerful command that lets you run code built with NodeJS and published through the npm registry. ## Name your project

On the page that opens, name your project (typically prefilled for you), and enter your email address.



## View .env.vault file (optional)

A .env.vault was generated for your project. It uniquely identifies your project in dotenv-vault. Think of it like a unique git url at GitHub. It identifies your project so that you (and your teammates) pull the correct .env from dotenv-vault.

Run ls -al to view it.

```
$ ls -al
Jul 28 17:54 .
Jul 27 13:46 ..
Jul 27 14:51 .env
Jul 28 18:09 .env.vault
Jul 28 17:54 .gitignore
Jul 27 14:49 index.js
Jul 27 14:12 node_modules
Jul 27 14:48 package-lock.json
Jul 27 14:12 package.json
```

CopyCopied!



## Run dotenv-vault login

Next, authenticate your machine by running dotenv-vault login.

```
$ npx dotenv-vault login
```

CopyCopied!

## Click log in

On the next screen, follow the login process and click 'Log in'.



## View .env.me file (optional)

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
Jul 27 14:49 index.js
Jul 27 14:12 node_modules
Jul 27 14:48 package-lock.json
Jul 27 14:12 package.json
```

CopyCopied!



## Run dotenv-vault push

Return one last time to terminal and run dotenv-vault push.

This will securely push your .env file to dotenv-vault. Each time you change your .env file, run dotenv-vault push.

```
$ npx dotenv-vault push

remote:   Securely pushing (.env)... done
remote:   Securely pushed development (.env)

Run npx dotenv-vault open to view in the ui
```

CopyCopied!

Congratulations , you just pushed (and secured) your first .env file in dotenv-vault.

ProTip: For a list of all available commands, run npx dotenv-vault help. ## Run dotenv-vault open (bonus)

Let's check out the UI. Run dotenv-vault open.

```
$ npx dotenv-vault open
```

CopyCopied!



That's it! Thanks for using dotenv-vault.

Was this page helpful?

Yes

No

Previous Sync to Vercel

Next Manage environments

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension