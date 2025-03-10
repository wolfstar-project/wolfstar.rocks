import { useNitroOrigin } from '#imports';

export const useClientTrpc = () => useNuxtApp().$client;

export const getConfiguredOrigin = () => useNitroOrigin();

export const getClientId = () => useRuntimeConfig().public.clientId;

export const getOrigin = () => useRequestURL().origin;

export const getApiOrigin = () => useRuntimeConfig().public.apiBase;
