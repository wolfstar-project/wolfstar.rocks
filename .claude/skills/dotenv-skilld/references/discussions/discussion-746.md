---
number: 746
title: Should I have multiple .env files?
category: General
created: 2023-06-01
url: "https://github.com/motdotla/dotenv/discussions/746"
upvotes: 1
comments: 1
answered: false
---

# Should I have multiple .env files?

We can have multiple .env files for development, production and also if there are multiple different modules in the project then can have specific configuration particular module in their respective development, production file.

And then in package.json file of for running the node js server we can have multiple script define there with the NODE_ENV defined such as - **"start-production": "set NODE_ENV=production&&ts-node-dev index.ts",**

Note- As in F&Q section of dotenv package it mentioned that .
**No. We strongly recommend against having a "main" .env file and an "environment" .env file like .env.test. Your config should vary between deploys, and you should not be sharing values between environments.**---This line is making confused.
: Until recently, we did not have an opinion on how and where to store your secrets in production. We now strongly recommend generating a .env.vault file. It's the best way to prevent your secrets fro...