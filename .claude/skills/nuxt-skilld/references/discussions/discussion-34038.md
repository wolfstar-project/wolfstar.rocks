---
number: 34038
title: Why styles need to be inlined in nuxt/fonts?
category: Questions
created: 2026-01-07
url: "https://github.com/nuxt/nuxt/discussions/34038"
upvotes: 1
comments: 1
answered: false
---

# Why styles need to be inlined in nuxt/fonts?

Hello, I don't know if this is the right forum, but discussion is not available on nuxt/fonts github page.

I have just installed nuxt/fonts in my app.

I spent a lot of time trying to make nuxt/fonts work. In the end the only solution that worked for me, was setting 

```
<style>

	body {
		font-family: 'MyCustomFont', system-ui;
	}
	
	.heading-1,
	.heading-2,
	.heading-3,
	.heading-4,
	.heading-5  {
    	       font-family: 'MyCustomFont', Georgia
	}

</style>
```

As an inline style in app.vue, to make it globally visible. I don't fully understand why I had to inline the styles. I'd rather prefer to keep it in a scss file if possible.

Also the video on youtube and docs seem to favor this approach.

---

## Top Comments

**@cernymatej** [maintainer] (+1):

It should definitely work with a scss file too. Can you share a reproduction where it doesn't work?