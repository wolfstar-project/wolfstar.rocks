import consola from "consola";

export default defineNuxtPlugin(async () => {
  const apiOrigin = getApiOrigin();

  const api = $fetch.create({
    baseURL: apiOrigin,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": crypto.randomUUID?.(),
    },
    onResponse({ response }) {
      consola.log("Response:", response);
    },
  });

  return {
    provide: {
      api,
    },
  };
});
