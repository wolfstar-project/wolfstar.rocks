export const useApp = () => {
  const Invites = useInvites();
  const OtherApps = {
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

  return OtherApps;
};
