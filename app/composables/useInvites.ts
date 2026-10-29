/** Staryl's Discord application, which is its bot user too. */
const STARYL_CLIENT_ID = "1489991104672567386";

export const useInvites = () => {
	const invites = {
		// Staryl asks only for what it posts notifications with: View Channel, Send
		// Messages and Embed Links (staryl, `src/lib/utilities/discordUtilities.ts`).
		Staryl: `https://discord.com/oauth2/authorize?client_id=${STARYL_CLIENT_ID}&permissions=19456&scope=bot%20applications.commands`,
		WolfStar: `https://discord.com/oauth2/authorize?client_id=${getClientId()}&permissions=534185897078&redirect_uri=${encodeURIComponent(guildRedirectURI())}&response_type=code&scope=bot%20applications.commands`,
	} as const satisfies Record<string, string>;

	return invites;
};
