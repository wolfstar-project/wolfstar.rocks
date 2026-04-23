.env.me | Dotenv

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
    - Example
    - Generating
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

##### Security

# .env.me

The .env.me file uniquely authorizes you to access a project's shared .env file. You can think of it like your unique SSH key at GitHub.

But the .env.me credential has stricter security measures than GitHub's SSH key. The GitHub SSH key allows FULL access to all your repositories. We think this is too dangerous. So we have limited the authorization scope.

The .env.me credential authorizes your machine against a single project. In other words, for each unique project on your machine you will have a unique .env.me credential file. These are generated via the cli (and in some cases the ui) and through a proven authentication method - minimizing the complexity of managing multiple credentials.

This is all by design. This way if an attacker somehow gets access to your .env.me credential (maybe you accidently committed it to source control), they are not getting access to all your secrets. You can then rotate your .env.me credential for that project only, manually rotate or auto-rotate (coming soon) that project's secrets, and be on your way. As a CTO, CSO, or startup founder this helps you mitigate the fallout from a security leak - setting you apart from others. In fact, your security hygiene will be better than most banks and fortune 500 companies in this regard.

## Example

Here's an example of what a .env.me file looks like:

```
DOTENV_ME=me_b1831e4…
```

CopyCopied!

The first thing you might notice is the formatting is the same as a .env file. This is intentional to allow for maximum future interoperability - just like the .env.vault file.

The DOTENV_ME key will be the only value this file contains. Keep it safe and out of source control - just like your .env file.

## Generating

You can generate a .env.me file at vault.dotenv.org or using dotenv-vault. The authorization flow follows a similar pattern to world class authorization flows found in cli tools like Heroku's cli and Vercel's cli. It is both secure and simple.

Was this page helpful?

Yes

No

Previous .env.vault

Next DOTENV_KEY

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension