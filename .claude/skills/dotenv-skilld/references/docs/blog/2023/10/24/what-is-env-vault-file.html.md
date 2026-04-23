What is a .env.vault file | Dotenv



Pricing Security

Docs

Log in

← back to blog 

Mot

October 24, 2023

# What is a .env.vault file



It’s an encrypted copy of your `.env` files.

It is easiest to understand if you generate one. So let’s do that. Then I’ll show you how to use it in production. Lastly, we’ll talk about its security advantages.

Find a complete code example on GitHub for this blog post.

## Generating

We’re going to use the command `npx dotenv-vault local build`.

### Prerequisites

Enter a project where you already have `.env.*` file(s) and have installed dotenv.

For example, I have a project with 3 files in it.

- index.js
- .env
- .env.production

```javascript
// index.js
require('dotenv').config()
console.log(\`Hello ${process.env.HELLO}\`)
```

```ino
# .env
HELLO="development"
```

```ino
# .env.production
HELLO="production"
```

When I run `node index.js` I get the expected output `Hello development`.

```bash
$ node index.js
Hello development
```

Let’s build the `.env.vault` file.

### Generate .env.vault

Run the **local build** command.

```bash
$ npx dotenv-vault local build
```

You will see a `.env.vault` file that looks something like this.

```
#/-------------------.env.vault---------------------/
#/         cloud-agnostic vaulting standard         /
#/   [how it works](https://dotenv.org/env-vault)   /
#/--------------------------------------------------/
# development
DOTENV_VAULT_DEVELOPMENT="AtEC33ZfFJQMSE6C+EBX8nzTyQzfC+xhsIfGjyWr47jiHsUi07PHzX2/RmCB0PIi"
# production
DOTENV_VAULT_PRODUCTION="t9van8HefnTIHVlK3vQ6WYLtWEOvPunEnOphV3Hw3aBTBDuwLq22yU0Tdl5fAnk="
```

It contains two keys.

- `DOTENV_VAULT_DEVELOPMENT`
- `DOTENV_VAULT_PRODUCTION`

These contain encrypted copies of:

- your `.env` file
- your `.env.production` file.

A `.env.keys` file was also generated. These keys decrypt the contents of `DOTENV_VAULT_${ENVIRONMENT}`.

```
$ npx dotenv-vault local keys
```

```
#/!!!!!!!!!!!!!!!!!!!.env.keys!!!!!!!!!!!!!!!!!!!!!!/
#/   DOTENV_KEYs. DO NOT commit to source control   /
#/   [how it works](https://dotenv.org/env-keys)    /
#/--------------------------------------------------/
DOTENV_KEY_DEVELOPMENT="dotenv://:key_f4516b0077d9aefad9fa7b36cec570e05dcb7cd6d5de1dac2562b6421af7d185@dotenv.local/vault/.env.vault?environment=development"
DOTENV_KEY_PRODUCTION="dotenv://:key_18a137f844e3511022dbf1de2b1bd5e3bd6d1ef4c78988e2521ce9f05abc506a@dotenv.local/vault/.env.vault?environment=production"
```

**See the pattern?** A `.env.${ENVIRONMENT}` file corresponds to a `DOTENV_VAULT_${ENVIRONMENT}` secret and `DOTENV_KEY_${ENVIRONMENT}` decryption key.

Try decrypting the contents of `DOTENV_VAULT_PRODUCTION`.

```
$ npx dotenv-vault local decrypt 'dotenv://:key_18a137f844e3511022dbf1de2b1bd5e3bd6d1ef4c78988e2521ce9f05abc506a@dotenv.local/vault/.env.vault?environment=production'
HELLO="production"
```

Great! It’s decrypting successfully. Next, let’s put this to use in production.

## Production

1. Commit `.env.vault` to code
2. Set DOTENV_KEY on server
3. Deploy your code

At runtime your encrypted secrets will be injected into your code just-in-time.

Try it on your machine with this simple example.

```
$ DOTENV_KEY='dotenv://:key_18a137f844e3511022dbf1de2b1bd5e3bd6d1ef4c78988e2521ce9f05abc506a@dotenv.local/vault/.env.vault?environment=production' node index.js

[[\[email protected\]](https://www.dotenv.org/cdn-cgi/l/email-protection)][INFO] Loading env from encrypted .env.vault
Hello production
```

As you can see, it loads your env from your encrypted `.env.vault` file and successfully outputs `Hello production`. Elegant!

(Other languages are supported too. See dotenv.org/docs)

## Security Advantages

Do you remember the CircleCI data breach? An attacker gained access to everyone’s environment variables putting their software products at major risk.

But if you were using `.env.vault` files, you were not at risk. Why?

The attacker solely gained access to environment variables, not code. He had your `DOTENV_KEY` but not your `.env.vault` file. He needed both to access your secrets.

This takes the Twelve-Factor App’s principle of _strict separation of config from code_ to the next level - where even your _config_ is separated.

This leads to some great second order effects.

- You are no longer scattering your secrets across multiple third-parties and tools
- Your secrets are easier to manage in one central place close to your code which means less chance of fat-fingering or forgetting to set a secret
- You add more friction to attackers and remove friction for yourself - no more hard work managing secrets across multiple servers

I’d encourage you to give `.env.vault` files a try. I think you will like them after the initial adoption hump. They are simple files that don’t require any additional secret manager processes to be kept running.

`.env` files were simple, useful, and added additional security. `.env.vault` files maintain that same spirit while adding a much higher level of security. What do you think, let me know at @dotenvx or @motdotla.

---

### dotenv-vault — A secrets manager for .env and .env.vault files.



If you are looking to also manage your `.env` and `.env.vault` files across a larger team, complete with permissions, versions, and history then create a Dotenv Account. It’s free with premium features.

https://dotenv.org/signup

Subscribe via RSS or follow us @dotenvx 𝕏

   Visual Studio Code Pricing Security Docs Terms Privacy Status Help & Support

 2025 Dotenv