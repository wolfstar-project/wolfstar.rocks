How to use dotenv | Dotenv



Pricing Security

Docs

Log in

← back to blog 

Mot

March 13, 2023

# How to use dotenv

## Create your project

Begin by creating a project. Let’s call it `hello-world`.

```
$ mkdir hello-world
$ cd hello-world
$ touch index.js
```

Edit the index.js file and place the following in it.

```
// index.js
console.log('Hello World')
```

Test that it runs correctly.

```
$ node index.js
```

It should output “Hello World”.

## Create your .env file

A **.env** file is where you put all your secrets - your app configuration, api keys, and encryption keys.

Create a very simple one.

```
$ touch .env
```

Edit it.

```
# .env
HELLO="Universe"
```

Save those changes.

## Install dotenv and require it

Run npm install dotenv to install the dotenv library.

```
$ npm install dotenv --save
```

Then edit your **index.js** file and require dotenv at the top of the file.

```
// index.js
require('dotenv').config()
console.log(\`Hello ${process.env.HELLO}\`)
```

When you run this it is going to first run require dotenv, run the config command which will pull in your values from your .env file, and then load those into your process.env environment variables.

Try it out. Run **node index.js**.

```
$ node index.js
Hello Universe
```

Great! You just used dotenv at its foundational layer!

---

---

### Using `.env` files?

dotenv-vault is a secrets manager for securely managing them. Create your Dotenv Account and try it today.



https://dotenv.org/signup

Subscribe via RSS or follow us @dotenvx 𝕏

   Visual Studio Code Pricing Security Docs Terms Privacy Status Help & Support

 2025 Dotenv