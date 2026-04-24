Adding Teammates | Dotenv

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
    - Run dotenv-vault open
    - Click Team Dropdown
    - Click Add Teammate
    - Enter Teammate's Email Address
    - Tell Your Teammate to Check Their Email
    - Teammate: Run dotenv-vault login
    - Teammate: Click Login
    - Teammate: View .env.me file (optional)
    - Teammate: Run dotenv-vault pull
    - Teammate: Run dotenv-vault push (optional)
    - You: Run dotenv-vault pull (optional)
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
    - Run dotenv-vault open
    - Click Team Dropdown
    - Click Add Teammate
    - Enter Teammate's Email Address
    - Tell Your Teammate to Check Their Email
    - Teammate: Run dotenv-vault login
    - Teammate: Click Login
    - Teammate: View .env.me file (optional)
    - Teammate: Run dotenv-vault pull
    - Teammate: Run dotenv-vault push (optional)
    - You: Run dotenv-vault pull (optional)
  - Managing access
- Sign in

##### Tutorials

# Adding Teammates

## Run dotenv-vault open

Open terminal, enter your project's root directory (where your .env.vault file is), and run dotenv-vault open.

```
$ npx dotenv-vault open
```

CopyCopied!



FYI: Not a developer? You can navigate to this page by visiting ui.dotenv.org. ## Click Team Dropdown

Click the 'Team' dropdown button and then click 'Manage access'.



## Click Add Teammate

On the next page, click 'Add Teammate'.



## Enter Teammate's Email Address

Enter your teammate's email address and click 'Add teammate'.





## Tell Your Teammate to Check Their Email

They will receive an email with instructions to run dotenv-vault pull. They can also choose to log in.



## Teammate: Run dotenv-vault login

Your teammate visits their terminal, enters the project directory (which they've already git-cloned via a service like GitHub or GitLab), and runs dotenv-vault login.

```
$ npx dotenv-vault login
```

CopyCopied!

## Teammate: Click Login

On the next screen, your teammate should follow the login process and click 'Log in'.

## Teammate: View .env.me file (optional)

Your teammate now has their own .env.me file (on their machine only) in the root of the project. The .env.me file uniquely authorizes them to access the project's shared .env file. Think of it like a unique SSH key at GitHub.

Run ls -al to view it.

```
$ ls -al
Jul 28 17:54 .
Jul 27 13:46 ..
Jul 28 18:11 .env.me
Jul 28 18:09 .env.vault
Jul 28 17:54 .gitignore
Jul 27 14:49 index.js
...
```

CopyCopied!



## Teammate: Run dotenv-vault pull

Your teammate returns to their terminal and runs dotenv-vault pull.

```
$ npx dotenv-vault pull

remote:   Securely pulling... done
remote:   Securely pulled development (.env)
```

CopyCopied!



## Teammate: Run dotenv-vault push (optional)

Your teammate can edit the .env file and push changes with dotenv-vault push.

```
$ npx dotenv-vault push

remote:   Securely pushing (.env)... done
remote:   Securely pulled development (.env)
```

CopyCopied!



## You: Run dotenv-vault pull (optional)

Pull the changes your teammate made with dotenv-vault pull.

```
$ npx dotenv-vault pull

remote:   Securely pulling... done
remote:   Securely pulled development (.env)
```

CopyCopied!



That's it! Thanks for using dotenv-vault with your teammates and friends.

Was this page helpful?

Yes

No

Previous Unlimited projects

Next Multiple environments

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension