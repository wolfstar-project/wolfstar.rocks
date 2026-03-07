import type { ModuleOptions } from "@vite-pwa/nuxt";
import { isCI, isDevelopment } from "std-env";

export const pwa: ModuleOptions = {
	client: {
		installPrompt: true,
		periodicSyncForUpdates: 3600,
	},
	devOptions: {
		enabled: process.env.VITE_DEV_PWA === "true",
		type: "module",
	},
	disable: isDevelopment && process.env.VITE_DEV_PWA !== "true",
	filename: "sw.ts",
	injectManifest: {
		globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
	},
	injectRegister: "auto",
	manifest: {
		background_color: "#050505",
		categories: ["discord", "bot", "wolfstar", "moderation", "automation", "cyborg", "logging"],
		dir: "ltr",
		display: "minimal-ui",
		icons: [
			{
				purpose: "any",
				sizes: "144x144",
				src: "/android-chrome-144x144.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "192x192",
				src: "/android-chrome-192x192.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "256x256",
				src: "/android-chrome-256x256.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "384x384",
				src: "/android-chrome-384x384.png",
				type: "image/png",
			},
			{
				purpose: "any",
				sizes: "512x512",
				src: "/android-chrome-512x512.png",
				type: "image/png",
			},
			{
				purpose: "maskable",
				sizes: "512x512",
				src: "/maskable_icon.png",
				type: "image/png",
			},
		],
		lang: "en_US",
		name: "WolfStar",
		orientation: "portrait-primary",
		scope: "/",
		/*	screenshots: [
			{
				form_factor: "wide",
				label: "WolfStar Dashboard",
				sizes: "1200x630",
				src: "/opengraph.png",
				type: "image/png",
			},
			{
				form_factor: "narrow",
				label: "WolfStar Mobile",
				sizes: "1170x2532",
				src: "/apple-splash-portrait-1170x2532.png",
				type: "image/png",
			},
		],*/
		short_name: "WolfStar",
		shortcuts: [
			{
				description: "Go to WolfStar's dashboard",
				icons: [
					{
						sizes: "96x96",
						src: "/android-chrome-96x96.png",
						type: "image/png",
					},
				],
				name: "WolfStar",
				short_name: "Homepage",
				url: "/",
			},
			{
				description: "View WolfStar's commands",
				icons: [
					{
						sizes: "96x96",
						src: "/android-chrome-96x96.png",
						type: "image/png",
					},
				],
				name: "WolfStar Commands",
				short_name: "Commands",
				url: "/commands",
			},
			{
				description: "Read WolfStar's Terms of Service",
				icons: [
					{
						sizes: "96x96",
						src: "/android-chrome-96x96.png",
						type: "image/png",
					},
				],
				name: "WolfStar Terms of Service",
				short_name: "Terms of Service",
				url: "/terms",
			},
			{
				description: "Read WolfStar's Privacy Policy",
				icons: [
					{
						sizes: "96x96",
						src: "/android-chrome-96x96.png",
						type: "image/png",
					},
				],
				name: "WolfStar Privacy Policy",
				short_name: "Privacy Policy",
				url: "/privacy",
			},
		],
		start_url: "/",
		theme_color: "#fd171b",
	},
	mode: isCI ? "production" : "development",
	pwaAssets: {
		config: false,
	},
	registerType: "prompt",
	scope: "/",
	srcDir: "../service-worker",
	strategies: "injectManifest",
};
