<template>
  <footer class="mt-24 footer bg-base-200 p-10 text-base-content md:footer-horizontal">
    <aside>
      <div class="w-10 rounded-full">
        <icons-wolfstar class="h-12 w-12" />
      </div>
      <p>WolfStar Project<br />Providing reliable open-source software since 2024</p>
      <p>© 2024 All rights reserved.</p>
    </aside>
    <nav>
      <h6 class="footer-title">Links</h6>
      <nuxt-link class="link link-hover" to="https://join.wolfstar.rocks">
        <ShadIcon name="ph:discord-logo-duotone" class="h-5 w-5 text-indigo-500" />
        Support Server
      </nuxt-link>
      <nuxt-link class="link link-hover" to="https://github.com/wolfstar-project">
        <ShadIcon name="ph:github-logo-duotone" class="h-5 w-5 text-indigo-500" />
        GitHub
      </nuxt-link>
      <nuxt-link class="link link-hover" to="https://blog.wolfstar.rocks">
        <ShadIcon name="ph:newspaper-clipping-duotone" class="h-5 w-5 text-primary" />
        Blog
      </nuxt-link>
    </nav>
    <nav>
      <h6 class="footer-title">Donate</h6>
      <nuxt-link class="link link-hover" to="https://donate.wolfstar.rocks/patreon">
        <ShadIcon name="ph:patreon-logo-duotone" class="h-5 w-5 text-rose-600" />
        Patreon
      </nuxt-link>
      <nuxt-link class="link link-hover" to="https://donate.wolfstar.rocks/paypal">
        <ShadIcon name="ph:paypal-logo-duotone" class="h-5 w-5 text-sky-600" />
        PayPal
      </nuxt-link>
      <nuxt-link class="link link-hover" to="https://donate.wolfstar.rocks/kofi">
        <ShadIcon name="ph:coffee-duotone" class="h-5 w-5 text-pink-500" />
        Ko-fi
      </nuxt-link>
    </nav>
    <nav>
      <h6 class="footer-title">Legal</h6>
      <nuxt-link class="link link-hover" to="/terms">
        <ShadIcon name="ph:scales-fill" class="h-5 w-5 text-warning" />
        Terms of Use
      </nuxt-link>
      <nuxt-link class="link link-hover" to="/privacy">
        <ShadIcon name="ph:scales-fill" class="h-5 w-5 text-warning" />
        Privacy Policy
      </nuxt-link>
    </nav>
    <nav>
      <div class="flex flex-col gap-2">
        <change-theme />
      </div>
    </nav>
  </footer>
</template>
