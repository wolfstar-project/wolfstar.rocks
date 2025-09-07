<template>
  <ShadFooter :ui="{ root: 'mt-24 bg-base-200 p-10 text-base-content', top: 'text-base-content' }">
    <template #top>
      <ShadContainer>
        <ShadFooterColumns class="p-10" :columns="columns" />
      </ShadContainer>
    </template>

    <template #left>
      <aside>
        <div class="flex items-center gap-4">
          <div class="w-10 rounded-full">
            <icons-wolfstar class="h-12 w-12" />
          </div>
          <div>
            <p class="font-semibold">
              WolfStar Project
            </p>
          </div>
          <div>
            <p class="text-sm text-base-content/80">
              Copyright © {{ new Date().getFullYear() }}. All rights reserved.
            </p>
          </div>
        </div>

        <div class="flex items-end gap-4 mt-4">
          <span class="text-sm text-base-content/80">
            Version: {{ buildInfo.version }}
          </span>
          <span class="text-sm text-base-content/80">
            Commit: {{ buildInfo.shortCommit }}
          </span>
          <span class="text-sm text-base-content/80">
            Build Date: {{ useDateFormat(buildInfo.time, 'YYYY-MM-DD') }}
          </span>
        </div>
      </aside>
    </template>
    <template #right>
      <ShadButton
        to="https://github.com/nuxt-ui-pro/saas"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </ShadFooter>
</template>

<script setup lang="ts">
const { buildInfo } = useAppConfig();
const columns = [
  {
    label: "Links",
    children: [
      { label: "Support Server", to: "https://join.wolfstar.rocks", icon: "ph:discord-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-indigo-500" } },
      { label: "GitHub", to: "https://github.com/wolfstar-project", icon: "ph:github-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-indigo-500" } },
      { label: "Blog", to: "https://blog.wolfstar.rocks", icon: "ph:newspaper-clipping-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-primary" } },
    ],
  },
  {
    label: "Donate",
    children: [
      { label: "Patreon", to: "https://donate.wolfstar.rocks/patreon", icon: "ph:patreon-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-rose-600" } },
      { label: "PayPal", to: "https://donate.wolfstar.rocks/paypal", icon: "ph:paypal-logo-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-sky-600" } },
      { label: "Ko-fi", to: "https://donate.wolfstar.rocks/kofi", icon: "ph:coffee-duotone", class: "link-hover", ui: { linkLeadingIcon: "bg-pink-500" } },
    ],
  },
  {
    label: "Legal",
    children: [
      { label: "Terms of Use", to: "/terms", icon: "ph:scales-fill", class: "link-hover", ui: { linkLeadingIcon: "bg-warning" } },
      { label: "Privacy Policy", to: "/privacy", icon: "ph:scales-fill", class: "link-hover", ui: { linkLeadingIcon: "bg-warning" } },
    ],
  },
];
</script>
