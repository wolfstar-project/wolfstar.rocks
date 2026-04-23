Security | Dotenv

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

##### dotenv-vault

# Security

Security is an evermoving target - an arms race. But that doesn't mean it should be hard to use. Good design can make complex things simple, and that is what we are after at Dotenv.

### Background

Dotenv is a security tool. It has been since it was first developed in 2013. We saw developers struggling to keep their secrets safe so we pioneered the `.env` file format standard. The design led to better DSX (Developer Security Experience) - which led to safer secrets for millions of developers.

### Problem

What is the problem with `.env` files today? The world has changed. Developers manage secrets at greater scale than a decade ago. `.env` files are not easily shareable between machines, environments, and team members. As a result, developers often share secrets over Slack and email. It's not scaleable and fraught with security risks. For a CTO or CSO it is a risk they should not take.

### Competing Solutions

The other side of the coin is not so good either. Complex security software like HashiCorp Vault is difficult to fully understand and introduces new friction, complexities, and attack vectors. Friction and complexity almost always lead to negative security events because people are lazy.

But another word for lazy in software is elegance. Developers often chose `.env` because it was an elegant security alternative. Elegance has a great deal of value when it comes to security because it increases the likelihood of an individual working toward security rather than against it.

So all this said, we have an elegant solution for yesteryear and new problems today. What do we do?

### The .env.vault Solution

We've decided to introduce the `.env.vault` file format and a few supporting file formats to make syncing, encrypting, and deploying your secrets elegant and safe at modern scale.

It's an exciting development, and we hope you come on this journey with us. We remember when people were telling us the `.env` file was unnecesary, too simple, just put your secrets in code !, etc.

Today the `.env.vault` is predictably getting some of the same pushback, but we are just as confident the `.env.vault` file format standard will follow the same adoption trajectory as the `.env` file format.

Get involved early with its development and usage! Try it out, contribute to its development, and keep your secrets safer.

### .env

Tried and true. For development secrets

Read more

### .env.vault

Modern encryption standard for deploying secrets just-in-time

Read more

### .env.me

Authorizes you to access a project's shared .env file

Read more

### DOTENV_KEY

The DOTENV_KEY unlocks your encrypted .env.vault secrets

Read more

### Integration Tokens

Integration tokens, also known as IT tokens, are limited access tokens

Read more

### Vault

Vault stores your secrets securely

Read more

Was this page helpful?

Yes

No

Previous CLI

Next Features

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension