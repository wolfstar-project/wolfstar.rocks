<template>
	<Head>
		<Title>Profile</Title>
		<Meta name="description" content="Manage your profile and servers" />
	</Head>
	<div v-if="user" class="container mx-auto max-w-7xl px-4">
		<!-- Profile Header -->

		<div else class="border-base-300 border-b py-8">
			<!-- Avatar and Name Section -->
			<div class="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
				<div class="avatar">
					<div class="ring-primary ring-offset-base-100 h-24 w-24 overflow-hidden rounded-full ring ring-offset-2">
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
							<img
								:src="createUrl('png', 128)"
								alt="Avatar"
								class="h-full w-full object-cover"
								decoding="async"
								crossorigin="anonymous"
							/>
						</picture>
					</div>
				</div>
				<div class="text-center sm:text-left">
					<h1 class="text-4xl font-bold">
						{{ user.name }}
					</h1>
				</div>
			</div>
		</div>
		<div v-if="error" class="alert alert-error py-8">
			<h2 class="mb-6 text-2xl font-semibold">Error:</h2>
			<div class="card card-bordered">
				<div class="card-body items-center text-center">
					<pre><code>{{ error }}</code></pre>
				</div>
			</div>
		</div>
		<!-- Guilds Section -->
		<div v-if="!error" class="py-8">
			<h2 class="mb-6 text-2xl font-semibold">Your Servers</h2>

			<div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div v-for="i in 3" :key="i" class="skeleton bg-base-300 h-48 rounded-lg"></div>
			</div>

			<div v-else class="card card-bordered">
				<div class="card-body items-center text-center">
					<p class="text-base-content/60">No servers found</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from '~~/shared/types';

const { user } = useAuth();

definePageMeta({ alias: ['/account'] });

const isLoading = useState(() => false);
const error = ref<Error | null>(null);
const isAnimated = ref(false);
const isDefault = ref(false);

const guilds = useState<TransformedLoginData['transformedGuilds'] | null>(() => null);

// Fetch user on mount
onMounted(async () => {
	try {
		const { data } = await useClientTrpc().users.me.useQuery();
		if (data.value === null) throw createError('User not found');
		guilds.value = data.value.transformedGuilds;

		consola.info(`Data Fetched: ${data.value}`);
		isLoading.value = true;
	} catch (err) {
		if (err instanceof Error) {
			error.value = err;
			captureException(err);
		}
	} finally {
		isLoading.value = false;
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

definePageMeta({ auth: true });
</script>
