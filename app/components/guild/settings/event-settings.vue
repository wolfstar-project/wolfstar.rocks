<template>
	<layout-settings-section title="Moderation Events">
		<p class="mb-4 text-sm">
			These events involve moderation actions and require that you setup the Moderation Logs channel on
			<nuxt-link :to="`/guilds/${guildId}/channels`" class="link"> the Channels page </nuxt-link>
		</p>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<SelectBoolean
				v-for="{ title, key, description } in eventsConfig.moderation"
				:key="key"
				:title="title"
				:description="description"
				:model-value="guildSettings[key]"
				@update:model-value="(value) => updateEventSetting(key, value)"
			/>
		</div>
	</layout-settings-section>

	<layout-settings-section title="Message Events">
		<p class="mb-4 text-sm">
			These events involve message events, the channels to set up vary on the type of event and each channel can be configured on
			<nuxt-link :to="`/guilds/${guildId}/channels`" class="link"> the Channels page </nuxt-link>
		</p>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<SelectBoolean
				v-for="{ title, key, description } in eventsConfig.messages"
				:key="key"
				:title="title"
				:description="description"
				:model-value="guildSettings[key]"
				@update:model-value="(value) => updateEventSetting(key, value)"
			/>
		</div>
	</layout-settings-section>
</template>

<script setup lang="ts">
const guildId = useRouteParams('guildId');

const { eventsConfig, guildSettings, updateEventSetting } = useGuildEvents();
</script>
