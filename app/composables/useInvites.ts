export const useInvites = () => {
	const invites = {
		Staryl: "#",
		WolfStar: `https://discord.com/oauth2/authorize?client_id=${getClientId()}&permissions=534185897078&redirect_uri=${encodeURIComponent(guildRedirectURI())}&response_type=code&scope=bot%20applications.commands`,
	} as const satisfies Record<string, string>;

	return invites;
};
