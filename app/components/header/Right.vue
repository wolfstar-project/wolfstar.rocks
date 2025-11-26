<template>
  <AuthState>
    <template #default="{ loggedIn }">
      <div v-if="loggedIn">
        <UDropdownMenu
          :items="items"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8,
          }"
          :ui="{
            content: 'w-48',
          }"
        >
          <UUser
            :ui="{ name: 'hidden font-semibold sm:inline' }"
            :name="user!.globalName ?? user!.username"
            size="sm"
            :avatar="{
              src,
              icon: 'i-lucide-image',
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
          to="/login"
          block
          class="hidden lg:inline-flex"
          icon="ic:round-discord"
          aria-label="Login with Discord"
        />
        <UButton
          size="md"
          color="primary"
          variant="subtle"
          to="/login"
          block
          class="lg:hidden"
          icon="ic:round-discord"
          aria-label="Login with Discord"
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
        class="hidden lg:inline-flex"
        icon="ic:round-discord"
        aria-label="Login with Discord (Loading)"
      />
      <UButton
        size="md"
        color="primary"
        variant="subtle"
        disabled
        block
        class="lg:hidden"
        icon="ic:round-discord"
        aria-label="Login with Discord (Loading)"
      />
    </template>
  </AuthState>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { user, clear } = useAuth();

const isDefault = ref(false);
const isAnimated = ref(false);

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

// Optimized avatar computation
const defaultAvatar = computed(() =>
  user.value?.id
    ? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.value.id) % BigInt(5)}.png`
    : "https://cdn.discordapp.com/embed/avatars/0.png",
);

const src = computed(() => {
  if (isDefault.value) {
    return defaultAvatar.value;
  }
  return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${isAnimated.value ? "gif" : "png"}`;
});

watch(
  user,
  (user) => {
    if (user) {
      isDefault.value = user.avatar === null;
      isAnimated.value = user.avatar?.startsWith("a_") ?? false;
    }
  },
  { immediate: true },
);
</script>
