export const Invites = {
  WolfStar: `https://discord.com/oauth2/authorize?client_id=&permissions=534185897078&scope=bot%20applications.commands`,
  Staryl: "",
};

export const robotBlockingPageProps = "nosnippet,notranslate,noimageindex,noarchive,max-snippet:-1,max-image-preview:none,max-video-preview:-1";

export const colors = ["primary", "secondary", "success", "error", "info", "warning", "neutral"] as const;

export type UIColors = (typeof colors)[number];

export enum BrandingColors {
  Primary = "#050505",
  Secondary = "#fd171b",
}

export enum ThemeColors {
  themeLight = "#ffffff",
  themeDark = "#121212",
};

export enum Colors {
  White = "#e7e7e8",
  Amber = "#ffc107",
  Amber300 = "#ffd54f",
  Blue = "#2196f3",
  BlueGrey = "#607d8b",
  Brown = "#795548",
  Cyan = "#00bcd4",
  DeepOrange = "#ff5722",
  DeepPurple = "#673ab7",
  Green = "#4caf50",
  Grey = "#9e9e9e",
  Indigo = "#3f51b5",
  LightBlue = "#03a9f4",
  LightGreen = "#8bc34a",
  Lime = "#cddc39",
  Lime300 = "#dce775",
  Orange = "#ff9800",
  Pink = "#e91e63",
  Purple = "#9c27b0",
  Red = "#f44336",
  Red300 = "#e57373",
  Teal = "#009688",
  Yellow = "#ffeb3b",
  Yellow300 = "#fff176",
}

export interface ModerationAction {
  color: Colors;
  name: string;
  temporary: Colors | null;
  undo: Colors | null;
}

export interface LoggingEventDetail {
  tooltip: string;
  title: string;
  icon: string;
  color: string;
  action: string;
  details: { label: string; value: string }[];
}

export const loggingEvents: LoggingEventDetail[] = [
  {
    tooltip: "Member Join",
    title: "member joins",
    icon: "ph:user-plus-fill",
    color: "#FFA500",
    action: "User Joined",
    details: [
      { label: "User", value: "@newmember (123456789012345678)" },
      { label: "Account Created", value: "2023-01-01 12:00:00 UTC" },
    ],
  },
  {
    tooltip: "Member Leave",
    title: "member leaves",
    icon: "ph:user-minus-fill",
    color: "#FF6B6B",
    action: "User Left",
    details: [
      { label: "User", value: "@oldmember (987654321098765432)" },
      { label: "Roles", value: "@Member, @Verified" },
      { label: "Joined At", value: "2023-06-15 08:30:00 UTC" },
    ],
  },
  {
    tooltip: "Message Delete",
    title: "message deletions",
    icon: "ph:trash-simple-fill",
    color: "#E74C3C",
    action: "Message Deleted",
    details: [
      { label: "User", value: "@someone (456789012345678901)" },
      { label: "Channel", value: "#general" },
      { label: "Content", value: "This message has been deleted" },
    ],
  },
  {
    tooltip: "Message Edit",
    title: "message edits",
    icon: "ph:pencil-simple-fill",
    color: "#3498DB",
    action: "Message Edited",
    details: [
      { label: "User", value: "@editor (234567890123456789)" },
      { label: "Channel", value: "#chat" },
      { label: "Before", value: "Original message" },
      { label: "After", value: "Edited message" },
    ],
  },
  {
    tooltip: "Channel Create",
    title: "channel creation",
    icon: "ph:hash-fill",
    color: "#2ECC71",
    action: "Channel Created",
    details: [
      { label: "Channel", value: "#new-channel" },
      { label: "Type", value: "Text Channel" },
      { label: "Created By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Channel Delete",
    title: "channel deletion",
    icon: "ph:hash-straight-fill",
    color: "#E67E22",
    action: "Channel Deleted",
    details: [
      { label: "Channel", value: "#old-channel" },
      { label: "Type", value: "Text Channel" },
      { label: "Deleted By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Channel Update",
    title: "channel updates",
    icon: "ph:hash-fill",
    color: "#F39C12",
    action: "Channel Updated",
    details: [
      { label: "Channel", value: "#general" },
      { label: "Changes", value: "Name changed from #old-general to #general" },
      { label: "Updated By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Role Create",
    title: "role creation",
    icon: "ph:shield-plus-fill",
    color: "#9B59B6",
    action: "Role Created",
    details: [
      { label: "Role", value: "@NewRole" },
      { label: "Color", value: "#5865F2" },
      { label: "Created By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Role Update",
    title: "role updates",
    icon: "ph:shield-check-fill",
    color: "#1ABC9C",
    action: "Role Updated",
    details: [
      { label: "Role", value: "@Moderator" },
      { label: "Changes", value: "Permissions updated" },
      { label: "Updated By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Role Delete",
    title: "role deletion",
    icon: "ph:shield-minus-fill",
    color: "#E91E63",
    action: "Role Deleted",
    details: [
      { label: "Role", value: "@OldRole" },
      { label: "Color", value: "#99AAB5" },
      { label: "Deleted By", value: "@admin (112233445566778899)" },
    ],
  },
];

export const ModerationActions: Record<string, ModerationAction> = {
  Ban: {
    color: Colors.Red,
    name: "Ban",
    temporary: Colors.Red300,
    undo: Colors.LightBlue,
  },
  Kick: { color: Colors.Orange, name: "Kick", temporary: null, undo: null },
  Mute: {
    color: Colors.Amber,
    name: "Mute",
    temporary: Colors.Amber300,
    undo: Colors.LightBlue,
  },
  Softban: {
    color: Colors.DeepOrange,
    name: "Softban",
    temporary: null,
    undo: null,
  },
  Timeout: {
    color: Colors.Amber,
    name: "Timeout",
    temporary: Colors.Amber,
    undo: Colors.LightBlue,
  },
  VoiceKick: {
    color: Colors.Orange,
    name: "Voice Kick",
    temporary: null,
    undo: null,
  },
  VoiceMute: {
    color: Colors.Amber,
    name: "Voice Mute",
    temporary: Colors.Amber300,
    undo: Colors.LightBlue,
  },
  Warning: {
    color: Colors.Yellow,
    name: "Warning",
    temporary: Colors.Yellow300,
    undo: Colors.LightBlue,
  },
};

// eslint-disable-next-line symbol-description
export const ProviderAppNameKey = Symbol() as InjectionKey<Ref<"wolfstar" | "staryl">>;

export const Profiles = {
  wolfstar: { name: "WolfStar", app: true, verified: true },
  baddie: { name: "Baddie", app: false, verified: false },
  stella: { name: "Stella", app: false, verified: false },
} as const satisfies Record<string, Profile>;

export interface Profile {
  name: string;
  app: boolean;
  verified: boolean;
}

export type ProfileName = keyof typeof Profiles;

export const OtherApps = {
  WolfStar: {
    name: "WolfStar",
    explore: "/",
    avatar: "/avatars/wolfstar.png",
    invite: Invites.WolfStar,
    purposes: ["Moderation", "Logging"],
    description: "An app to help you manage your server's moderation and logging.",
  },
  Staryl: {
    name: "Staryl",
    explore: "/",
    avatar: "/avatars/staryl.png",
    invite: Invites.Staryl,
    purposes: ["Social", "Notification"],
    description: "An app to help you manage your server's social notifications (Twitch, Instragram and etc.).",
  },
} as const satisfies Record<string, OtherApp>;

export interface OtherApp {
  name: string;
  explore: `/${string}`;
  avatar: `/avatars/${string}`;
  invite: string;
  purposes: readonly string[];
  description: string;
}

export interface ExpirableLocalStorageStructure<T> {
  expire: number;
  data: T;
}

export enum LocalStorageKeys {
  Commands = "commands",
  Languages = "languages",
}

export const EmojiRegexExtractName = /<?a?:(\w{2,32}):\d{17,21}>?/gi;
export const SettingsDrawerWidth = 240;
