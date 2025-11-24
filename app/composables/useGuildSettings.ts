import type { Channels, Events, Moderation, Roles } from "#shared/types/ConfigurableData";
import {
  ConfigurableIgnoreChannels,
  ConfigurableLoggingChannels,
  ConfigurableMessageEvents,
  ConfigurableModerationEvents,
  ConfigurableModerationKeys,
  ConfigurableRemoveInitialRole,
  ConfigurableRoles,
} from "#shared/types/SettingsDataEntries";

// Composable for general settings
export function useGuildGeneral() {
  const { settings } = useGuildSettingsStore();

  const generalConfig = {
    prefix: {
      key: "prefix" as const,
      name: "Prefix",
      description: "This is your server's prefix, use it to trigger WolfStar commands.",
      placeholder: "w!",
      maxLength: 10,
    },
    language: {
      key: "language" as const,
      name: "Language",
      description: "Select the language you want for this guild",
    },
    disableNaturalPrefix: {
      key: "disableNaturalPrefix" as const,
      name: "Disable Natural Prefix",
      description: "Disable using the bot mention as a prefix",
    },
  };

  return {
    generalConfig,
    settings,
  };
}

// Composable for roles settings using SettingsDataEntries
export function useGuildRoles() {
  const { settings } = useGuildSettingsStore();

  const roleConfig = {
    removeInitial: ConfigurableRemoveInitialRole,
    roles: ConfigurableRoles,
  };

  const getRoleProps = (role: Roles.Role) => {
    return {
      label: role.name,
      title: role.name,
      description: role.tooltip,
    };
  };

  return {
    roleConfig,
    settings,
    getRoleProps,
  };
}

// Composable for moderation settings using SettingsDataEntries
export function useGuildModeration() {
  const { settings } = useGuildSettingsStore();

  const moderationConfig = {
    messages: ConfigurableModerationKeys,
    events: ConfigurableModerationEvents,
  };

  const getModerationProps = (message: Moderation.Message) => {
    return {
      title: message.name,
      description: message.description,
    };
  };

  const getEventProps = (event: Events.Event) => {
    return {
      title: event.title,
      description: event.description,
    };
  };

  return {
    moderationConfig,
    settings,
    getModerationProps,
    getEventProps,
  };
}

// Composable for events settings using SettingsDataEntries
export function useGuildEvents() {
  const { settings } = useGuildSettingsStore();

  const eventsConfig = {
    moderation: ConfigurableModerationEvents,
    messages: ConfigurableMessageEvents,
  };

  const getEventProps = (event: Events.Event) => {
    return {
      title: event.title,
      description: event.description,
    };
  };

  return {
    eventsConfig,
    settings,
    getEventProps,
  };
}

// Composable for channels settings using SettingsDataEntries
export function useGuildChannels() {
  const { settings } = useGuildSettingsStore();

  const channelsConfig = {
    logging: ConfigurableLoggingChannels,
    ignore: ConfigurableIgnoreChannels,
  };

  const getChannelProps = (channel: Channels.Channel) => {
    return {
      label: channel.name,
      description: channel.description,
    };
  };

  const getIgnoreChannelProps = (channel: Channels.IgnoreChannel) => {
    return {
      label: channel.name,
      description: channel.description,
    };
  };

  return {
    channelsConfig,
    settings,
    getChannelProps,
    getIgnoreChannelProps,
  };
}
