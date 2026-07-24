import type {
	DiscordAppLauncherEntry,
	DiscordAppLauncherListView,
	DiscordAppLauncherPromo,
} from "~/types/discord";

/** Default Recents row for the Discord App Launcher demo. */
export const discordAppLauncherRecents: readonly DiscordAppLauncherEntry[] = [
	{
		id: "wolfstar-conf-menu",
		name: "WolfStar Beta",
		description: "> Customizable moderation and more!",
		avatar: "/avatars/wolfstar.png",
		kind: "command",
		commandName: "conf",
		tileTitle: "conf menu",
		tileSubtitle: "WolfStar Beta",
	},
	{
		id: "flamey-commands",
		name: "Flamey",
		description: "Flamey is a highly customizable, interactive all-in-one Discord bot.",
		icon: "ph:flame-fill",
		iconBg: "oklch(58% 0.2 250)",
		tileTitle: "commands",
		tileSubtitle: "Flamey",
	},
	{
		id: "staryl",
		name: "Staryl",
		avatar: "/avatars/staryl.png",
	},
	{
		id: "grid-a",
		name: "Blips",
		icon: "ph:circles-three-fill",
		iconBg: "oklch(55% 0.16 250)",
	},
	{
		id: "grid-b",
		name: "Pulse",
		icon: "ph:squares-four-fill",
		iconBg: "oklch(52% 0.14 255)",
	},
	{
		id: "eightball",
		name: "8 Ball",
		icon: "ph:number-circle-eight-fill",
		iconBg: "oklch(32% 0.06 260)",
	},
	{
		id: "diamond",
		name: "Gem",
		icon: "ph:diamond-fill",
		iconBg: "oklch(58% 0.18 250)",
	},
	{
		id: "wolfy",
		name: "Wolfy",
		icon: "ph:grid-four-fill",
		iconBg: "oklch(68% 0.12 255)",
	},
];

/** Apps listed under “Apps in this Server”. */
export const discordAppLauncherServerApps: readonly DiscordAppLauncherEntry[] = [
	{
		id: "wolfstar",
		name: "WolfStar Beta",
		description: "> Customizable moderation and more!",
		avatar: "/avatars/wolfstar.png",
	},
	{
		id: "flamey",
		name: "Flamey",
		description: "Flamey is a highly customizable, interactive all-in-one Discord bot.",
		icon: "ph:flame-fill",
		iconBg: "oklch(58% 0.2 250)",
	},
	{
		id: "staryl",
		name: "Staryl",
		avatar: "/avatars/staryl.png",
	},
	{
		id: "wolfy",
		name: "Wolfy",
		icon: "ph:grid-four-fill",
		iconBg: "oklch(68% 0.12 255)",
	},
];

/** Promoted activity cards, rendered as local CSS artwork rather than remote assets. */
export const discordAppLauncherPromoted: readonly DiscordAppLauncherPromo[] = [
	{
		id: "wordle",
		title: "Wordle",
		subtitle: "The New York Times Games",
		description: "Play Wordle from New York Times Games.",
		icon: "ph:grid-nine",
		iconBg: "oklch(92% 0.01 95)",
		variant: "wordle",
	},
	{
		id: "magic-garden",
		title: "Magic Garden",
		description: "Garden with friends! Grow magical plants together.",
		icon: "ph:flower-lotus-fill",
		iconBg: "oklch(63% 0.2 345)",
		variant: "garden",
	},
	{
		id: "farm-merge-valley",
		title: "Farm Merge Valley",
		description: "Farm, merge, grow and expand your land.",
		icon: "ph:plant-fill",
		iconBg: "oklch(72% 0.16 145)",
		variant: "farm",
	},
	{
		id: "watch-together",
		title: "Watch Together",
		description: "Create and watch shared playlists with friends.",
		icon: "ph:youtube-logo-fill",
		iconBg: "oklch(94% 0.006 270)",
		variant: "watch",
	},
];

/** Full Recents destination shown by the first View More control. */
export const discordAppLauncherRecentsList: readonly DiscordAppLauncherEntry[] = [
	{
		id: "farm-merge-valley",
		name: "Farm Merge Valley",
		description: "Farm, merge, grow and expand your land! Welcome to the world of farming.",
		icon: "ph:plant-fill",
		iconBg: "oklch(70% 0.16 145)",
	},
	{
		id: "labscore",
		name: "labsCore",
		description: "As of January 1, 2026, labsCore is no longer available.",
		icon: "ph:flask-fill",
		iconBg: "oklch(32% 0.01 270)",
	},
	{
		id: "poker",
		name: "Poker Night",
		description: "A Texas hold 'em style card game where you can prove your poker skills.",
		icon: "ph:spade-fill",
		iconBg: "oklch(52% 0.16 305)",
	},
	{
		id: "putt",
		name: "Putt Party",
		description: "Perfect your putts in this pumped-up version of a mini golf game.",
		icon: "ph:golf-fill",
		iconBg: "oklch(58% 0.16 145)",
	},
	{
		id: "rythm",
		name: "Rythm",
		description: "Listen to music together with your friends anywhere on Discord.",
		icon: "ph:waveform-fill",
		iconBg: "oklch(35% 0.08 255)",
		promoted: true,
	},
	{
		id: "skyra-beta",
		name: "Skyra Beta",
		description: "Beta - She/Her - Moderation management · Dashboard available.",
		icon: "ph:shield-star-fill",
		iconBg: "oklch(61% 0.16 235)",
	},
	{
		id: "whiteboard",
		name: "Whiteboard",
		description: "Draw, upload images, write, and use GIFs to create virtually anything.",
		icon: "ph:hand-pointing-fill",
		iconBg: "oklch(93% 0.01 270)",
	},
	{
		id: "bobble",
		name: "Bobble League",
		description: "In this arcade-style soccer game use Power Plays and formations.",
		icon: "ph:soccer-ball-fill",
		iconBg: "oklch(70% 0.09 80)",
	},
	{
		id: "watch-together",
		name: "Watch Together",
		description: "Create and watch shared playlists of YouTube videos with your friends.",
		icon: "ph:youtube-logo-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "activities",
		name: "Activities",
		description: "Bot for starting voice channel activities, made by advaith.",
		icon: "ph:rocket-launch-fill",
		iconBg: "oklch(32% 0.01 270)",
	},
	{
		id: "assyst",
		name: "Assyst",
		description: "Image editing and meme bot with additional fun features.",
		icon: "ph:image-square-fill",
		iconBg: "oklch(38% 0.08 65)",
	},
	{
		id: "astro",
		name: "Astro",
		description: "The most unique and complete Discord bot for temporary voice channels.",
		icon: "ph:planet-fill",
		iconBg: "oklch(38% 0.14 300)",
	},
	{
		id: "dsc-bot",
		name: "dsc.bot",
		description: "Your place to discover Discord bots.",
		icon: "ph:discord-logo-fill",
		iconBg: "oklch(18% 0.005 270)",
	},
	{
		id: "emoji-stealer",
		name: "Emoji Stealer",
		description: "Steal emojis, stickers, and reactions from other servers.",
		icon: "ph:cat-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "green-bot",
		name: "Green-bot",
		description: "A simple and user friendly Discord music bot.",
		icon: "ph:music-notes-fill",
		iconBg: "oklch(60% 0.18 140)",
	},
	{
		id: "tictactoe",
		name: "TicTacToe",
		description: "TicTacToe Bot recreates the popular game on Discord.",
		icon: "ph:grid-four-fill",
		iconBg: "oklch(82% 0.16 170)",
	},
	{
		id: "wordle",
		name: "Wordle",
		description: "Play Wordle from New York Times Games. You have 6 chances to guess.",
		icon: "ph:grid-nine",
		iconBg: "oklch(92% 0.01 95)",
	},
];

/** Secondary list opened via Chill Together → View More. */
export const discordAppLauncherChillTogether: readonly DiscordAppLauncherEntry[] = [
	{
		id: "watch-together",
		name: "Watch Together",
		description: "Create and watch shared playlists of YouTube videos with your friends.",
		icon: "ph:youtube-logo-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "lofi",
		name: "Lofi",
		description: "Vibe with your friends with lofi music and a curated ambience.",
		icon: "ph:headphones-fill",
		iconBg: "oklch(42% 0.14 295)",
	},
	{
		id: "whiteboard",
		name: "Whiteboard",
		description: "Draw, upload images, write, and use GIFs to create virtually anything.",
		icon: "ph:hand-pointing-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "karaoke-party-battle",
		name: "Karaoke Party Battle",
		description: "Karaoke Party Battle is the first karaoke Discord music game.",
		icon: "ph:microphone-stage-fill",
		iconBg: "oklch(56% 0.2 330)",
	},
	{
		id: "rythm",
		name: "Rythm",
		description: "Create and listen to shared playlists of music.",
		icon: "ph:music-notes-fill",
		iconBg: "oklch(55% 0.2 300)",
		promoted: true,
	},
	{
		id: "sketch",
		name: "Sketch Heads",
		description: "Draw and guess with friends.",
		icon: "ph:pencil-simple-fill",
		iconBg: "oklch(65% 0.16 55)",
	},
	{
		id: "checkers",
		name: "Checkers In The Park",
		description: "Play checkers against bots or friends.",
		icon: "ph:checkerboard-fill",
		iconBg: "oklch(55% 0.14 250)",
	},
	{
		id: "land-io",
		name: "Land-io",
		description: "Claim as much land as you can!",
		icon: "ph:map-trifold-fill",
		iconBg: "oklch(60% 0.14 145)",
	},
	{
		id: "putt",
		name: "Putt Party",
		description: "Compete in a mini-golf tournament!",
		icon: "ph:golf-fill",
		iconBg: "oklch(58% 0.16 145)",
	},
	{
		id: "gartic",
		name: "Gartic Phone",
		description: "Draw and write with friends.",
		icon: "ph:phone-fill",
		iconBg: "oklch(62% 0.18 55)",
	},
	{
		id: "know-what",
		name: "Know What I Meme",
		description: "Guess the meme with friends.",
		icon: "ph:smiley-sticker-fill",
		iconBg: "oklch(70% 0.16 85)",
	},
	{
		id: "bobble",
		name: "Bobble League",
		description: "Compete in a fun bobble soccer game.",
		icon: "ph:soccer-ball-fill",
		iconBg: "oklch(55% 0.14 250)",
	},
	{
		id: "ask-away",
		name: "Ask Away",
		description: "Get to know your friends better.",
		icon: "ph:chat-teardrop-dots-fill",
		iconBg: "oklch(58% 0.18 300)",
	},
	{
		id: "color-together",
		name: "Color Together",
		description: "Draw and color with friends.",
		icon: "ph:palette-fill",
		iconBg: "oklch(65% 0.18 25)",
	},
	{
		id: "nitro-control",
		name: "Nitro Control",
		description: "Control Nitro animations together.",
		icon: "ph:lightning-fill",
		iconBg: "oklch(55% 0.2 300)",
		promoted: true,
	},
	{
		id: "valorant",
		name: "VALORANT - Sage's Quarters",
		description: "Discover VALORANT'S new map, through the eyes of Sage.",
		icon: "ph:crosshair-fill",
		iconBg: "oklch(45% 0.18 25)",
		promoted: true,
	},
	{
		id: "masters-of-the-universe",
		name: "Masters of the Universe",
		description: "Eternia is calling you home.",
		icon: "ph:sword-fill",
		iconBg: "oklch(28% 0.04 260)",
		promoted: true,
	},
];

export const discordAppLauncherPuzzleGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "daily-sudoku",
		name: "Daily Sudoku Together",
		description: "Dive into Daily Sudoku Together on Discord—your ultimate Sudoku break.",
		icon: "ph:number-square-one-fill",
		iconBg: "oklch(92% 0.01 270)",
	},
	{
		id: "daily-word-wheel",
		name: "Daily Word Wheel",
		description: "From the makers of Words with Friends, enjoy a daily word puzzle.",
		icon: "ph:circles-four-fill",
		iconBg: "oklch(83% 0.15 115)",
	},
	{
		id: "blockbuster",
		name: "BlockBuster",
		description: "Welcome to BlockBuster: Adventures Puzzle! Immerse yourself in puzzles.",
		icon: "ph:squares-four-fill",
		iconBg: "oklch(46% 0.16 255)",
	},
	{
		id: "hex-puzzle",
		name: "Hex Puzzle Adventure",
		description: "A hex stacking puzzle game. Use strategic thinking to solve the board.",
		icon: "ph:hexagon-fill",
		iconBg: "oklch(62% 0.2 40)",
	},
	{
		id: "letter-league",
		name: "Letter League",
		description: "Use letter tiles from your rack to compete with friends.",
		icon: "ph:squares-four-fill",
		iconBg: "oklch(75% 0.15 305)",
	},
];

export const discordAppLauncherCardGames: readonly DiscordAppLauncherEntry[] = [
	discordAppLauncherRecentsList[2]!,
	{
		id: "blazing-eights",
		name: "Blazing 8s",
		description: "Be the first to zero cards by swapping hands and skipping players.",
		icon: "ph:number-eight-fill",
		iconBg: "oklch(72% 0.16 155)",
	},
	{
		id: "blackjack",
		name: "Blackjack",
		description: "The first visual Blackjack game on Discord.",
		icon: "ph:cards-three-fill",
		iconBg: "oklch(35% 0.05 250)",
	},
	{
		id: "erth-poker",
		name: "ERTH Poker",
		description: "The ultimate party poker game on Discord.",
		icon: "ph:spade-fill",
		iconBg: "oklch(48% 0.18 330)",
	},
];

export const discordAppLauncherStrategyGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "roll20",
		name: "Roll20",
		description: "Bring your story to life on the powerful, easy-to-use virtual tabletop.",
		icon: "ph:dice-five-fill",
		iconBg: "oklch(54% 0.2 335)",
	},
	{
		id: "chess-in-the-park",
		name: "Chess In The Park",
		description: "Unleash your inner Grandmaster by playing multiple games of Chess.",
		icon: "ph:horse-fill",
		iconBg: "oklch(76% 0.16 135)",
	},
	{
		id: "battle-tabs",
		name: "BattleTabs",
		description: "Viking Ship Battles! BattleTabs is a turn-based PVP strategy game.",
		icon: "ph:sword-fill",
		iconBg: "oklch(68% 0.17 170)",
	},
	{
		id: "stratego-online",
		name: "Stratego Online",
		description: "The beloved strategy game, known for its tactical depth.",
		icon: "ph:shield-chevron-fill",
		iconBg: "oklch(52% 0.19 25)",
	},
];

export const discordAppLauncherSocialActivities: readonly DiscordAppLauncherEntry[] = [
	{
		id: "codenames",
		name: "Codenames Online",
		description: "A hit party game for 4+ players, designed by Vlaada Chvátil.",
		icon: "ph:detective-fill",
		iconBg: "oklch(53% 0.12 200)",
	},
	{
		id: "goober-dash",
		name: "Goober Dash",
		description: "A 2D battle royale where Goobers run, jump and dash to victory.",
		icon: "ph:person-simple-run-fill",
		iconBg: "oklch(67% 0.2 345)",
	},
	{
		id: "colonist",
		name: "Colonist",
		description: "A Settlers of Catan alternative with strategy game features.",
		icon: "ph:hexagon-fill",
		iconBg: "oklch(69% 0.16 190)",
	},
	{
		id: "know-what-social",
		name: "Know What I Meme",
		description: "The feeling when memes and inside jokes become a game.",
		icon: "ph:smiley-sticker-fill",
		iconBg: "oklch(32% 0.04 250)",
	},
];

export const discordAppLauncherActionGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "poxel",
		name: "Poxel.io",
		description: "The ultimate FPS action game. Play Poxel.io online with friends.",
		icon: "ph:crosshair-simple-fill",
		iconBg: "oklch(69% 0.17 190)",
	},
	{
		id: "smash-karts",
		name: "Smash Karts",
		description: "Smash Karts is a MOKBA (Multiplayer Online Kart Battle Arena).",
		icon: "ph:car-profile-fill",
		iconBg: "oklch(70% 0.16 305)",
	},
	{
		id: "krunker",
		name: "Krunker Strike FRVR",
		description: "Enter the Krunker Strike FRVR universe and compete.",
		icon: "ph:target-fill",
		iconBg: "oklch(61% 0.16 190)",
	},
	{
		id: "kour",
		name: "Kour.io",
		description: "A multiplayer IO FPS game that plunges you into intense action.",
		icon: "ph:person-simple-run-fill",
		iconBg: "oklch(72% 0.16 105)",
	},
];

export const discordAppLauncherBotGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "owo",
		name: "OwO",
		description: "OwO What's this? Type 'owo help' for a list of commands!",
		icon: "ph:cat-fill",
		iconBg: "oklch(73% 0.15 210)",
	},
	{
		id: "dank-memer",
		name: "Dank Memer",
		description: "Grind, fight, wager, gamble, fish, collect, and more.",
		icon: "ph:smiley-melting-fill",
		iconBg: "oklch(45% 0.14 145)",
	},
	{
		id: "epic-rpg",
		name: "EPIC RPG",
		description: "An RPG bot! Start playing with rpg start or /start.",
		icon: "ph:sword-fill",
		iconBg: "oklch(76% 0.14 200)",
	},
	{
		id: "virtual-fisher",
		name: "VirtualFisher",
		description: "A game you can play in your server focused on fishing.",
		icon: "ph:fish-simple-fill",
		iconBg: "oklch(92% 0.01 270)",
	},
];

/** Main-scroll category previews, in the same order as Discord's launcher. */
export const discordAppLauncherCategories: readonly DiscordAppLauncherListView[] = [
	{ id: "puzzle-games", title: "Puzzle Games", entries: discordAppLauncherPuzzleGames },
	{ id: "card-games", title: "Card Games", entries: discordAppLauncherCardGames },
	{
		id: "strategy-games",
		title: "Strategy and Board Games",
		entries: discordAppLauncherStrategyGames,
	},
	{
		id: "chill-together",
		title: "Chill Together",
		entries: discordAppLauncherChillTogether,
	},
	{
		id: "social-activities",
		title: "Social Activities",
		entries: discordAppLauncherSocialActivities,
	},
	{ id: "action-games", title: "Action Games", entries: discordAppLauncherActionGames },
	{ id: "bot-games", title: "Bot Games", entries: discordAppLauncherBotGames },
];

export const discordAppLauncherListViews: readonly DiscordAppLauncherListView[] = [
	{
		id: "recents",
		title: "Recents",
		entries: discordAppLauncherRecentsList,
	},
	{
		id: "server-apps",
		title: "Apps in this Server",
		entries: discordAppLauncherServerApps,
	},
	{
		id: "chill-together",
		title: "Chill Together",
		entries: discordAppLauncherChillTogether,
	},
	...discordAppLauncherCategories.filter((view) => view.id !== "chill-together"),
];
