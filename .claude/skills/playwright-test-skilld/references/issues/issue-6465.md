---
number: 6465
title: "[Feature] Logging support on the language bindings"
type: other
state: open
created: 2021-05-08
url: "https://github.com/microsoft/playwright/issues/6465"
reactions: 82
comments: 10
labels: "[P3-collecting-feedback]"
---

# [Feature] Logging support on the language bindings

Currently, playwright when in debug mode logs output to stdout directly, while this is great, it is impossible to customise logging from the logger of the language being used like, if user is using python `logging` module then playwright cannot log with logging module, for java users would like to use sl4j for logging etc. 

If playwright passes log output with rpc then each language can customise it by itself.

Consider upvoting :+1: if you want to use logging from your playwright supported language.