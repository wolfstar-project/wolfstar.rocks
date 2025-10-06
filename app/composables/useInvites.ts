import { computed } from "vue";

export function useInvites() {
  const config = useRuntimeConfig();

  const wolfstarInvite = computed(() => {
    return `https://discord.com/oauth2/authorize?client_id=${config.public.discordClientId}&permissions=534185897078&scope=bot%20applications.commands`;
  });

  const starylInvite = computed(() => {
    return `https://discord.com/oauth2/authorize?client_id=&scope=bot%20applications.commands`;
  });

  return {
    wolfstarInvite,
    starylInvite,
  };
}
