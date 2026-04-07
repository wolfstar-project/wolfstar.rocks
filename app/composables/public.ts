import { getNitroOrigin } from "#imports";

export const getConfiguredOrigin = () => getNitroOrigin();

export const getClientId = () => useRuntimeConfig().public.clientId;

export const getApiBaseUrl = () => useRuntimeConfig().public.apiBaseUrl;

export const getOrigin = () => useRequestURL().origin;
