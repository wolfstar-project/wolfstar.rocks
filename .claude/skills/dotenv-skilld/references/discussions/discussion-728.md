---
number: 728
title: Does PROCESS.ENV have a buffer limit?
category: "Q&A"
created: 2023-03-30
url: "https://github.com/motdotla/dotenv/discussions/728"
upvotes: 1
comments: 1
answered: false
---

# Does PROCESS.ENV have a buffer limit?

Currently, running into the following issue:

Using dotenv to read in a configuration file.  The file path that is being passed seems correct and the variables from the the config file are appended to PROCESS.ENV, locally.

But, when I executed the same code to load the file during pipeline runs the variables from the configuration file seem to never get appended to PROCESS.ENV.

Is there a limit to how much PROCESS.ENV can store? 

If not, how do I debug why my configuration file contents are not being appended to PROCESS.ENV?

Code for loading targeted configuration file:

let envTestFile = path.resolve(__dirname, "configs", `.env.${process.env.WEB_ENV}`);
dotenv.config({path: envTestFile});

---

## Top Comments

**@motdotla** [maintainer]:

No, there is no limit.

This is likely a configuration issue with your pipeline. For CI pipelines we don't recommend packaging your `.env` file. It shouldn't be committed to code. Instead, use a `.env.vault` file in combination with a `DOTENV_KEY`. See https://github.com/motdotla/dotenv#-deploying-envvault