---
number: 647
title: Character Recognition Problems
category: "Q&A"
created: 2022-03-23
url: "https://github.com/motdotla/dotenv/discussions/647"
upvotes: 1
comments: 1
answered: true
---

# Character Recognition Problems

Previously I used version 8.
While testing version 16, I found an issue where '#' was not recognized.

Whether this is my setting is wrong, I leave a test log.
<img width="256" alt="Screen Shot 2022-03-23 at 8 39 21 PM" src="https://user-images.githubusercontent.com/3753282/159691221-e0a3f1be-b834-4dfb-951f-c50eb694b69f.png">

```
require('dotenv').config()
console.log(process.env)
```
<img width="464" alt="Screen Shot 2022-03-23 at 8 39 53 PM" src="https://user-images.githubusercontent.com/3753282/159691296-bd1dca74-dfc6-4ac4-8812-aad695d55e04.png">




---

## Accepted Answer

**@motdotla** [maintainer]:

Hi @JWLK put it in quotes and it will work. This was an intentional behavior change as we added support for inline comments.

```
MYSQL_PASSWORD='JWLK#'
```