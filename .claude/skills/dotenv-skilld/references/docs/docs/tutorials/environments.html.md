Managing Environments | Dotenv

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
    - Run dotenv-vault open
    - Click Environment Dropdown Button
    - Edit Your Production Environment Variables
    - Set the Production Value
    - Pull .env.production
    - View .env.production file
    - Push .env.production file (optional)
  - Integrate everywhere
  - Adding teammates
  - Managing access
- Sign in

##### Tutorials

# Managing Environments

## Run dotenv-vault open

Open terminal, enter your project's root directory (where your .env.vault file is), and run dotenv-vault open.

```
$ npx dotenv-vault open
```

CopyCopied!



FYI: Not a developer? You can navigate to this page by visiting ui.dotenv.org. ## Click Environment Dropdown Button

Click the environment dropdown button labeled 'development' and then click 'production'.



## Edit Your Production Environment Variables

Click the edit icon next to the environment variable you want to edit.



FYI: You'll notice that your production environment variable names are already setup but with blank values. This is by design. Each time you add an environment variable to your .env file it gets copied over to your other environments. ## Set the Production Value

Enter a value and click 'Save changes'.



## Pull .env.production

Return to terminal and run dotenv-vault pull production.

```
$ npx dotenv-vault pull production

remote:   Securely pulling production... done
remote:   Securely pulled production (.env.production)
```

CopyCopied!

## View .env.production file

Run ls -al to view it.

```
$ ls -al
Jul 28 17:54 .
Jul 27 13:46 ..
Jul 27 14:51 .env
Jul 27 14:51 .env.me
Jul 28 18:09 .env.vault
Jul 28 18:09 .env.production
Jul 28 17:54 .gitignore
...
```

CopyCopied!



## Push .env.production file (optional)

Prefer to manage your non-development environments with the cli? Edit .env.production and run dotenv-vault push production.

```
$ npx dotenv-vault push production

remote:   Securely pushing production (.env.production)... done
remote:   Securely pushed production (.env.production)
```

CopyCopied!





That's it! Thanks for using dotenv-vault with multiple environments.

Was this page helpful?

Yes

No

Previous Sync .env files

Next Integrate everywhere

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension