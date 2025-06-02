<template>
	<NuxtLink
		:to="guild.wolfstarIsIn ? `/guilds/${guild.id}` : guildAddURL(guild.id)"
		class="block transition-transform duration-200 hover:scale-105"
	>
		<ShadCard variant="soft" class="h-full">
			<template #header>
				<div class="flex items-center gap-3">
					<guild-icon :guild="guild" size="16" />
					<div class="text-center">
						<h3 class="text-base font-medium text-base-content">{{ guild.name }}</h3>
					</div>
				</div>
			</template>
			<template v-if="guild.description" #default>
				<p>
					{{ guild.description }}
				</p>
			</template>
			<template #footer>
				<p v-if="!guild.wolfstarIsIn" class="mt-1 text-xs text-base-content/60">Click to invite</p>
			</template>
		</ShadCard>
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
