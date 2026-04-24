---
number: 581
title: "nx related: Module not found: Error: Can't resolve 'fs'"
type: other
state: closed
created: 2022-01-04
url: "https://github.com/motdotla/dotenv/issues/581"
reactions: 25
comments: 39
---

# nx related: Module not found: Error: Can't resolve 'fs'

Everything was fine, my app had no issues at all until the New Year started (2022). It was then that Webpack began to fail and all these random errors that I had never dealt with before started to come in. I tried fixing the errors but more keep coming. I am not sure what to do.  Anyone please assist.

Errors from my terminal below: 

`Failed to compile.

Module not found: Error: Can't resolve 'fs' in '/Users/shansiddiqui/Desktop/dash/node_modules/dotenv/lib'
asset static/js/bundle.js 2.31 MiB [emitted] (name: main) 1 related asset
asset index.html 1.67 KiB [emitted]
asset asset-manifest.json 190 bytes [emitted]
runtime modules 28.2 KiB 13 modules
modules by path ./node_modules/ 2.13 MiB 126 modules
asset modules 4.4 KiB 16 modules
modules by path ./src/ 18.3 KiB
  modules by path ./src/*.css 8.82 KiB
    ./src/index.css 2.72 KiB [built] [code generated]
    ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].oneOf[5].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].oneOf[5].use[2]!./node_modules/source-map-loader/dist/cjs.js!./src/index.css 1.37 KiB [built] [code generated]
    ./src/App.css 2.72 KiB [built] [code generated]
    ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].oneOf[5].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].oneOf[5].use[2]!./node_modules/source-map-loader/dist/cjs.js!./src/App.css 2 KiB [built] [code generated]
  modules by path ./src/*.js 4.15 KiB
    ./src/index.js 1.51 KiB [built] [code generated]
    ./src/App.js 2.64 KiB [built] [code generated]
  modules by path ./src/components/weather/ 5.3 KiB
    ./src/components/weather/Weather.js 3.41 KiB [built] [code generated]
    ./src/components/weather/Form.jsx 1.89 KiB [built] [code generated]

ERROR in ./node_modules/dotenv/lib/main.js 24:11-24
Module not found: Error: Can't resolve 'fs' in '/Users/shansiddiqui/Desktop/dash/node_modules/dotenv/lib'
 @ ./src/components/weather/Weather.js 7:0-28 12:0-13...

---

## Top Comments

**@motdotla** [maintainer] (+23):

Thank you everyone. Continue to +1 if this is also happening to you. 

It looks like the issue will be related to webpack's warning here:

BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.

**@motdotla** [maintainer] (+3):

@stmswitcher and others can you check if you can duplicate the issue here: 

https://github.com/dotenv-org/examples/tree/master/dotenv-react-typescript

This is working on multiple machines we have tried so far. Still trying to duplicate the issue and then solve the problem.


**@motdotla** [maintainer]:

~~We are going to remove `fs` from the library (the feature that uses it is helpful but a convenience. it can move into an expansion module). We'll work on releasing a major breaking change this evening with that change.~~

Edit: 

I was referring to `os`. Referring to a different issue.

I'll be working to repeat this issue today though and solve for you all.