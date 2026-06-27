---
number: 1626
title:  Does unused exports mean not used in the entry point file(s)?
type: other
state: open
created: 2026-03-18
url: "https://github.com/webpro-nl/knip/issues/1626"
reactions: 0
comments: 2
labels: "[discussion]"
---

#  Does unused exports mean not used in the entry point file(s)?

### Discuss anything related to Knip

I got "Unused exports" for one file when they were clearly used in several files.  when I used "--trace-file" on one of the files that used them, it said "no imports found" which led me to believe that perhaps "no imports found" meant no external imports and "Unused exports" meant that it was not available outside of my code.

This is for an express server.  So, if there's a better way to configure it for that use case, let me know.  I'm mainly using it to find unused packages.