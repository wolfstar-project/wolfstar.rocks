---
number: 923
title: "Difference parsing env vars with bash, should I report it?"
category: General
created: 2025-12-02
url: "https://github.com/motdotla/dotenv/discussions/923"
upvotes: 1
comments: 1
answered: false
---

# Difference parsing env vars with bash, should I report it?

Good day,

I noticed dotenv parses escaped characters differently from the way bash does. I have a variable that contains a backtick, this .env file is used by a bash script and then by node with dotenv.

Bash needs the backtick to be escaped with a backslash but dotenv doesn't, so the variable contains the `\`. Without the backslash bash fails with: unexpected EOF while looking for matching \`

I was wondering if this is expected behavior or does dotenv try to match the way shell scripts work and therefore this is a bug? I wanted to bring this up here before creating an issue.

Here's an example:

```.env
FOO="test\`"
```

```test.sh
source .env
echo $FOO
#outputs test`
```

```test.js
require('dotenv').config();
console.log(process.env.FOO);
#outputs test\`
```
...

---

## Top Comments

**@czuniga9**:

I also tested `@dotenvx/dotenvx`, node's `process.loadEnvFile` and bun (loads `.env` files automatically) and all of them behave the same way (deno worked without the backslash but failed to parse with the backslash), so maybe there's no merit to this issue. Feel free to close it.