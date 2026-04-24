CI/CD in Node.js with Jenkins | Dotenv

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
    - Initial setup
    - Install dotenv
    - Build .env.vault
    - Set DOTENV_KEY
    - Build CI
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

##### Languages › Node.js

# CI/CD in Node.js with Jenkins

Run Node.js CI/CD on Jenkins with an encrypted .env.vault file

## Initial setup

Create a `Jenkinsfile` file.

### Jenkins

```js
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
    }
}
```

CopyCopied!

If you're on Windows, replace the `sh` command with `powershell`.

Create a `build.js` file. It's a very simple build script that outputs 'Hello World'.

### build.js

```js
// build.js
console.log(\`Hello ${process.env.HELLO}\`)
```

CopyCopied!

Create a `package.json` file.

### package.json

```json
{
  "scripts": {
    "build": "node build.js"
  }
}
```

CopyCopied!

Push it up to Jenkins.

## Install dotenv

Install `dotenv`.

```shell
npm install dotenv --save # Requires dotenv >= 16.1.0
```

CopyCopied!

Create a `.env` file in the root of your project.

### .env

```shell
# .env
HELLO="World"
```

CopyCopied!

As early as possible in your application, import and configure dotenv.

### build.js

```js
// build.js
require('dotenv').config()
console.log(process.env) // remove this after you've confirmed it is working

console.log(\`Hello ${process.env.HELLO}\`)
```

CopyCopied!

Try running it locally.

```shell
node build.js
{
  ...
  HELLO: 'World'
}
Hello World
```

CopyCopied!

Perfect. `process.env` now has the keys and values you defined in your `.env` file.

That covers local simulation of the CI. Let's solve for the real CI environment next.

## Build .env.vault

Push your latest `.env` file changes and edit your CI secrets. Learn more about syncing

```shell
npx dotenv-vault@latest push
npx dotenv-vault@latest open ci
```

CopyCopied!

Use the UI to configure those secrets per environment.

dotenv.org



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

# ci
DOTENV_VAULT_CI="x26PuIKQ/xZ5eKrYomKngM+dO/9v1vxhwslE/zjHdg3l+H6q6PheB5GVDVIbZg=="
DOTENV_VAULT_CI_VERSION=2
```

CopyCopied!

## Set DOTENV_KEY

Fetch your CI `DOTENV_KEY`.

```shell
npx dotenv-vault@latest keys ci
# outputs: dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=ci
```

CopyCopied!

Set `DOTENV_KEY` on Jenkins.

jenkins ui



There are multiple optional ways to do this with Jenkins - as part of a build step, as a node property, or as a global setting. Choose what works best for your situation.

Applying the decryption key to a build step will make it active only during that particular step, during node activity when set as a node property, and for every action as a global setting.

You can set it in a build step via the Blue Ocean interface, or the Jenkinsfile, in a node property via Dashboard/Manage Jenkins/Nodes/NODE_NAME, and in the global settings via Dashboard/Manage Jenkins/Configure System.

Once you’ve chosen a preferred location, put DOTENV_KEY as the key and save the decryption key you obtained earlier for the value field.

## Build CI

Commit those changes safely to code and rerun the build.

That's it! On rerun, your `.env.vault` file will be decrypted and its CI secrets injected as environment variables – just in time.

jenkins ui



You'll know things worked correctly when you see `'Loading env from encrypted .env.vault'` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

Previous Google Cloud Build

Next Pulumi

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension