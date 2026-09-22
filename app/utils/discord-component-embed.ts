import {
	ActionRow,
	Container,
	h,
	LinkButton,
	Section,
	Separator,
	TextDisplay,
	Thumbnail,
	type EmbedElement,
} from "discord-component-embed";

/** `--branding-wolfstar` (`oklch(63% 0.2502 28.13)`) clamped to sRGB, as the RGB integer Discord expects. */
const WOLFSTAR_ACCENT_COLOR = 0xfd171b;

/** `--branding-staryl` (`oklch(0.5873 0.0204 272.13)`) as the RGB integer Discord expects. */
export const STARYL_ACCENT_COLOR = 0x787c89;

export interface DiscordLinkCardOptions {
	title: string;
	description: string;
	/** Absolute URL of the thumbnail shown next to the text. */
	thumbnailUrl: string;
	thumbnailDescription: string;
	buttons: readonly { label: string; url: string }[];
	accentColor?: number;
}

/**
 * Builds the Components v2 card Discord renders instead of the Open Graph
 * preview when a page link is pasted into a message.
 */
export function buildDiscordLinkCard({
	accentColor = WOLFSTAR_ACCENT_COLOR,
	buttons,
	description,
	thumbnailDescription,
	thumbnailUrl,
	title,
}: DiscordLinkCardOptions): EmbedElement {
	return h(
		Container,
		{ accentColor },
		h(
			Section,
			{
				accessory: h(Thumbnail, { description: thumbnailDescription, url: thumbnailUrl }),
			},
			h(TextDisplay, null, `# ${title}`),
			h(TextDisplay, null, description),
		),
		h(Separator, { spacing: "small" }),
		h(
			ActionRow,
			null,
			buttons.map(({ label, url }) => h(LinkButton, { label, url })),
		),
	);
}
