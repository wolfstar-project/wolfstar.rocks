export default defineNuxtPlugin(async () => {
  const apiOrigin = getApiOrigin();

  const api = $fetch.create({
    baseURL: apiOrigin,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": crypto.randomUUID?.(),
    },
  });

  return {
    provide: {
      api,
    },
  };
});
