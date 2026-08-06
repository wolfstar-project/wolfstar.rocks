export default defineNuxtRouteMiddleware((to) => {
	if (!document.startViewTransition) return;
	to.meta.pageTransition = false;
	to.meta.layoutTransition = false;
});
