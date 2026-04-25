import type { AuditActor, EnrichContext } from "evlog";

export async function resolveActor(ctx: EnrichContext): Promise<AuditActor | null> {
	const context = ctx.event?.context as { user?: { id?: string; username?: string } } | undefined;
	const user = context?.user;
	if (user?.id) {
		return { type: "user", id: user.id, displayName: user.username };
	}
	return null;
}
