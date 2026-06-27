---
number: 34592
title: This is not an Issue
category: General
created: 2026-03-15
url: "https://github.com/nuxt/nuxt/discussions/34592"
upvotes: 26
comments: 17
answered: false
---

# This is not an Issue

https://github.com/nuxt/nuxt/discussions/34591

Just to clarify: I’m **not reporting a specific bug** here.  @OrbisK. It's not issues tab.

I was mostly sharing the experience of trying to set up **Nuxt + Bun + Tailwind v4** and how fragile the setup feels right now.

The main frustration is the **error messaging**. When something goes wrong, Nuxt/Vite often just throws:

```

Error: IPC connection closed

```

This error is **not very informative** and seems to appear for a wide range of completely different problems (misconfiguration, dependency issues, plugin crashes, etc.).

So when you see it, it doesn’t really tell you:

- what actually failed
- which module caused it
- what part of the setup is broken

You just get a generic *“IPC connection closed”* and have to start guessing.

So again — this is **not a bug report**, just feedback that the current errors make debugging quite difficult because they don’t point to the real problem.

And honestly, modern tooling should not fail with errors this vague.
It would really help if errors pointed closer to the actual cause instead of surfacing a generic IPC failure.
Also… maybe it’s time to **stop vibe-coding parts of the tooling and focus a bit more on stability and diagnostics**.


---

## Top Comments

**@danielroe** [maintainer] (+5):

Thanks for going ahead and opening an issue instead.

I understand it can be frustrating, particularly when there are inexplicable error messages. I can't really say what's causing this one (but that's the point, right?!)

As it happens, I'm working on a big refactor of our error messages that I think should make things better, both for users and maintainers.

 I'll follow-up in the issue ...

**@DmitryOlkhovoi**:

> it once you have provided an actual reproduction.

Man, just try add Tailwind v4 via vite plugin or how you see it. It's commonly used lib

> Nuxt is a community project, which means that most contributors work on it in their spare time.

Nuxt spent half of million $
https://opencollective.com/nuxtjs

Sells certificates with partners
https://certificates.dev/nuxt

**@DmitryOlkhovoi**:

On 4.3.1
<img width="1258" height="230" alt="Screenshot 2026-03-15 at 23 28 12" src="https://github.com/user-attachments/assets/a951e0a5-b8f4-493a-b85d-bf7c25ab611e" />

On 4.4.2
<img width="1300" height="203" alt="Screenshot 2026-03-15 at 23 29 07" src="https://github.com/user-attachments/assets/dc549a16-3a36-4fb3-8834-9542633a12e3" />
