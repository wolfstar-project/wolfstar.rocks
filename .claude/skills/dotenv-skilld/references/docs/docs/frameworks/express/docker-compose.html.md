Deploy an Express.js App with Docker Compose | Dotenv

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

##### Frameworks › Express.js

# Deploy an Express.js App with Docker Compose

Deploy an Express.js app with an encrypted .env.vault file on Docker Compose.

Find a complete code example on GitHub for this guide.

## Initial setup

Install express.

```
npm install express --save
```

CopyCopied!

Create an `index.js` file with the web server code.

### index.js

```js
const PORT = process.env.PORT || 3000
const express = require('express')
const app = express()

app.listen(PORT, () => {
  console.log(\`Running on port ${PORT}.\`)
})

app.get('/', function (req, res) {
  res.send(\`Hello ${process.env.HELLO}\`)
})
```

CopyCopied!

Add a `Dockerfile`.

### Dockerfile

```shell
# Dockerfile
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
```

CopyCopied!

Create your `docker-compose.yml` file.

### docker-compose.yml

```yaml
version: '3.8'
services:
  web:
    build: .
    command: node index.js
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: ${NODE_ENV}
      DOTENV_KEY: ${DOTENV_KEY}
```

CopyCopied!

Create your `.dockerignore` file.

```bash
.git
.env*
!.env.vault
```

CopyCopied!

Commit all that to code and run it with Docker Compose.

```shell
docker-compose up --build
```

CopyCopied!

localhost:3000



Once running, your app will say `Hello undefined` at localhost:3000 as it doesn’t have a way to access the environment variable yet. Let’s do that next.

## Install dotenv

Install `dotenv`.

```shell
npm install dotenv --save # Requires dotenv >= 16.1.0
```

CopyCopied!

As early as possible in your application, import and configure dotenv.

### index.js

```js
require('dotenv').config()
console.log(process.env) // remove this after you've confirmed it is working

const PORT = process.env.PORT || 3000
const express = require('express')
...
```

CopyCopied!

Next, tie the `.env.vault` file to our docker-compose file.

## Build .env.vault

Push your latest `.env` file changes and edit your production secrets. Learn more about syncing

```shell
npx dotenv-vault@latest push
npx dotenv-vault@latest open production
```

CopyCopied!

Use the UI to configure those secrets per environment.

www.dotenv.org



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

# production
DOTENV_VAULT_PRODUCTION="x26PuIKQ/xZ5eKrYomKngM+dO/9v1vxhwslE/zjHdg3l+H6q6PheB5GVDVIbZg=="
DOTENV_VAULT_PRODUCTION_VERSION=2
```

CopyCopied!

## Set DOTENV_KEY

Fetch your production `DOTENV_KEY`.

```shell
npx dotenv-vault@latest keys production
# outputs: dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production
```

CopyCopied!

Set `DOTENV_KEY` for Docker Compose up.

```shell
NODE_ENV=production DOTENV_KEY="dotenv://: [\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)/vault/.env.vault?environment=production" docker-compose up --build
```

CopyCopied!

ProTip: If docker-compose seems cached on old code it probably is. Run `docker-compose build --no-cache` to rebuild it.

That's it! On up, your `.env.vault` file will be decrypted and its production secrets injected as environment variables – just in time.

localhost:3000



You'll know things worked correctly when you see `Loading env from encrypted .env.vault` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

DOTENV_KEY='' docker-compose up --build



Was this page helpful?

Yes

No

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension