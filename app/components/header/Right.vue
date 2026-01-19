<template>
  <AuthState>
    <template #default="{ loggedIn }">
      <div v-if="loggedIn && user">
        <UDropdownMenu
          :items
          arrow
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8,
          }"
          :ui="{
            content: 'w-48',
          }"
        >
          <div class="flex items-center gap-2 cursor-pointer" role="button" aria-label="User menu" aria-haspopup="menu" tabindex="0">
            <UAvatar
              v-motion
              :initial="{ scale: 1 }"
              :hover="{ scale: 1.1, rotate: 5 }"
              :src="src"
              icon="lucide:image"
              size="2xs"
            />
            <span class="hidden font-semibold sm:inline">{{ user.name }}</span>
          </div>
        </UDropdownMenu>
      </div>
      <div v-else>
        <UButton
          :label
          size="md"
          color="primary"
          variant="subtle"
          to="/login"
          block
          class="inline-flex"
          icon="ic:round-discord"
          aria-label="Login with Discord"
        />
      </div>
    </template>
    <template #placeholder>
      <UButton
        :label
        size="md"
        color="primary"
        variant="subtle"
        disabled
        block
        class="inline-flex"
        icon="ic:round-discord"
        aria-label="Login with Discord (Loading)"
      />
    </template>
  </AuthState>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { user, logout } = useAuth();

const items = ref<DropdownMenuItem[]>([
  {
    label: "Profile",
    icon: "lucide:user",
    to: "/profile",
  },
  {
    label: "Log Out",
    icon: "lucide:log-out",
    ui: {
      itemLeadingIcon: "bg-red-500",
    },
    onSelect: logout,
  },
]);

const label = computed(() => (isSmallScreen.value ? undefined : "Login"));

const src = computed(() => avatarURL(user.value!));
</script>
