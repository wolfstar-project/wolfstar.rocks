<template>
	<div>
		<h1>Guilds</h1>
		<p>Guilds you're in</p>
		<div>
			<h2>{{ guild.name }}</h2>
			<p>{{ guild.id }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
const id = useRouteParams('id');
if (!id.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Guild not found'
	});
}

const { guild } = await fetchGuildData(id.value as string);

async function fetchGuildData(guildId: string) {
	try {
		// Parallel fetch for efficiency
		const [guildData, guildSettings, channels, roles] = await Promise.all([
			$fetch(`/api/guilds/${guildId}`), // Basic guild info
			$fetch(`/api/guilds/${guildId}/settings`), // Bot settings
			$fetch(`/api/guilds/${guildId}/channels`), // Guild channels
			$fetch(`/api/guilds/${guildId}/roles`) // Guild roles (if needed)
		]);

		return {
			guild: guildData,
			settings: guildSettings,
			channels,
			roles
		};
	} catch (error) {
		console.error('Error fetching guild data:', error);
		throw error;
	}
}
</script>
