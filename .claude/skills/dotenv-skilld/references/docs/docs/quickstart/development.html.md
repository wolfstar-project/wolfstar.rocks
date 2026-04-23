Load .env files in development | Dotenv

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
    - Create .env file
    - Install dotenv
    - Require dotenv
    - Run application
    - Conclusion
    - FAQ
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

# Load .env files in development

Load your `.env` files in development using this quickstart guide.

     

## Create .env file

Create a `.env` file.

### .env

```bash
# development
HELLO="World"
```

CopyCopied!

## Install dotenv

Install dotenv in the language of your choice.

Node.js

Python

Ruby

Go

PHP

Rust

```bash
npm install dotenv --save
```

CopyCopied!

## Require dotenv

Write your application code and require dotenv.

Here we are creating a simple `Hello World` server and requiring the dotenv library first - before any other code runs.

Node.js

Python

Ruby

Go

PHP

Rust

```js
// index.js
require('dotenv').config()
const PORT = process.env.PORT || 3000
const http = require('http')
const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end(\`Hello ${process.env.HELLO}\`)
})

server.listen(PORT, () => {
  console.log(\`Server running on port:${PORT}/\`)
})
```

CopyCopied!

Note the code written as `Hello ${process.env.HELLO}`. This is where dotenv loads `HELLO=World` form the `.env` file and injects it into your process env.

## Run application

Run your application.

Node.js

Python

Ruby

Go

PHP

Rust

```bash
node index.js
# visit http://localhost:3000
```

CopyCopied!

If successful, you will see "Hello World".



## Conclusion

That's it! You now understand the basics of using dotenv in development. I recommend learning how to deploy `.env.vault` in production next.

- Deploy `.env.vault` files in production
- Add teammates to your projects

Thanks for using Dotenv!

---

## FAQ

### Should I commit my `.env` file?

No. We **strongly** recommend against committing your `.env` file to version control. It should only include environment-specific values such as database passwords or API keys. Your production database should have a different password than your development database and we recommend storing those values in a `.env.vault` file.

Was this page helpful?

Yes

No

Previous Environments

Next Deploy

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension