AWS Parameter Store | Dotenv

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
    - Step 1
    - Step 2
    - Step 3
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

##### Add-ons

# AWS Parameter Store

Sync your secrets to AWS Parameter Store when an environment variable is changed.

## Step 1

Navigate to the add-ons page. Click AWS Parameter Store. Then click Connect AWS Secrets.



## Step 2

On the next page, generate your AWS IAM User and paste in the credentials.









Important: The AWS IAM user must have correct permissions. Below is an example. Modify for your security needs.

### example iam user policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:PutParameter",
                "ssm:DeleteParameter",
                "ssm:GetParameterHistory",
                "ssm:GetParametersByPath",
                "ssm:GetParameters",
                "ssm:GetParameter",
                "ssm:DeleteParameters",
                "ssm:DescribeParameters"
            ],
            "Resource": "*"
        }
    ]
}
```

CopyCopied!

## Step 3

Lastly, set up the AWS Parameter Store config path and region.



If successful, you'll have a keys and values in AWS Parameter Store that looks like the following:



That's it! Your secrets are now synced to AWS Parameter Store and will continue to stay in sync when you modify your secrets.

Thank you for using Dotenv with AWS Parameter Store.

Was this page helpful?

Yes

No

Previous Slack Notifications

Next Sync to AWS Secrets

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension