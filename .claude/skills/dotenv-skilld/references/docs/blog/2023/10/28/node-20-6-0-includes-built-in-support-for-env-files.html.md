Node.js 20.6.0 includes built-in support for .env files | Dotenv



Pricing Security

Docs

Log in

← back to blog 

Mot

October 28, 2023

# Node.js 20.6.0 includes built-in support for .env files

Node v20.6.0+ adds native support for loading `.env` files.

```
node --env-file=.env index.js
```

Wow, cool!

Is dotenv dead? Stop using it? Not so fast. **Don’t drop dotenv** just yet. There are some caveats you should know first.

First, let me say, it is great to see the NodeJS team adopt first-class `.env` support for developers. As one of the pioneers of dotenv, it’s an honor. **dotenv** is depended on by more than 14 Million open source repos on GitHub alone and downloaded more than 35 Million times per week. dotenv has proven itself as a trusty friend to millions of developers worldwide.

Anyways, let’s see how this built-in support works (or [skip to the caveats](#caveats) section).

Find a complete code example on GitHub for this blog post.

## How it works

Install Node v20.6.0 or greater using nvm.

```
nvm install 20.6.0
nvm use 20.6.0
node -v
v20.6.0
```

Create your `.env` file.

```
HELLO="World"
```

Create your node script to make use of it.

```
// index.js
console.log(\`Hello ${process.env.HELLO}\`)
```

Run it with the `--env-file` flag.

```
node --env-file=.env index.js
Hello World
```

That’s it!

Want to run it in production? Just point it to a `.env.production` file.

```
# .env.production
HELLO="production"
```

```
node --env-file=.env.production index.js
```

## Caveats

The biggest _current_ caveat is that this is still an experimental feature. That means it will ship with bugs and with missing feature support. The top hn comment sums it up well - albeit a bit grumpily.



I also want to stress the word _current_ because this is all still under active development. These things take time. By the time you read this, some of these caveats might no longer be around.

### Missing multiline support

The current implementation does not support multiline environment variables. If you attempt to include a multiline environment variable it will be `undefined`. For example:

```
# .env.multiline
HELLO="This
is
a
multiline"
```

```
// index.js
console.log(\`Hello ${process.env.HELLO}\`)
```

```
node --env-file=.env.multiline index.js
Hello undefined
```

Note: multiline support is being actively discussed and will probably get added in the near future.

### Missing override option

You cannot override your system’s environment variables with your `.env` file. There is no option.

```
# .env
HELLO="World"
```

```
// index.js
console.log(\`Hello ${process.env.HELLO}\`)
```

```
export HELLO="System"
node --env-file=.env index.js
Hello System
```

It prints `Hello System` rather then `Hello World`. There is no option to overwrite system variables.

If you need to do this then continue using dotenv with its override option.

### Missing variable expansion

Variable expansion support for dotenv exists in a separate library dotenv-expand. But it is so widely used with 13 million downloads weekly that it is defacto considered part of dotenv.

As of this writing, Node does not support variable expansion. Instead, it will output the variable as a string.

```
# .env
PASSWORD="password123"
SECRET=$PASSWORD
```

```
// index.js
console.log(\`The secret is ${process.env.SECRET}\`)
```

```
node --env-file=.env index.js
The secret is $PASSWORD
```

So if you need variable expansion, you should continue using dotenv and dotenv-expand.

### Missing `.env.vault` support

`.env.vault` files are the spiritual successors to `.env` files. They have multiple security advantages over `.env` files which you can read about here.

They are quite new, but also quite useful for production and ci, and are gaining adoption across multiple communities like node, python, rust, and more.

But as a new technology, they are unlikely to be adopted natively by Node until they earn similar widespread use to `.env` files. So keep using dotenv if you plan to make use of them.

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

## Conclusion

In conclusion, built-in support for `.env` files (even if currently experimental) is a huge and welcome step forward for Node. Big thanks to Yagiz Nizipli for making this happen. Go sponsor him on GitHub. He is doing incredible work for Node.

But there are some current caveats, and I would recommend against npm uninstall-ing dotenv for your production apps at this time. Wait until it is non-experimental and has added support for the missing features above.

---

### Using the new `--env-file` flag?

dotenv-vault is the perfect companion. Use it to sync your `.env` files and easily switch between environments. Create your Dotenv Account and try it today.



https://dotenv.org/signup

Subscribe via RSS or follow us @dotenvx 𝕏

   Visual Studio Code Pricing Security Docs Terms Privacy Status Help & Support

 2025 Dotenv