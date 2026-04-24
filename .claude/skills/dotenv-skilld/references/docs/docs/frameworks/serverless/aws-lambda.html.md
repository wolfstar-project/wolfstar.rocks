Deploy a Serverless App to AWS Lambda | Dotenv

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
    - Initial setup
    - Install dotenv
    - Build .env.vault
    - Set DOTENV_KEY
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

##### Frameworks › Serverless

# Deploy a Serverless App to AWS Lambda

Deploy a Serverless app with an encrypted .env.vault file to AWS Lambda.

Find a complete code example on GitHub for this guide.

## Initial setup

Create a serverless project.

```bash
npx serverless
```

CopyCopied!

Here are the options I selected for this guide. Modify for your own needs.

```
? What do you want to make? AWS - Node.js - Starter
? What do you want to call this project? aws-lambda
? What org do you want to add this service to? dotenv
? What application do you want to add this to? [create a new app]
? What do you want to name this application? aws-lambda
✔ Your project is ready to be deployed to Serverless Dashboard (org: "dotenv", app: "aws-lambda")
? Do you want to deploy now? Yes
Deploying aws-lambda to stage dev (us-east-1, "default" provider)
```

CopyCopied!

Edit `index.js` to include `process.env.HELLO`.

### index.js

```js
module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: \`Hello ${process.env.HELLO}\`,
        input: event,
      },
      null,
      2
    ),
  };
};
```

CopyCopied!

Deploy that to the cloud.

```
npx serverless deploy
```

CopyCopied!

Invoke your function.

### Request

```bash
npx serverless invoke --function function1
```

CopyCopied!

### Response

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Hello undefined\",\n  \"input\": {}\n}"
}
```

CopyCopied!

It will respond with `Hello undefined` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install dotenv

Install dotenv.

```bash
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

As early as possible in your function, import and configure dotenv.

### index.js

```js
require('dotenv').config()
console.log(process.env) // remove this after you've confirmed it is working

module.exports.handler = async (event) => {
...
```

CopyCopied!

Test that it is working by invoking your function locally.

```bash
npx serverless invoke local --function function1
```

CopyCopied!

It should say `Hello World`.

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Hello World\",\n  \"input\": {}\n}"
}
```

CopyCopied!

Great! `process.env` now has the keys and values you defined in your `.env` file. That covers local development. Let's solve for production next.

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

Edit your `serverless.yml` file to inject the `DOTENV_KEY` as a param.

### serverless.yml

```yaml
...
provider:
  name: aws
  runtime: nodejs18.x
  environment:
    DOTENV_KEY: ${param:DOTENV_KEY}
...
```

CopyCopied!

**Important**, additionally, edit your `serverless.yml` file to ignore your `.env*` files excepting your `.env.vault` file.

### serverless.yml

```yaml
...
package:
  patterns:
    - '!.env*'
    - '.env.vault'
```

CopyCopied!

When complete, your `serverless.yml` file should look something like this.

### serverless.yml

```yaml
org: dotenv
app: aws-lambda
service: aws-lambda
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  environment:
    DOTENV_KEY: ${param:DOTENV_KEY}

functions:
  function1:
    handler: index.handler

package:
  patterns:
    - '!.env*'
    - '.env.vault'
```

CopyCopied!

Using the `DOTENV_KEY` you fetched above, set it as param on the Serverless dashboard.



Deploy to the cloud again.

```
npx serverless deploy
```

CopyCopied!

Now invoke your function.

### Request

```bash
npx serverless invoke --function function1
```

CopyCopied!

That's it! On invocation, your `.env.vault` file will be decrypted and its production secrets injected as environment variables – just-in-time.

### Response

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Hello production\",\n  \"input\": {}\n}"
}
```

CopyCopied!

You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

Previous Remix

Next SvelteKit

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension