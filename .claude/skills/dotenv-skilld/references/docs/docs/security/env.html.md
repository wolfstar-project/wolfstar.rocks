.env | Dotenv

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
    - Example
    - Extending .env
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

##### Security

# .env

The .env file format is central to good DSX and has been since it was introduced by Heroku in 2012 and popularized by the dotenv node module (and other libraries) in 2013.

The .env file format starts where the developer starts - in development. It is added to each project but NOT committed to source control. This gives the developer a single secure place to store sensitive application secrets.

Can you believe that prior to introducing the .env file, almost all developers stored their secrets as hardcoded strings in source control. That was only 10 years ago!

## Example

Here's an example of what a .env file looks like:

```
# example .env file
STRIPE_API_KEY=scr_12345
TWILIO_API_KEY=abcd1234
```

CopyCopied!

It is purposefully simple because, as security professionals, we know that complexity is the enemy of security.

You can read more about how it works here (or at other implementations here, here, here). It is the gold standard for securing development secrets - proven and trusted by millions of developers around the world.

But the world has changed and developers manage secrets at far greater scale than a decade ago. Today it's difficult to securely share .env files between machines, environments, and team members. As a result, developers often share secrets over Slack, email, text message, and post-it notes. It's not scaleable and fraught with security risks. For a CTO or CSO it is a risk they should not take.

## Extending .env

Luckily, that is changing. We have been extending the .env file format to support secure sharing.

The .env file format will still be at the center of security. But we have added two new extensions. They are not required. They are optional, but we highly recommend them for teams. They are the:

- .env.vault extension
- .env.me extension

In the next set of security docs you can read about how these work alongside your .env files to significantly improve security. This is the next great leap forward in application secrets security, and like the original .env file format we have worked hard to minimize complexity in order to increase security.

Was this page helpful?

Yes

No

Previous help

Next .env.vault

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension