import type { Channels, Events, Moderation, Roles } from "#shared/types/ConfigurableData";
import type { GuildData } from "~~/server/database";
import {
  ConfigurableIgnoreChannels,
  ConfigurableLoggingChannels,
  ConfigurableMessageEvents,
  ConfigurableModerationEvents,
  ConfigurableModerationKeys,
  ConfigurableRemoveInitialRole,
  ConfigurableRoles,
} from "#shared/types/SettingsDataEntries";
import { storeToRefs } from "pinia";

function useGuildSettings() {
  const guildStore = useGuildStore();
  const { mergedSettings, hasChanges } = storeToRefs(guildStore);
  const { setChanges, resetChange, resetAllChanges } = guildStore;

  return {
    settings: readonly(mergedSettings) as Readonly<Ref<GuildData>>,
    resetChanges: resetChange,
    resetAllChanges,
    hasChanges: readonly(hasChanges),
    changes: setChanges,
  };
}

// Composable for general settings
export function useGuildGeneral() {
  const { settings, changes } = useGuildSettings();

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

  const updateGeneralSetting = (key: string, value: any) => {
    changes({ [key]: value });
  };

  return {
    generalConfig,
    settings,
    updateGeneralSetting,
  };
}

// Composable for roles settings using SettingsDataEntries
export function useGuildRoles() {
  const { settings, changes } = useGuildSettings();

  const roleConfig = {
    removeInitial: ConfigurableRemoveInitialRole,
    roles: ConfigurableRoles,
  };

  const updateRoleSetting = (key: string, value: any) => {
    changes({ [key]: value });
  };

  const resetRole = (key: string) => {
    changes({ [key]: null });
  };

  const getRoleSelectComponent = (key: string): "SelectRole" | "SelectRoles" => {
    // Multiple selection roles
    const multipleRoles = ["rolesPublic", "rolesAdmin", "rolesModerator"];
    return multipleRoles.includes(key) ? "SelectRoles" : "SelectRole";
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
    updateRoleSetting,
    resetRole,
    getRoleSelectComponent,
    getRoleProps,
  };
}

// Composable for moderation settings using SettingsDataEntries
export function useGuildModeration() {
  const { settings, changes } = useGuildSettings();

  const moderationConfig = {
    messages: ConfigurableModerationKeys,
    events: ConfigurableModerationEvents,
  };

  const updateModerationSetting = (key: string, value: any) => {
    changes({ [key]: value });
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
    updateModerationSetting,
    getModerationProps,
    getEventProps,
  };
}

// Composable for events settings using SettingsDataEntries
export function useGuildEvents() {
  const { settings, changes } = useGuildSettings();

  const eventsConfig = {
    moderation: ConfigurableModerationEvents,
    messages: ConfigurableMessageEvents,
  };

  const updateEventSetting = (key: string, value: any) => {
    changes({ [key]: value });
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
    updateEventSetting,
    getEventProps,
  };
}

// Composable for channels settings using SettingsDataEntries
export function useGuildChannels() {
  const { settings, changes } = useGuildSettings();

  const channelsConfig = {
    logging: ConfigurableLoggingChannels,
    ignore: ConfigurableIgnoreChannels,
  };

  const updateChannelSetting = (key: string, value: any) => {
    changes({ [key]: value });
  };

  const resetChannel = (key: string) => {
    changes({ [key]: null });
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
    updateChannelSetting,
    resetChannel,
    getChannelProps,
    getIgnoreChannelProps,
  };
}

export default useGuildSettings;
