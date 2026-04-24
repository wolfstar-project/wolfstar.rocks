---
number: 824
title: "2.0 Error: Dynamic require of \"fs\" is not supported"
type: other
state: closed
created: 2024-05-06
url: "https://github.com/motdotla/dotenv/issues/824"
reactions: 18
comments: 1
---

# 2.0 Error: Dynamic require of "fs" is not supported

Error on using JS Module v2 and Dotenv

import 'dotenv/config';

[22:18:45][Error] Error: Dynamic require of "fs" is not supported
    at file:///C:/Users/Comma/Documents/ProjectReborn/server/altv/resources/gamemode/server/startup.js:39:9
    at node_modules/dotenv/lib/main.js (file:///C:/Users/Comma/Documents/ProjectReborn/server/altv/resources/gamemode/server/startup.js:119:15)
    at __require2 (file:///C:/Users/Comma/Documents/ProjectReborn/server/altv/resources/gamemode/server/startup.js:42:50)
    at file:///C:/Users/Comma/Documents/ProjectReborn/server/altv/resources/gamemode/server/startup.js:424:3
    at file:///C:/Users/Comma/Documents/ProjectReborn/server/altv/resources/gamemode/server/startup.js:431:3   


---

## Top Comments

**@motdotla** [maintainer] (+1):

if you are using dotenvx in an es module environment, shouldn't you be loading it as the following?

```
import dotenv from 'dotenv';
dotenv.config();
```