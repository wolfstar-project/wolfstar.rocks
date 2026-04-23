---
number: 731
title: Finding out which .env file was loaded?
category: "Q&A"
created: 2023-05-04
url: "https://github.com/motdotla/dotenv/discussions/731"
upvotes: 1
comments: 1
answered: false
---

# Finding out which .env file was loaded?

I know its not recommended to have multiple .env files but I'd still like to know if its possible to get the path to the loaded .env file?

---

## Top Comments

**@motdotla** [maintainer]:

You can set the path. Otherwise, the path is always the current working directory of the running process.