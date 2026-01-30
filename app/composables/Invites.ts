export const useInvites = () => {
  const invites = {
    WolfStar: `https://discord.com/oauth2/authorize?client_id=${getClientId()}&permissions=534185897078&scope=bot%20applications.commands`,
    Staryl: "#",
  } as const satisfies Record<string, string>;

  return invites;
};
