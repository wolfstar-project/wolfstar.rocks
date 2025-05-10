<template>
    <div class="app-layout" :class="appName">
        <sections-app-navbar />
        <main class="mx-4 flex flex-grow flex-col items-center sm:mx-auto sm:w-5/6 lg:max-w-5xl xl:max-w-7xl">
            <slot></slot>
        </main>
        <div class="fixed right-4 bottom-4 z-50 flex space-x-2">
            <layout-scroll-to-top-button />
        </div>
        <sections-app-footer />
    </div>
</template>

<script setup lang="ts">
const appName = inject(ProviderAppNameKey)!;
</script>

<style scoped>
@reference "@/assets/css/main.css";
.app-layout {
    @apply flex min-h-screen flex-col;
    @apply bg-gradient-to-t bg-[radial-gradient(ellipse_at_calc(100vw*0.5)_0%,oklch(var(--color)/0.2),transparent_80%)] from-base-100 to-transparent bg-[length:max(100vw,600px)_50rem] bg-no-repeat;
}

.app-layout.wolfstar {
    --color: var(--color-branding-wolfstar);
}
</style>
