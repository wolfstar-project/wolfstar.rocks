<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    aria-label="User account menu"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'lucide:chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
      :aria-label="collapsed ? 'User menu' : `User menu for ${user?.name}`"
      aria-haspopup="true"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { avatarURL } from "#shared/utils/discord";

defineProps<{
  collapsed?: boolean;
}>();

const colorMode = useColorMode();
const { user: authUser, clear } = useAuth();

const src = computed(() =>
  avatarURL(authUser.value!, { size: 64 }),
);

const user = ref({
  name: authUser.value?.name,
  avatar: {
    src: src.value,
    alt: authUser.value?.name ? `${authUser.value.name}'s avatar` : "User avatar",
  },
});

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: "label",
  label: user.value?.name,
  avatar: user.value.avatar,
}], [{
  label: "Profile",
  icon: "lucide:user",
  to: "/profile",
}], [{
  label: "Appearance",
  icon: "lucide:sun-moon",
  children: [{
    label: "Light",
    icon: "lucide:sun",
    type: "checkbox",
    checked: colorMode.value === "light",
    onSelect(e: Event) {
      e.preventDefault();

      colorMode.preference = "light";
    },
  }, {
    label: "Dark",
    icon: "lucide:moon",
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
  label: "Log out",
  icon: "lucide:log-out",
  async onSelect(e: Event) {
    e.preventDefault();
    await clear();
    await navigateTo("/");
  },
}]]));
</script>
