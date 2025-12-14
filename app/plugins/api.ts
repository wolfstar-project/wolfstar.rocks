export default defineNuxtPlugin(async () => {
  const apiOrigin = getApiOrigin();

  const api = $fetch.create({
    baseURL: apiOrigin,
    credentials: "include",
  });

  return {
    provide: {
      api,
    },
  };
});
