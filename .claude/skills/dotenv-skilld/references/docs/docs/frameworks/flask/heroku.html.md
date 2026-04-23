Deploy a Flask App to Heroku | Dotenv

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
    - Initial setup
    - Install python-dotenv-vault
    - Build .env.vault
    - Set DOTENV_KEY
    - Deploy
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

##### Frameworks › Flask

# Deploy a Flask App to Heroku

Deploy a Flask app with an encrypted .env.vault file to Heroku.

Find a complete code example on GitHub for this guide.

## Initial setup

Install flask and gunicorn.

```
pip install --upgrade flask gunicorn
```

CopyCopied!

Create an `index.py` file with the web server code.

### index.py

```python
import os
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
  hello = os.getenv("HELLO")
  return f"Hello {hello}"
```

CopyCopied!

Create your `wsgi.py` file.

### wsgi.py

```python
from index import app

if __name__ == '__main__':
  app.run(debug=False)
```

CopyCopied!

Add a `Procfile` to run your app on Heroku.

### Procfile

```yaml
web: gunicorn --workers 4 --bind 0.0.0.0:${PORT} wsgi:app
```

CopyCopied!

Create `runtime.txt`.

### runtime.txt

```bash
python-3.9.13
```

CopyCopied!

Freeze your `requirements.txt`.

```
pip freeze > requirements.txt
```

CopyCopied!

Set up your `.gitignore` file.

### .gitignore

```bash
.DS_Store
.env
.flaskenv
*.pyc
*.pyo
env/
venv/
.venv/
env*
dist/
build/
```

CopyCopied!

Commit that to code and push it to Heroku.

```shell
heroku create
git push heroku
```

CopyCopied!

yourapp.herokuapp.com



Once deployed, your app will say `'Hello None'` as it doesn't have a way to access the environment variable yet. Let's do that next.

## Install python-dotenv-vault

Install `python-dotenv-vault`.

```shell
pip install --upgrade python-dotenv-vault
```

CopyCopied!

Create a `.env` file in the root of your project.

### .env

```shell
# .env
HELLO="World"
```

CopyCopied!

As early as possible in your application, import and configure dotenv-vault.

### index.py

```python
from dotenv_vault import load_dotenv
load_dotenv()

import os
from flask import Flask
...
```

CopyCopied!

Try running it locally.

```shell
gunicorn --workers 4 --bind 0.0.0.0:3000 wsgi:app
[2023-07-31 10:20:35 -0700] [49163] [INFO] Starting gunicorn 20.1.0
[2023-07-31 10:20:35 -0700] [49163] [INFO] Listening at: http://0.0.0.0:3001 (49163)
```

CopyCopied!

It should say `Hello World`.



Great! `os.environ` now has the keys and values you defined in your `.env` file. That covers local development. Let's solve for production next.

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

Set `DOTENV_KEY` on Heroku using the CLI.

```shell
heroku config:set DOTENV_KEY='dotenv://:key_1234…@dotenv.org/vault/.env.vault?environment=production'
```

CopyCopied!

Or use Heroku's UI.

www.heroku.com



## Deploy

Commit those changes safely to code and deploy.

That's it! On deploy, your `.env.vault` file will be decrypted and its production secrets injected as environment variables‚ just in time.

yourapp.herokuapp.com



You'll know things worked correctly when you see `Loading env from encrypted .env.vault` in your logs. If a `DOTENV_KEY` is not set (for example when developing on your local machine) it will fall back to standard dotenv functionality.

heroku logs --tail



You succesfully used the new .env.vault standard to encrypt and deploy your secrets. This is much safer than scattering your secrets across multiple third-party platforms and tools. Whenever you need to add or change a secret, just rebuild your .env.vault file and redeploy.

Was this page helpful?

Yes

No

Previous FastAPI

Next Rails

 Copyright 2025. All rights reserved.

Follow us on X Follow us on GitHub Follow us on YouTube Install VSCode extension