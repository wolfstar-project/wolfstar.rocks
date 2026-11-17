import type { SocialState, SocialSubscription } from "#shared/utils/social";
import type { ComponentInternalInstance } from "vue";
import type { SocialModuleStatus } from "~/composables/useSocialModule";
import type { SocialDraft } from "~/utils/social";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { ChannelType } from "discord-api-types/v10";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SocialSection from "~/components/guild/settings/Social.vue";
import Editor from "~/components/guild/social/Editor.vue";
import { createMockChannel, createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const GENERAL = "234567890123456789";
const NEWS = "345678901234567890";

const mockStatus = ref<SocialModuleStatus>({ kind: "loading" });
const mockSetEnabled = vi.fn();
const mockAddSubscription = vi.fn();
const mockRemoveSubscription = vi.fn();
const mockAddTwitch = vi.fn();
const mockRemoveTwitch = vi.fn();
const mockRefresh = vi.fn();
const mockToastAdd = vi.fn();

mockNuxtImport("useSocialModule", () => () => ({
	addSubscription: mockAddSubscription,
	addTwitch: mockAddTwitch,
	refresh: mockRefresh,
	removeSubscription: mockRemoveSubscription,
	removeTwitch: mockRemoveTwitch,
	setEnabled: mockSetEnabled,
	state: computed(() => (mockStatus.value.kind === "ready" ? mockStatus.value.state : null)),
	status: mockStatus,
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			channels: [
				createMockChannel({ id: GENERAL, name: "general", type: ChannelType.GuildText }),
				createMockChannel({ id: NEWS, name: "news", type: ChannelType.GuildText }),
			],
			id: GUILD_ID,
		}),
	),
}));

mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

const mockSuggestions = ref<{ name: string; value: string }[]>([]);
mockNuxtImport("useSocialTargetSearch", () => () => ({ suggestions: mockSuggestions }));

function subscription(overrides: Partial<SocialSubscription> = {}): SocialSubscription {
	return {
		channelId: GENERAL,
		createdAt: "2026-11-01T10:00:00.000Z",
		deliveryError: null,
		displayName: "Example feed",
		filters: [],
		health: "active",
		lastCheckedAt: null,
		manageable: true,
		message: null,
		provider: "Rss",
		sourceId: "5",
		target: "https://example.com/feed.xml",
		...overrides,
	};
}

function ready(overrides: Partial<SocialState> = {}) {
	mockStatus.value = {
		kind: "ready",
		state: {
			enabled: true,
			installed: true,
			limits: { messageLength: 200, subscriptions: 25, targetLength: 500, xAccounts: 2 },
			providers: [
				{ configured: true, manageable: true, name: "Rss" },
				{ configured: true, manageable: true, name: "Bluesky" },
				{ configured: false, manageable: true, name: "YouTube" },
				{ configured: true, manageable: false, name: "Instagram" },
			],
			subscriptions: [],
			twitch: [],
			twitchLiveConfigured: true,
			...overrides,
		},
	};
}

const mounted: { unmount(): void }[] = [];
async function mountSection() {
	const wrapper = await mountSuspended(SocialSection, { attachTo: document.body });
	mounted.push(wrapper);
	await flushPromises();
	return wrapper;
}

