<template>
    <div>
        <section class="prose max-w-none prose-stone dark:prose-invert">
            <client-only>
                <template v-if="!guildId">
                    <h1>Missing guild ID</h1>
                    <p>Please use the <code>Login</code> button instead or click <NuxtLink to="/login" class="underline">here</NuxtLink>.</p>
                </template>
            </client-only>
        </section>
    </div>
</template>

<script setup lang="ts">
const router = useRouter();
const guildId = ref<string | null>(null);

const { start, finish } = useLoadingIndicator({
    duration: 1500,
});

onMounted(async () => {
    // Start the loading indicator
    start();
    const queryGuildId = useRouteParams('guildid');
    if (queryGuildId && typeof queryGuildId.value === 'string') {
        guildId.value = queryGuildId.value;

        // Finish loading and redirect
        finish();
        router.push(`/guilds/${guildId.value}`);
    }
});

useSeoMeta({
    title: 'Auth Guild Callback',
    robots: { none: true },
    ogTitle: 'OAuth Guild Callback',
    ogDescription: '"A landing page for the OAuth2.0 guild callback flow.',
});
</script>
