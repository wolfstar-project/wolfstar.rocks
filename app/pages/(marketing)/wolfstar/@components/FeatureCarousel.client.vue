<template>
  <div class="w-full py-10">
    <UCarousel
      :items="features"
      :ui="{ item: 'basis-auto' }"
      :autoplay="{ delay: 2000, stopOnMouseEnter: true }"
      loop
      arrows
      prev-icon="heroicons:chevron-left-16-solid"
      next-icon="heroicons:chevron-right-16-solid"
      dots
      class="w-full"
    >
      <template #default="{ item }">
        <div
          class="card-glass hover-lift hover-border-glow group relative mx-3 my-5 flex h-40 w-64 flex-col items-start justify-center gap-2 overflow-hidden px-6 transition-colors hover:bg-white/5 cursor-pointer"
          @click="item.action"
        >
          <div class="rounded-full flex items-center justify-center size-10 bg-base-content/5 p-2 transition-colors group-hover:bg-branding-wolfstar/20 group-hover:text-branding-wolfstar">
            <UIcon :name="item.icon" class="h-6 w-6" />
          </div>
          <h3 class="font-bold">{{ item.title }}</h3>
          <p class="text-sm text-base-content/60">{{ item.description }}</p>

          <!-- Subtle corner glow -->
          <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-branding-wolfstar/10 blur-xl transition-all group-hover:bg-branding-wolfstar/30"></div>
        </div>
      </template>
    </UCarousel>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "open-feature", index: number): void;
}>();

interface Feature {
  title: string;
  description: string;
  label: string;
  icon: string;
  action?: () => void | Promise<void>;
}

const features = [
  {
    title: "Auto Moderator",
    description: "Advanced filtering and automated actions.",
    label: "automod",
    icon: "ph:shield-check-fill",
    action: () => emit("open-feature", 0),
  },
  {
    title: "Logging Suite",
    description: "Track every event in your server.",
    label: "logging",
    icon: "ph:scroll-fill",
    action: () => emit("open-feature", 1),
  },
  {
    title: "Custom Punishments",
    description: "Flexible ban and mute durations.",
    label: "punishments",
    icon: "ph:gavel-fill",
    action: () => emit("open-feature", 0),
  },
  {
    title: "100% Free",
    description: "No paywalls, all features unlocked.",
    label: "free",
    icon: "ph:gift-fill",
  },
  {
    title: "Open Source",
    description: "Transparent and community driven.",
    label: "opensource",
    icon: "simple-icons:github",
    action: async () => await navigateTo("https://github.com/wolfstar-project/wolfstar", { external: true }),
  },
  {
    title: "Multilanguage",
    description: "Supports multiple languages.",
    label: "multilanguage",
    icon: "ph:translate-fill",
  },
] satisfies Feature[];
</script>
