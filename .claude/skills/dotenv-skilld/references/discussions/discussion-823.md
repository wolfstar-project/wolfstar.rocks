---
number: 823
title: Import size
category: "Q&A"
created: 2024-04-18
url: "https://github.com/motdotla/dotenv/discussions/823"
upvotes: 2
comments: 1
answered: true
---

# Import size

I'm using import cost extension in vscode. 

I am trying to import `dotenv` and have only used the config method. However, when I wanted to import it only in the second line, expecting a smaller size, I ended up with almost the same size. I am confused about why this happened and whether I have misunderstood the concept of import size. I know that importing only a part of the module should result in a smaller size. Can you please help me understand if I got this wrong?






---

## Accepted Answer

**@motdotla** [maintainer]:

dotenv was designed before there were imports and it was always just a single file. the dotenv/config actually loads the config file with loads a couple additionally methods. that's why you are seeing it actually larger. it's so small a difference in size though it's not been a priority for us to adjust that.