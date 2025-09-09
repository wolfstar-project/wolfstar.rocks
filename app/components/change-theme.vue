<template>
  <ClientOnly v-if="!colorMode?.forced">
    <div class="theme-selector">
      <fieldset class="theme-fieldset">
        <legend class="sr-only">Select display theme</legend>
        <div class="theme-options">
          <label
            v-for="option in themeOptions"
            :key="option.value"
            class="theme-option"
            :class="{ active: colorMode.preference === option.value }"
          >
            <input
              type="radio"
              name="theme"
              class="sr-only theme-controller"
              :value="option.value"
              :checked="colorMode.preference === option.value"
              @change="colorMode.preference = option.value"
            />
            <span class="theme-icon">
              <UIcon :name="option.icon" class="w-4 h-4" />
            </span>
            <span class="whitespace-nowrap hidden sm:inline">{{ option.label }}</span>
          </label>
        </div>
      </fieldset>
    </div>

    <template #fallback>
      <div class="size-8"></div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

interface ThemeOption {
  value: string;
  label: string;
  icon: string;
}

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: "ph:sun-duotone" },
  { value: "dark", label: "Dark", icon: "ph:moon-duotone" },
  { value: "midnight", label: "Midnight", icon: "ph:moon-stars-duotone" },
  { value: "system", label: "System", icon: "ph:monitor-duotone" },
];
</script>

<style scoped>
@reference "@/assets/css/main.css";
.theme-selector {
	@apply relative;
}

.theme-fieldset {
	@apply border-0 p-0 m-0;
}

.theme-options {
	@apply flex items-center gap-1 p-1 bg-base-200 rounded-lg;
}

.theme-option {
	@apply relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all duration-200;
	@apply text-sm font-medium text-base-content/70;
	@apply hover:text-primary hover:bg-base-100;
}

.theme-option.active {
	@apply bg-primary text-primary-content shadow-sm;
}

.theme-icon {
	@apply flex items-center justify-center;
}

/* Screen reader only class */
.sr-only {
	@apply absolute w-px h-px p-0 -m-px overflow-hidden;
	clip: rect(0, 0, 0, 0);
	border: 0;
	white-space: nowrap;
}

/* Focus styles for accessibility */
.theme-option:focus-within {
	@apply ring-2 ring-primary ring-offset-2 ring-offset-base-100;
}
</style>
