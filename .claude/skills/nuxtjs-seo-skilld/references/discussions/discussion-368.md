---
number: 368
title: Screenshots in Docker
category: "Q&A"
created: 2024-12-27
url: "https://github.com/harlan-zw/nuxt-seo/discussions/368"
upvotes: 1
comments: 2
answered: false
---

# Screenshots in Docker

Hello,

I wanted to use the OG Image module where I screenshot the pages.

Only issue is that when i deploy in a docker container, it does not work.

Is there a guide on how to get this to work within a Docker env?

I installed playwright with the deps and there were some errors of the sort.

Any help is appreciated

---

## Top Comments

**@harlan-zw** [maintainer]:

Would you mind sharing the errors and I can help further? It's likely you are missing the system dependencies

You can see the puppeteer dockeer image for some ideas https://pptr.dev/guides/docker

**@devozs** (+1):

i struggled a lot with it untll it worked (docker and kubernetes).
this is my docker file.

FROM node:22
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . .
RUN npm ci && npm cache clean --force
RUN npx playwright install --with-deps chromium
RUN npm run build
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
EXPOSE 3000
ENTRYPOINT ["node", ".output/server/index.mjs"]

i`ve also added these dependencies to my package.json (i am not fully sure if they are realy required).
"playwright": "^1.51.1"
"@playwright/test": "^1.51.1",
