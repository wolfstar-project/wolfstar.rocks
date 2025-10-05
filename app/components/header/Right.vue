<template>
  <AuthState>
    <template #default="{ loggedIn }">
      <div v-if="loggedIn">
        <UDropdownMenu
          :items="items"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8
          }"
          :ui="{
            content: 'w-48'
          }"
        >
          <UUser
            :ui="{ name: 'hidden font-semibold sm:inline' }"
            :name="user!.globalName ?? user!.username"
            :avatar="{
              src: avatarSrc,
              icon: 'i-lucide-image',
              size: 'md'
            }"
          />
        </UDropdownMenu>
      </div>
      <div v-else>
        <UButton
          label="Login"
          size="md"
          color="primary"
          variant="subtle"
          to="/api/auth/discord"
          block
          class="mb-3 hidden lg:inline-flex"
          icon="ic:round-discord"
        />
        <UButton
          size="md"
          color="primary"
          variant="subtle"
          to="/api/auth/discord"
          block
          class="mb-3 lg:hidden"
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
        class="mb-3 hidden lg:inline-flex"
        icon="ic:round-discord"
      />
      <UButton
        size="md"
        color="primary"
        variant="subtle"
        disabled
        block
        class="mb-3 lg:hidden"
        icon="ic:round-discord"
      />
    </template>
  </AuthState>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

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
    ui: {
      itemLeadingIcon: "bg-red-500",
    },
    kbds: ["shift", "meta", "q"],
    onSelect: async () => {
      await clear();
      navigateTo("/");
    },
  },
]);

const avatarSrc = computed(() => {
  if (user.value?.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.value.id}/${user.value.avatar}.webp?size=64`;
  }
  return `https://cdn.discordapp.com/embed/avatars/${user.value && user.value.id ? BigInt(user.value.id) % BigInt(5) : "0"}.png`;
});
</script>
