import { defineClientAuth } from "@onmax/nuxt-better-auth/config";

export default defineClientAuth(() => ({ baseURL: window.location.origin }));
