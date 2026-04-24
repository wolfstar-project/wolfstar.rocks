Manage multiple environments | Dotenv

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
    - Create .env.production
    - Push
    - Open
    - Pull
    - Conclusion
    - Advanced Commands
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

# Manage multiple environments

Manage multiple environments like `.env.ci`, `.env.staging`, and `.env.production` with this quickstart guide.

     

## Create .env.production

Create a `.env.production` file.

### .env.production

```bash
# production
HELLO="Production"
```

CopyCopied!

edit .env.production



Next, push `.env.production` to its env vault.

## Push

Run the **push** command with the _environment_ argument.

```bash
npx dotenv-vault push production
```

CopyCopied!

npx dotenv-vault push production



This securely pushes your `.env.production` secrets to your project vault's _production_ environment.

Next, let's view your secrets in the UI.

## Open

Run the **open** command to view your production environment variables in the UI.

```bash
npx dotenv-vault open production
```

CopyCopied!

npx dotenv-vault open production



Just like the **push** command, you pass an additional _production_ environment argument to open directly to that environment's secrets.

Make a change in the UI and then pull the latest `.env.production` file.

## Pull

```bash
npx dotenv-vault pull production
```

CopyCopied!

npx dotenv-vault pull production



## Conclusion

Solid! You completed this quickstart guide – managing your secrets across multiple environments. I recommend learning how to load `.env` files in development next.

- Load `.env` files in development
- Add teammates to your projects

---

## Advanced Commands

Run the **help push** and **help pull** commands to see how you can further customize these commands.

```bash
npx dotenv-vault help push
npx dotenv-vault help pull
```

CopyCopied!

For example, a common need is to pull production secrets to a normal .env file. You can do so with this command.

```bash
npx dotenv-vault pull production .env
```

CopyCopied!

### Default environments

Every project comes with four default environments and their corresponding `.env.ENVIRONMENT` files.

- _development_ => `.env`
- _ci_ => `.env.ci`
- _staging_ => `.env.staging`
- _production_ => `.env.production`

Want to customize your default environments? You can do so from the ui.

You can push to each one by appending the environment name after **push**.

```bash
npx dotenv-vault push development
npx dotenv-vault push ci
npx dotenv-vault push staging
npx dotenv-vault push production
```

CopyCopied!

The same for pulling. Append the environment name after **pull**.

```bash
npx dotenv-vault pull development
npx dotenv-vault pull ci
npx dotenv-vault pull staging
npx dotenv-vault pull production
```

CopyCopied!

Appending your main environment (_development_) is redundant. The cli assumes the main environment when the environment argument is ommitted.

### Custom filenames

You can push and pull a different filename to each one by further appending the filename after the environment argument.

```bash
npx dotenv-vault push development .env.local
npx dotenv-vault pull ci secrets.txt
npx dotenv-vault push staging any-filename
npx dotenv-vault pull production .env
```

CopyCopied!

### DOTENV_ME flag

In some automation scenarios, you might not have a `.env.me` file present. In those cases you can pass the value of your `DOTENV_ME` credential to the cli using the `--dotenvMe` flag.

```bash
npx dotenv-vault pull --dotenvMe=me_1z1z1z
```

CopyCopied!

Big congrats! You have advanced knowledge now – when it comes to managing multiple environments and using the **push** and **pull** commands.

Was this page helpful?

Yes

No

Previous Sync

Next Load

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension