<template>
	<div>
		<layout-settings-section title="Logging Channels">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<SelectChannel
					v-for="channel in channelConfig.logging"
					:key="channel.key"
					v-bind="getChannelProps(channel)"
					:model-value="settings[channel.key]"
					:disabled="isLoading"
					@update:model-value="(value) => handleChannelUpdate(channel.key, value)"
					@reset="handleChannelReset(channel.key)"
				/>
			</div>
		</layout-settings-section>

		<layout-settings-section title="Logging Ignore Channels" class="mt-10 md:mt-20">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<SelectChannels
					v-for="channel in channelConfig.ignore"
					v-if="getChannelProps(channel).guild"
					:key="channel.key"
					v-bind="{ ...getChannelProps(channel), guild: getChannelProps(channel).guild! }"
					:model-value="settings[channel.key]"
					:disabled="isLoading"
					@update:model-value="(value) => handleChannelUpdate(channel.key, value)"
					@reset="handleChannelReset(channel.key)"
				/>
			</div>
		</layout-settings-section>
	</div>
</template>

<script setup lang="ts">
import type { Channels } from '~~/lib/types/types/ConfigurableData';

interface Channel {
	key: keyof ChannelSettings;
	guild?: boolean;
}

const { channelConfig, settings, updateChannelSetting, resetChannel, getChannelProps } = useGuildChannels();

const { isLoading, start, finish } = useLoadingIndicator({
	duration: 2000,
	throttle: 200
});

const filteredIgnoreChannels = computed(() => channelConfig.ignore.filter((channel) => getChannelProps(channel).guild));

const handleChannelUpdate = async (key: Channels.Channel, value: string | string[]) => {
	try {
		start();
		await updateChannelSetting(key, value);
		toast.success('Channel setting updated successfully');
	} catch (error) {
		console.error('Failed to update channel setting:', error);
		toast.error('Failed to update channel setting');
	} finally {
		finish();
	}
};

const handleChannelReset = async (key: keyof ChannelSettings) => {
	try {
		start();
		await resetChannel(key);
		toast.success('Channel setting reset successfully');
	} catch (error) {
		console.error('Failed to reset channel setting:', error);
		toast.error('Failed to reset channel setting');
	} finally {
		finish();
	}
};
</script>
