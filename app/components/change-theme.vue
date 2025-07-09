<template>
  <div class="theme-selector">
    <fieldset class="theme-fieldset">
      <legend class="sr-only">Select display theme</legend>
      <div class="theme-options">
        <label 
          v-for="option in themeOptions" 
          :key="option.value"
          class="theme-option"
          :class="{ 'active': colorMode.preference === option.value }"
        >
          <input
            v-model="colorMode.preference"
            type="radio"
            :value="option.value"
            class="sr-only"
          />
          <span class="theme-icon">
            <ShadIcon :name="option.icon" class="w-4 h-4" />
          </span>
          <span class="md:hidden whitespace-nowrap">{{ option.label }}</span>
        </label>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

interface ThemeOption {
  value: string
  label: string
  icon: string
}

const themeOptions: ThemeOption[] = [
  { value: 'system', label: 'System', icon: 'ph:monitor-duotone' },
  { value: 'light', label: 'Light', icon: 'ph:sun-duotone' },
  { value: 'dark', label: 'Dark', icon: 'ph:moon-duotone' }
]
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
  white-space: nowrap;
  border: 0;
}

/* Focus styles for accessibility */
.theme-option:focus-within {
  @apply ring-2 ring-primary ring-offset-2 ring-offset-base-100;
}
</style>