function dialog() {
	return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function buttonIn(root: ParentNode | null, text: string) {
	return [...(root?.querySelectorAll("button") ?? [])].find(
		(button) => button.textContent?.trim() === text,
	);
}

// The dialog is mounted in a portal: its draft is reached through its own
// component, as the pickers of the dashboard would fill it.
function editorDraft(wrapper: Awaited<ReturnType<typeof mountSection>>) {
	const editor = wrapper.findComponent(Editor);
	return (
		editor.vm.$ as ComponentInternalInstance & {
			setupState: {
				draft: SocialDraft;
				sourceItems: { value: string; disabled: boolean; label: string }[];
			};
		}
	).setupState;
}

async function openEditor(wrapper: Awaited<ReturnType<typeof mountSection>>) {
	buttonIn(wrapper.element.parentElement, "Add subscription")?.click();
	await flushPromises();
	return editorDraft(wrapper);
}

describe("the Social section", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearNuxtState();
		mockSuggestions.value = [];
		useActiveGuild().selectGuild(GUILD_ID);
		mockStatus.value = { kind: "loading" };
		mockSetEnabled.mockImplementation(async (enabled: boolean) => ({
			ok: true,
			value: enabled,
		}));
		mockAddSubscription.mockResolvedValue({ ok: true, value: [] });
		mockRemoveSubscription.mockResolvedValue({ ok: true, value: undefined });
		mockAddTwitch.mockResolvedValue({ ok: true, value: undefined });
		mockRemoveTwitch.mockResolvedValue({ ok: true, value: undefined });
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	describe("when there is nothing to configure", () => {
		it("says the dashboard could not reach Staryl, and tries again on request", async () => {
			mockStatus.value = { kind: "unavailable" };
			const wrapper = await mountSection();

			expect(wrapper.text()).toContain("Social is not available right now");
			expect(wrapper.text()).not.toContain("Add subscription");

			buttonIn(wrapper.element.parentElement, "Try again")?.click();

			expect(mockRefresh).toHaveBeenCalledOnce();
		});

		it("offers Staryl's invite to a server Staryl is not in", async () => {
			mockStatus.value = { kind: "not-installed" };
			const wrapper = await mountSection();

			expect(wrapper.text()).toContain("Staryl is not in this server");
			const invite = wrapper.get("a");
			expect(invite.text()).toBe("Invite Staryl");
			expect(invite.attributes("href")).toBe(useInvites().Staryl);
			expect(wrapper.find('[role="switch"]').exists()).toBe(false);
		});
	});

	describe("the list", () => {
		it("says there is no subscription yet", async () => {
			ready();
			const wrapper = await mountSection();

			expect(wrapper.text()).toContain("No subscription yet");
		});

		// Staryl has a limit per source and no total, so the header counts without a maximum.
		it("counts the subscriptions and the Twitch live ones together, without a total", async () => {
			ready({
				subscriptions: [subscription(), subscription({ sourceId: "6" })],
				twitch: [
					{
						channelId: NEWS,
						message: null,
						revoked: false,
						streamerId: "1",
						streamerName: "CoolStreamer",
						type: "StreamOnline",
					},
				],
			});
			const wrapper = await mountSection();

			expect(wrapper.text()).toContain("3 subscriptions");
			expect(wrapper.text()).not.toMatch(/\d+ \/ \d+ subscriptions/u);
		});

		it("lists each subscription with its source, its channel, its message and how it is doing", async () => {
			ready({
				subscriptions: [
					subscription({ health: "rateLimited", message: "New post from the team" }),
				],
			});
			const wrapper = await mountSection();

			const row = wrapper.get("tbody tr");
			expect(row.text()).toContain("Example feed");
			expect(row.text()).toContain("New post from the team");
			expect(row.text()).toContain("RSS or Atom feed");
			expect(row.text()).toContain("#general");
			expect(row.text()).toContain("Rate limited, Staryl retries");
		});

		it("says why nothing is posted before it says how the source is doing", async () => {
			ready({
				subscriptions: [
					subscription({ deliveryError: "MissingPermissions", health: "active" }),
				],
			});
			const wrapper = await mountSection();

			const row = wrapper.get("tbody tr");
			expect(row.text()).toContain("Staryl cannot post in the channel");
			expect(row.text()).not.toContain("Working");
		});

		it("offers no remove for an account its owner connected in Discord", async () => {
			ready({
				subscriptions: [
					subscription({
						displayName: "wolfstar",
						manageable: false,
						provider: "Instagram",
					}),
				],
			});
			const wrapper = await mountSection();

			const row = wrapper.get("tbody tr");
			expect(row.text()).toContain("Managed in Discord");
			expect(row.find("button").exists()).toBe(false);
		});

		it("lists the Twitch live subscriptions, revoked ones included", async () => {
			ready({
				twitch: [
					{
						channelId: NEWS,
						message: "Live now",
						revoked: true,
						streamerId: "123",
						streamerName: "CoolStreamer",
						type: "StreamOnline",
					},
				],
			});
			const wrapper = await mountSection();

			expect(wrapper.text()).not.toContain("No subscription yet");
			const row = wrapper.get("tbody tr");
			expect(row.text()).toContain("CoolStreamer");
			expect(row.text()).toContain("The stream starts");
			expect(row.text()).toContain("#news");
			expect(row.text()).toContain("Ended by Twitch");
			// A Staryl from before the Twitch live routes gives no id, so the row cannot be removed.
			expect(row.find("button").exists()).toBe(false);
		});
	});

	describe("the switch", () => {
		it("turns the module off at once, and says the subscriptions stay", async () => {
			ready({ subscriptions: [subscription()] });
			const wrapper = await mountSection();
			const toggle = wrapper.get('[aria-label="Toggle Social"]');
			expect(toggle.attributes("aria-checked")).toBe("true");

			await toggle.trigger("click");
			await flushPromises();

			expect(mockSetEnabled).toHaveBeenCalledWith(false);
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "Staryl posts nothing in this server. Its subscriptions stay.",
					title: "Social turned off",
				}),
			);
		});

		it("says why a flip did not go through", async () => {
			ready();
			mockSetEnabled.mockResolvedValue({ code: "unavailable", ok: false });
			const wrapper = await mountSection();

			await wrapper.get('[aria-label="Toggle Social"]').trigger("click");
			await flushPromises();

			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "error",
					description:
						"The dashboard could not reach Staryl. Try again in a few minutes.",
				}),
			);
		});
	});

	describe("adding a subscription", () => {
		it("lists Twitch live and every source but the connected accounts", async () => {
			ready();
			const wrapper = await mountSection();

			const { sourceItems } = await openEditor(wrapper);

			expect(sourceItems.map((item) => item.value)).toStrictEqual([
				"TwitchLive",
				"Rss",
				"Bluesky",
				"YouTube",
			]);
		});

		it("greys out a source Staryl has no credentials for, and says why", async () => {
			ready();
			const wrapper = await mountSection();

			const { sourceItems } = await openEditor(wrapper);

			expect(sourceItems.find((item) => item.value === "YouTube")).toMatchObject({
				disabled: true,
				label: "YouTube (not on Staryl yet)",
			});
			expect(sourceItems.find((item) => item.value === "Rss")?.disabled).toBe(false);
			expect(dialog()?.textContent).toContain(
				"A greyed source needs credentials Staryl does not have yet.",
			);
		});

		it("follows a streamer live, and asks for a message for the end of a stream", async () => {
			ready();
			const wrapper = await mountSection();
			const { draft } = await openEditor(wrapper);
			Object.assign(draft, {
				channelId: NEWS,
				event: "StreamOffline",
				source: "TwitchLive",
				target: "shroud",
			});
			await flushPromises();

			expect(dialog()?.textContent).toContain("Streamer");
			expect(dialog()?.textContent).toContain("Required when the stream ends");
			expect(buttonIn(dialog(), "Add subscription")?.disabled).toBe(true);

			draft.message = "Thanks for watching";
			await flushPromises();
			buttonIn(dialog(), "Add subscription")?.click();
			await flushPromises();

			expect(mockAddTwitch).toHaveBeenCalledWith({
				channelId: NEWS,
				message: "Thanks for watching",
				streamer: "shroud",
				type: "StreamOffline",
			});
			expect(mockAddSubscription).not.toHaveBeenCalled();
		});

		it("lists what the search suggests under the target, which stays free text", async () => {
			ready();
			mockSuggestions.value = [{ name: "Bluesky (@bsky.app)", value: "bsky.app" }];
			const wrapper = await mountSection();
			await openEditor(wrapper);

			const input = dialog()?.querySelector<HTMLInputElement>("input[list]");
			const list = input && document.getElementById(input.getAttribute("list") ?? "");
			const option = list?.querySelector("option");
			expect(option?.getAttribute("value")).toBe("bsky.app");
			expect(option?.getAttribute("label")).toBe("Bluesky (@bsky.app)");
		});

		it("names no number when Staryl refuses a source whose maximum it did not send", async () => {
			ready();
			mockAddTwitch.mockResolvedValue({ code: "limit-reached", ok: false });
			const wrapper = await mountSection();
			const { draft } = await openEditor(wrapper);
			Object.assign(draft, { channelId: NEWS, source: "TwitchLive", target: "shroud" });
			await flushPromises();

			buttonIn(dialog(), "Add subscription")?.click();
			await flushPromises();

			expect(dialog()?.textContent).toContain(
				"This server has the most Twitch live subscriptions it can have.",
			);
			expect(dialog()?.textContent).not.toContain("maximum of 0");
		});

		it("still offers Twitch live once the social subscriptions are full", async () => {
			ready({
				limits: { messageLength: 200, subscriptions: 1, targetLength: 500, xAccounts: 2 },
				subscriptions: [subscription()],
			});
			const wrapper = await mountSection();

			expect(buttonIn(wrapper.element.parentElement, "Add subscription")).toBeDefined();
		});

		it("keeps the add button off until the source, the target and the channel are in", async () => {
			ready();
			const wrapper = await mountSection();
			const { draft } = await openEditor(wrapper);

			expect(buttonIn(dialog(), "Add subscription")?.disabled).toBe(true);

			Object.assign(draft, { channelId: NEWS, source: "Rss", target: "example.com" });
			await flushPromises();

			expect(buttonIn(dialog(), "Add subscription")?.disabled).toBe(false);
		});

		it("sends what was filled in, closes and says which channel gets the notifications", async () => {
			ready();
			const wrapper = await mountSection();
			const { draft } = await openEditor(wrapper);
			Object.assign(draft, {
				channelId: NEWS,
				message: "New post",
				source: "Bluesky",
				target: " bsky.app ",
			});
			await flushPromises();

			buttonIn(dialog(), "Add subscription")?.click();
			await flushPromises();

			expect(mockAddSubscription).toHaveBeenCalledWith({
				channelId: NEWS,
				message: "New post",
				provider: "Bluesky",
				target: "bsky.app",
			});
			// The dialog leaves once its closing transition is over.
			await vi.waitFor(() => expect(dialog()).toBeNull());
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "#news gets a notification for each new item.",
					title: "Subscription added",
				}),
			);
		});

		it("keeps the dialog open on a refusal and says what to fix", async () => {
			ready();
			mockAddSubscription.mockResolvedValue({ code: "target-not-found", ok: false });
			const wrapper = await mountSection();
			const { draft } = await openEditor(wrapper);
			Object.assign(draft, { channelId: NEWS, source: "Rss", target: "nowhere.example" });
			await flushPromises();

			buttonIn(dialog(), "Add subscription")?.click();
			await flushPromises();

			expect(dialog()?.textContent).toContain(
				"Staryl could not find that. Check the spelling and try again.",
			);
			expect(mockToastAdd).not.toHaveBeenCalled();
		});

		it("hides the add button once every source is full or not on Staryl", async () => {
			ready({
				providers: [{ configured: true, manageable: true, maximum: 1, name: "Rss" }],
				subscriptions: [subscription()],
				twitchLiveConfigured: false,
			});
			const wrapper = await mountSection();

			expect(buttonIn(wrapper.element.parentElement, "Add subscription")).toBeUndefined();
		});

		it("shows each source's use against its own maximum, and greys out a full one", async () => {
			ready({
				limits: {
					messageLength: 200,
					subscriptions: 35,
					targetLength: 500,
					twitchLive: 15,
					xAccounts: 2,
				},
				providers: [
					{ configured: true, manageable: true, maximum: 1, name: "Rss" },
					{ configured: true, manageable: true, maximum: 10, name: "YouTube" },
				],
				subscriptions: [subscription()],
			});
			const wrapper = await mountSection();

			const { sourceItems } = await openEditor(wrapper);

			expect(sourceItems.map(({ disabled, label }) => ({ disabled, label }))).toStrictEqual([
				{ disabled: false, label: "Twitch live · 0 / 15" },
				{ disabled: true, label: "RSS or Atom feed · 1 / 1, limit reached" },
				{ disabled: false, label: "YouTube · 0 / 10" },
			]);
		});
	});

	describe("removing a Twitch live subscription", () => {
		it("asks first, naming the streamer and the channel, then removes it", async () => {
			ready({
				twitch: [
					{
						channelId: NEWS,
						message: null,
						revoked: false,
						streamerId: "123",
						streamerName: "CoolStreamer",
						subscriptionId: "7",
						type: "StreamOnline",
					},
				],
			});
			const wrapper = await mountSection();

			await wrapper
				.get('[aria-label="Remove the subscription to CoolStreamer in #news"]')
				.trigger("click");
			await flushPromises();
			buttonIn(dialog(), "Remove subscription")?.click();
			await flushPromises();

			expect(mockRemoveTwitch).toHaveBeenCalledWith(
				expect.objectContaining({ channelId: NEWS, subscriptionId: "7" }),
			);
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "#news no longer gets notifications for CoolStreamer.",
				}),
			);
		});
	});

	describe("removing a subscription", () => {
		it("asks first, naming the account and the channel, then removes it", async () => {
			ready({ subscriptions: [subscription()] });
			const wrapper = await mountSection();

			await wrapper
				.get('[aria-label="Remove the subscription to Example feed in #general"]')
				.trigger("click");
			await flushPromises();

			expect(mockRemoveSubscription).not.toHaveBeenCalled();
			expect(dialog()?.textContent).toContain(
				"#general stops getting notifications for Example feed. This cannot be undone.",
			);

			buttonIn(dialog(), "Remove subscription")?.click();
			await flushPromises();

			expect(mockRemoveSubscription).toHaveBeenCalledWith(
				expect.objectContaining({ channelId: GENERAL, sourceId: "5" }),
			);
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({ title: "Subscription removed" }),
			);
		});

		it("says a removal failed, and why", async () => {
			ready({ subscriptions: [subscription()] });
			mockRemoveSubscription.mockResolvedValue({ code: "unavailable", ok: false });
			const wrapper = await mountSection();

			await wrapper
				.get('[aria-label="Remove the subscription to Example feed in #general"]')
				.trigger("click");
			await flushPromises();
			buttonIn(dialog(), "Remove subscription")?.click();
			await flushPromises();

			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "error",
					description:
						"The dashboard could not reach Staryl. Try again in a few minutes.",
				}),
			);
		});
	});
});
