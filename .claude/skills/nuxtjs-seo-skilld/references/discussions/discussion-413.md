---
number: 413
title: "ERROR from nuxt-og-image@5.0.4 and playwright-core@1.51.0"
category: "Q&A"
created: 2025-03-18
url: "https://github.com/harlan-zw/nuxt-seo/discussions/413"
upvotes: 1
comments: 1
answered: false
---

# ERROR from nuxt-og-image@5.0.4 and playwright-core@1.51.0

Hello, I have just updated my libs including Nuxt3.16.
I updated @nuxtjs/seo to 3.0.1 and since then I've had a build error that seems to be linked to playwright:

```bash
[nitro 4:08:41 PM]  ERROR  Error: Cannot resolve 
"D:/Dev/project/node_modules/.pnpm/nuxt-og-image@5.0.4_@unhead_a708d75e3ee8de951b0e218395157c4e/node_modules/nuxt-og-image/dist/runtime/mock/proxy-cjs/index.js" 
from 
"D:\\Dev\\project\\node_modules\\.pnpm\\playwright-core@1.51.0\\node_modules\\playwright-core\\lib\\server\\electron\\electron.js" 
and externals are not allowed!
```

Does anyone have a solution? Thanks in advance



---

## Top Comments

**@harlan-zw** [maintainer]:

Please upgrade to the latest Nuxt SEO, v3.1.0