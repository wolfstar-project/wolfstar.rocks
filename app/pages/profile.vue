<template>
	<Head>
		<Title>Profile</Title>
		<Meta name="description" content="Manage your profile and servers" />
	</Head>

	<div v-if="user" class="container mx-auto max-w-7xl space-y-8 px-4 py-8">
		<section class="flex flex-col items-center justify-center space-y-4 rounded-lg bg-base-200 p-8">
			<div class="avatar">
				<div class="h-32 w-32 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
					<img
						v-if="isDefault"
						:src="defaultAvatar"
						alt="Default Avatar"
						class="h-full w-full object-cover"
						decoding="async"
						crossorigin="anonymous"
					/>
					<picture v-else>
						<source
							v-if="isAnimated"
							media="(prefers-reduced-motion: no-preference), (prefers-reduced-data: no-preference)"
							type="image/gif"
							:srcset="makeSrcset('gif')"
						/>
						<source type="image/webp" :srcset="makeSrcset('webp')" />
						<source type="image/png" :srcset="makeSrcset('png')" />
						<img :src="createUrl('png', 128)" alt="Avatar" class="h-full w-full object-cover" decoding="async" crossorigin="anonymous" />
					</picture>
				</div>
			</div>
			<div class="text-center">
				<h1 class="text-3xl font-bold">{{ user.name }}</h1>
				<p class="text-base-content/60">User ID: {{ user.id }}</p>
			</div>
		</section>

		<section v-if="error" class="alert alert-error">
			<h2 class="mb-4 text-xl font-semibold">Error Occurred</h2>
			<pre class="overflow-x-auto"><code>{{ error }}</code></pre>
		</section>

		<section v-else class="space-y-4">
			<div v-if="guilds !== undefined" class="container mx-auto pb-8">
				<h2 class="mb-2 text-3xl font-bold">Servers</h2>
				<p class="mb-8 text-base-content/60">Servers you're in ({{ guilds?.length ?? 0 }} servers)</p>

				<!-- Server Grid -->
				<guild-cards :guilds="guilds" />
			</div>
			<div v-else class="flex items-center justify-center rounded-lg bg-base-200 p-8">
				<p class="text-base-content/60">No servers found</p>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
definePageMeta({ alias: ['/account'], auth: true });

const { user } = useAuth();
const { start, finish } = useLoadingIndicator({
	duration: 2000,
	throttle: 200
});
const error = ref<Error | null>(null);
const isAnimated = ref(false);
const isDefault = ref(false);

const {
	data: guilds,
	status,
	error: fetchError
} = await useFetch('/api/users', {
	transform: (response) => response.transformedGuilds ?? null
});

watch(fetchError, (newError) => {
	if (newError) {
		error.value = newError;
		captureException(newError);
		finish({ error: true });
	}
});

const pending = ref(status.value === 'pending');

watch(pending, (isPending) => {
	if (isPending) {
		start();
	} else {
		finish();
	}
});

const defaultAvatar = computed(() =>
	user.value?.id
		? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.value.id) % BigInt(5)}.png`
		: 'https://cdn.discordapp.com/embed/avatars/0.png'
);

watch(
	user,
	(user) => {
		if (user?.avatar) {
			isDefault.value = false;
			isAnimated.value = user.avatar.startsWith('a_');
		} else {
			isDefault.value = true;
			isAnimated.value = false;
		}
	},
	{ immediate: true }
);

function createUrl(format: 'webp' | 'png' | 'gif', size: number) {
	return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${format}?size=${size}`;
}

function makeSrcset(format: 'webp' | 'png' | 'gif') {
	return `${createUrl(format, 64)} 1x, ${createUrl(format, 128)} 2x, ${createUrl(format, 256)} 3x, ${createUrl(format, 512)} 4x`;
}
</script>
