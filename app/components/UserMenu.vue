<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const colorMode = useColorMode();
const { user: authUser } = useAuth();

const isDefault = ref(false);

// Computed properties for consistent state
const defaultAvatar = computed(
  () => `https://cdn.discordapp.com/embed/avatars/${authUser.value && authUser.value.id ? BigInt(authUser.value.id) % BigInt(5) : "0"}.png`,
);

const src = computed(() => {
  if (isDefault.value) {
    return defaultAvatar.value;
  }
  return createUrl("webp", 64);
});

const user = ref({
  name: authUser.value?.name,
  avatar: {
    src: src.value,
    alt: authUser.value?.name,
  },
});

// Watch user changes for avatar state
watch(
  authUser,
  (user) => {
    if (user && user.avatar) {
      isDefault.value = false;
    }
    else {
      isDefault.value = true;
    }
  },
  { immediate: true },
);

function createUrl(format: "webp" | "png" | "gif", size: number) {
  return `https://cdn.discordapp.com/avatars/${authUser.value!.id}/${authUser.value!.avatar}.${format}?size=${size}`;
}

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: "label",
  label: user.value?.name,
  avatar: user.value.avatar,
}], [{
  label: "Profile",
  icon: "i-lucide-user",
}, {
  label: "Billing",
  icon: "i-lucide-credit-card",
}, {
  label: "Settings",
  icon: "i-lucide-settings",
  to: "/settings",
}], [{
  label: "Appearance",
  icon: "i-lucide-sun-moon",
  children: [{
    label: "Light",
    icon: "i-lucide-sun",
    type: "checkbox",
    checked: colorMode.value === "light",
    onSelect(e: Event) {
      e.preventDefault();

      colorMode.preference = "light";
    },
  }, {
    label: "Dark",
    icon: "i-lucide-moon",
    type: "checkbox",
    checked: colorMode.value === "dark",
    onUpdateChecked(checked: boolean) {
      if (checked) {
        colorMode.preference = "dark";
      }
    },
    onSelect(e: Event) {
      e.preventDefault();
    },
  }],
}], [{
  label: "GitHub repository",
  icon: "i-simple-icons-github",
  to: "https://github.com/nuxt-ui-templates/dashboard",
  target: "_blank",
}, {
  label: "Log out",
  icon: "i-lucide-log-out",
}]]));
</script>
