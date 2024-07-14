export const Invites = {
	WolfStar: 'https://discord.com/oauth2/authorize?client_id=&permissions=534185897078&scope=bot%20applications.commands'
};

export enum Colors {
	White = '#e7e7e8',
	Amber = '#ffc107',
	Amber300 = '#ffd54f',
	Blue = '#2196f3',
	BlueGrey = '#607d8b',
	Brown = '#795548',
	Cyan = '#00bcd4',
	DeepOrange = '#ff5722',
	DeepPurple = '#673ab7',
	Green = '#4caf50',
	Grey = '#9e9e9e',
	Indigo = '#3f51b5',
	LightBlue = '#03a9f4',
	LightGreen = '#8bc34a',
	Lime = '#cddc39',
	Lime300 = '#dce775',
	Orange = '#ff9800',
	Pink = '#e91e63',
	Purple = '#9c27b0',
	Red = '#f44336',
	Red300 = '#e57373',
	Teal = '#009688',
	Yellow = '#ffeb3b',
	Yellow300 = '#fff176'
}

export const ModerationActions = {
	Ban: { color: Colors.Red, name: 'Ban', temporary: Colors.Red300, undo: Colors.LightBlue },
	Kick: { color: Colors.Orange, name: 'Kick', temporary: null, undo: null },
	Mute: { color: Colors.Amber, name: 'Mute', temporary: Colors.Amber300, undo: Colors.LightBlue },
	Softban: { color: Colors.DeepOrange, name: 'Softban', temporary: null, undo: null },
	Timeout: { color: Colors.Amber, name: 'Timeout', temporary: Colors.Amber, undo: Colors.LightBlue },
	VoiceKick: { color: Colors.Orange, name: 'Voice Kick', temporary: null, undo: null },
	VoiceMute: { color: Colors.Amber, name: 'Voice Mute', temporary: Colors.Amber300, undo: Colors.LightBlue },
	Warning: { color: Colors.Yellow, name: 'Warning', temporary: Colors.Yellow300, undo: Colors.LightBlue }
};

export const ProviderAppNameKey = Symbol() as InjectionKey<Ref<'wolfstar'>>;

export interface ExpirableLocalStorageStructure<T> {
	expire: number;
	data: T;
}

export enum LocalStorageKeys {
	HasCookieConsent = 'allows_cookies',
	DiscordPack = 'discord_pack',
	LastSync = 'last_sync',
	Commands = 'commands',
	Languages = 'languages'
}

export enum FetchMethods {
	Post = 'POST',
	Patch = 'PATCH',
	Get = 'GET'
}

export const EmojiRegexExtractName = /<?a?:(\w{2,32}):\d{17,21}>?/gim;
export const SettingsDrawerWidth = 240;

/**
 * Regex that matches the OAUTH2 `code` in the Discord callback URL
 * @raw `/\?code=(?<code>[A-Za-z0-9]+)/i`
 * @remark The regex is case insensitive
 * @remark Capture group 1 is the code. It is named `code`.
 */
export const CodeMatchRegex = /\?code=(?<code>[A-Za-z0-9]+)/i;
