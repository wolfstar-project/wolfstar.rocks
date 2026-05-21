export interface SessionUser {
	id: string;
	name: string;
	globalName: string | null;
	username: string;
	avatar: string | null;
}

export const FIXTURE_DISCORD_USER: SessionUser = {
	id: "123456789012345678",
	name: "Test User",
	globalName: "Test User",
	username: "testuser",
	avatar: null,
};
