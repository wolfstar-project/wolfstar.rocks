export function useHeader() {
  // Safely inject appName with fallback to prevent SSR issues
  const appName = inject(ProviderAppNameKey, ref<"wolfstar" | "staryl">("wolfstar"));

  const Apps = {
    wolfstar: { name: "WolfStar", invite: Invites.WolfStar, landing: "/" },
    staryl: { name: "Staryl", invite: Invites.Staryl, landing: "/staryl" },
  };

  const currentApp = computed(() => {
    const appKey = unref(appName);
    return Apps[appKey] || Apps.wolfstar;
  });

  const desktopLinks = computed(() => [{
    label: "Features",
    children: [
      {
        label: "Moderation Tools",
      },
      {
        label: "Advanced Logging",
      },
    ],
  }, {
    label: "Applications",
    children: [
      {
        label: "WolfStar",
        to: "/",
        icon: "ph:shield-duotone",
      },
      {
        label: "Staryl",
        to: "/staryl",
        icon: "i-lucide-twitch",
      },
    ],
  }, {
    label: "Invite App",
    to: currentApp.value.invite,
    icon: "ph:plus-circle-duotone",
  }]);

  const mobileLinks = computed(() => [{
    label: "Features",
    children: [
      {
        label: "Moderation Tools",
      },
      {
        label: "Advanced Logging",
      },
    ],
  }, {
    label: "Application",
    children: [{
      label: "WolfStar",
      icon: "ph:shield-duotone",
      to: "/",
    }, {
      label: "Staryl",
      icon: "ph:books-duotone",
      to: "/staryl",
      target: "_blank",
    }],
  }, {
    label: "GitHub",
    to: "https://github.com/wolfstar-project/wolfstar.rocks",
    icon: "i-simple-icons-github",
    target: "_blank",
  }]);

  return {
    desktopLinks,
    mobileLinks,
    currentApp,
  };
}
