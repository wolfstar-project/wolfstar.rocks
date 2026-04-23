dotenv-vault rotatekey | Dotenv

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
    - Usage
    - Command Details
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

##### CLI

# dotenv-vault rotatekey

Rotate a project environment's DOTENV_KEY.

## Usage

#### 1. Run rotatekey command

Specify the environment. In the example below, we're rotating our production DOTENV_KEY.

```
$ npx dotenv-vault rotatekey production
remote:   Rotating decryption key... done
dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production

1. Update DOTENV_KEY by comma-appending the new value
2. Rebuild and deploy your .env.vault file
3. Update DOTENV_KEY by removing the old value

Example:
DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production,dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production'
```

CopyCopied!



#### 2. Append the new DOTENV_KEY

Open your server where you have previously set your **DOTENV_KEY** value. Comma-append the new value.

For example, here is how you might set it on Heroku.

```
heroku config:set DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production,dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production'
```

CopyCopied!

Note that the new value comes after the old one. The order doesn't matter, but we recommend placing the new value at the end so that you remember to delete the old (leading) value after you deploy.

#### 3. Build and deploy

Next, we need to rebuild our encrypted .env.vault file with the new encryption key. Run dotenv-vault build.

```
$ npx dotenv-vault build
```

CopyCopied!

Commit those changes safely to code and deploy.

That's it! Your code will now be running off the new DOTENV_KEY.

#### 4. Clean up old value

It is a good idea to clean up the old value.

Return to your server and remove the old value inside the comma-separated list **DOTENV_KEY**. In heroku, it might look like this:

```
heroku config:set DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production'
```

CopyCopied!

Nice work rotating your keys! If you really want to go the extra mile you can automate this into your CI/CD process. That way you rotate your decryption key on some set schedule - every quarter for example.

---

## Command Details

For more information on the rotatekey command, run dotenv-vault help rotatekey.

```
$ npx dotenv-vault help rotatekey
Rotate DOTENV_KEY

USAGE
  $ dotenv-vault rotatekey [ENVIRONMENT] [-m ] [-y]

ARGUMENTS
  ENVIRONMENT  Set environment to rotate. Required.

FLAGS
  -m, --dotenvMe=  Pass .env.me (DOTENV_ME) credential directly (rather than reading from .env.me file)
  -y, --yes               Automatic yes to prompts. Assume yes to all prompts and run non-interactively.

DESCRIPTION
  Rotate DOTENV_KEY

EXAMPLES
  $ dotenv-vault rotatekey
```

CopyCopied!

Was this page helpful?

Yes

No

Previous keys

Next versions

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension