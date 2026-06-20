import prisma from "#server/database/prisma";

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("close", async () => {
		await prisma.$disconnect();
	});
});
