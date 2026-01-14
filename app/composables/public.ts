import { getNitroOrigin } from "#imports";

export const getConfiguredOrigin = () => getNitroOrigin();

export const getClientId = () => useRuntimeConfig().public.clientId;

export const getOrigin = () => useRequestURL().origin;

export const getApiOrigin = () => useRuntimeConfig().public.app.apiBaseUrl;
