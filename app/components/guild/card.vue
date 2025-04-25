<template>
	<NuxtLink
		:to="guild.wolfstarIsIn ? `/guilds/${guild.id}` : guildAddURL(guild.id)"
		class="card flex flex-col items-center rounded-lg p-4 transition-colors duration-200 hover:bg-base-300"
	>
		<div class="card-header flex items-center gap-3">
			<guild-icon :guild="guild" size="16" />
			<div class="text-center">
				<h3 class="card-title text-base-content">{{ guild.name }}</h3>
				<p v-if="!guild.wolfstarIsIn" class="card-subtitle text-base-content/60">Click to invite</p>
			</div>
		</div>
	</NuxtLink>
</template>

<script setup lang="ts">
import type { ValuesType } from 'utility-types';
import type { TransformedLoginData } from '~~/shared/types/discord';

interface GuildCardProps {
	guild: ValuesType<NonNullable<TransformedLoginData['transformedGuilds']>>;
}

defineProps<GuildCardProps>();
</script>
<style scoped>
@reference '@/assets/css/main.css';
.card {
	@apply bg-base-200;
}

.card-header {
	@apply flex items-center;
}

.card-title {
	@apply text-sm font-medium;
}

.card-subtitle {
	@apply mt-1 text-xs;
}
</style>
