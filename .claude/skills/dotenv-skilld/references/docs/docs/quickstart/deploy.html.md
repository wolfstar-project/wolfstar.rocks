Deploy .env.vault files in production | Dotenv

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
    - Build .env.vault
    - Fetch DOTENV_KEY
    - Set DOTENV_KEY
    - Conclusion
    - FAQ
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

# Deploy .env.vault files in production

Deploy your encrypted `.env.vault` files to production (or staging or ci) using this quickstart guide.

     

## Build .env.vault

Begin by building your project's encrypted `.env.vault` file. It securely encrypts your secrets in a cloud-agnostic payload.

```bash
npx dotenv-vault build
```

CopyCopied!

Commit that safely to code.

```bash
git add .env.vault
git commit -am "Build encrypted .env.vault file for deploy"
```

CopyCopied!

Yes it safe AND recommended you commit the `.env.vault` file to code. It contains AES-256 GCM encrypted ciphers of your environment secrets - that are decrypted just-in-time using an environment `DOTENV_KEY`.

## Fetch `DOTENV_KEY`

Fetch your production decryption key - the `DOTENV_KEY` - to decrypt your `.env.vault` file.

```bash
npx dotenv-vault keys production
```

CopyCopied!

This will output your production `DOTENV_KEY`.

Use that `DOTENV_KEY` to run your application in production mode locally - as a quick test.

Node.js

Python

Ruby

Go

PHP

Rust

```bash
DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production' node index.js
# visit http://localhost:3000
```

CopyCopied!



You will know it is working if you see the log message `Loading env from encrypted .env.vault`.

Node.js

Python

Ruby

Go

PHP

Rust

```bash
$ quickstart: DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production' node index.js
[[\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)][INFO] Loading env from encrypted .env.vault
Example app listening on port 3000
```

CopyCopied!

The `DOTENV_KEY` decrypts the production contents of `.env.vault` and injects its secrets just-in-time to your running process. All that's left to do is set your `DOTENV_KEY` on your production server and deploy your code.

## Set `DOTENV_KEY`

Set your production `DOTENV_KEY` on your server. For example, on Heroku you set it with their cli.

```shell
$ heroku config:set DOTENV_KEY='dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production'
```

CopyCopied!

Here's a video showing the entire process.

Download the mp4 webm video.

## Conclusion

Congrats! You now understand how `.env.vault` files work.

This is much safer than syncing your secrets to third-parties where they could leak. CircleiCi had a secrets breach not long ago. `.env.vault` protects you from breaches like that. An attacker would have to get their hands on both your `DOTENV_KEY` AND your codebase.

In addition, you now have a single source of truth that is easy to manage. Make a change in the UI, run the build command, and redeploy. Spend less time juggling secrets and more time coding.

The best part is the technology is platform and framework agnostic. We've compiled a list of almost 100 guides (so far). Linked below are some of our most-visited guides. Click a logo and get started.

           

Thanks for using Dotenv!

---

## FAQ

### What happens if `DOTENV_KEY` is not set?

It gracefully falls back to loading from your `.env` file. This is the default for development so that you can focus on editing your `.env` file and save the `build` command until you are ready to deploy those environment variables changes.

### Should I commit my `.env.vault` file?

Yes. It is safe and recommended to do so. It contains your encrypted envs, and your vault identifier.

### Can I share the `DOTENV_KEY`?

No. It is the key that unlocks your encrypted environment variables. Be very careful who you share this key with. Do not let it leak.

### Should I commit my `.env` file?

No. We **strongly** recommend against committing your `.env` file to version control. It should only include environment-specific values such as database passwords or API keys. Your production database should have a different password than your development database.

Was this page helpful?

Yes

No

Previous Load

Next Node.js

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension