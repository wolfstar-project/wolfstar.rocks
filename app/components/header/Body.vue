<!-- eslint-disable vue/no-template-shadow -->
<template>
  <UNavigationMenu orientation="vertical" :items="mobileLinks" class="-mx-2.5" />

  <USeparator class="my-6" />

  <AuthState>
    <template #default="{ loggedIn, user }">
      <div v-if="loggedIn">
        <UDropdownMenu
          :items="items"
          :content="{
            align: 'end',
            side: 'left',
            sideOffset: 8
          }"
          :ui="{
            content: 'w-48'
          }"
        />
        <UButton
          circle
          :avatar="{
            src: avatarSrc,
            icon: 'i-lucide-image',
            size: 'md',
          }"
        >
          <span v-if="user" class="hidden font-semibold sm:inline">{{ user.globalName ?? user.username }}</span>
        </UButton>
      </div>
      <div v-else>
        <UButton
          label="Login"
          size="md"
          color="primary"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
          icon="ic:round-discord"
        />
      </div>
    </template>
    <template #placeholder>
      <UButton
        label="Login"
        size="md"
        color="primary"
        variant="subtle"
        disabled
        block
        class="mb-3"
        icon="ic:round-discord"
      />
    </template>
  </AuthState>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { mobileLinks } = useHeader();
const { user, clear } = useAuth();

const items = ref<DropdownMenuItem[]>([
  {
    label: "Profile",
    icon: "i-lucide-user",
    to: "/profile",
  },
  {
    label: "Log Out",
    icon: "i-lucide-log-out",
    onSelect: () => clear(),
  },
]);

const avatarSrc = computed(() => {
  if (user.value?.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.value.id}/${user.value.avatar}.webp?size=64`;
  }
  return `https://cdn.discordapp.com/embed/avatars/${user.value && user.value.id ? BigInt(user.value.id) % BigInt(5) : "0"}.png`;
});
</script>
