import useGuildData from './useGuildData';
import useGuildSettings from './useGuildSettings';
import type { GuildDataKey, GuildDataValue, GuildData } from '~~/lib/database';
import { ConfigurableIgnoreChannels, ConfigurableLoggingChannels } from '~~/shared/SettingsDataEntries';

const useGuildChannels = () => {
	const guildData = useGuildData();
	const { settings, changes } = useGuildSettings();

	const channelConfig = {
		ignore: ConfigurableIgnoreChannels,
		logging: ConfigurableLoggingChannels
	};

	const updateChannelSetting = (key: GuildDataKey, value: GuildDataValue) => {
		changes({ [key]: value });
	};

	const resetChannel = (key: GuildDataKey) => {
		changes({ [key]: undefined });
	};

	const getChannelSelectComponent = (key: GuildDataKey) => {
		const isMultiple = Array.isArray((settings.value as GuildData)?.[key]);
		return isMultiple ? 'SelectChannels' : 'SelectChannel';
	};

	const getChannelProps = (channel: (typeof ConfigurableLoggingChannels)[0]) => {
		return {
			label: channel.name,
			description: channel.description,
			modelValue: settings.value?.[channel.key],
			guild: guildData.value,
			class: 'w-full text-left min-h-[60px] md:min-h-[inherit]'
		};
	};

	return {
		channelConfig,
		settings: computed(() => settings.value),
		updateChannelSetting,
		resetChannel,
		getChannelSelectComponent,
		getChannelProps
	};
};

export default useGuildChannels;
