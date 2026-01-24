<!-- eslint-disable vue/no-template-shadow -->
<template>
  <div class="w-full">
    <!-- Feature Display -->
    <div class="relative w-full max-w-7xl mx-auto min-h-100">
      <div
        v-for="(feature, index) in features"
        :key="feature.id"
        class="animate-fade-in"
      >
        <div v-if="activeFeature === index" class="gap-8 items-center">
          <!-- Feature Details -->
          <div :id="feature.id" class="text-left scroll-mt-24">
            <h3 class="text-3xl font-bold mb-4 flex items-center gap-2">
              <div class="flex items-center justify-center rounded-full size-10 bg-primary/20">
                <UIcon :name="feature.icon" class="size-7 text-primary mt-0.5" />
              </div>
              {{ feature.title }}
            </h3>
            <p class="text-lg opacity-80 mb-6 leading-relaxed">
              {{ feature.description }}
            </p>
            <NuxtLink to="#" class="btn btn-outline">
              Learn more about {{ feature.label }}
            </NuxtLink>
          </div>

          <!-- Discord Preview -->
          <div class="w-full">
            <template v-if="feature.id === 'moderation-tools'">
              <section class="mt-12 grid gap-4 md:gap-12 lg:grid-cols-2 lg:gap-20">
                <div
                  class="flex flex-col-reverse items-center gap-4 max-lg:order-last lg:flex-row"
                >
                  <DiscordMessages class="w-full text-left">
                    <template v-if="featureIndex === AutomodFeature.Spam">
                      <DiscordMessage v-for="n in 2" :key="n" name="baddie">
                        Guys look at me!
                      </DiscordMessage>
                    </template>
                    <DiscordMessage
                      :name="
                        featureIndex === AutomodFeature.Reactions ? 'stella' : 'baddie'
                      "
                      :class="{ 'text-error': featureIndex !== AutomodFeature.Reactions }"
                    >
                      <template v-if="featureIndex === AutomodFeature.Attachments">
                        Have you seen this????
                        <div class="grid max-w-96 grid-cols-2 gap-2">
                          <div
                            class="flex aspect-video w-full items-center justify-center rounded-lg card-glass drop-shadow-lg"
                          >
                            <UIcon
                              name="ph:image-duotone"
                              class="h-24 w-24 animate-pulse text-base-content/20"
                              aria-hidden="true"
                            />
                          </div>
                          <div
                            class="flex aspect-video w-full items-center justify-center rounded-lg card-glass drop-shadow-lg"
                          >
                            <UIcon
                              name="ph:image-duotone"
                              class="h-24 w-24 animate-pulse text-base-content/20"
                              aria-hidden="true"
                            />
                          </div>
                          <div
                            class="flex aspect-video w-full items-center justify-center rounded-lg card-glass drop-shadow-lg"
                          >
                            <UIcon
                              name="ph:image-duotone"
                              class="h-24 w-24 animate-pulse text-base-content/20"
                              aria-hidden="true"
                            />
                          </div>
                          <div
                            class="flex aspect-video w-full items-center justify-center rounded-lg card-glass drop-shadow-lg"
                          >
                            <UIcon
                              name="ph:image-duotone"
                              class="h-24 w-24 animate-pulse text-base-content/20"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Capitals">
                        I CAN TALK IN ALL UPPER CASES,
                        <strong>AND WOLFSTAR WILL NOT STOP ME!</strong>
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Invites">
                        Everyone join my server!
                        <NuxtLink
                          to="https://discord.gg/gqAnRyUXG8"
                          class="text-info"
                        >
                          https://discord.gg/gqAnRyUXG8
                        </NuxtLink>
                        <DiscordInvite link="https://discord.gg/gqAnRyUXG8" />
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Links">
                        Everyone check out those links!
                        <ul class="ml-5 list-disc">
                          <li>
                            <span class="text-info">https://definitely-not-pishing.com</span>
                          </li>
                          <li>
                            <span class="text-info">https://redundant-spam-links.net</span>
                          </li>
                          <li>
                            <span class="text-info">https://too-many-links.com</span>
                          </li>
                          <li><span class="text-info">https://trojan-horse.xyz</span></li>
                          <li><span class="text-info">https://not-a-virus.com</span></li>
                        </ul>
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Mentions">
                        Everyone notice me!
                        <DiscordMention kind="mention">everyone</DiscordMention>
                        <DiscordMention kind="mention">members</DiscordMention>{{ " "
                        }}<DiscordMention kind="mention">moderators</DiscordMention>
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Newlines">
                        Hehehehe
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        So many lines!
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Reactions">
                        Hey folks! I have great news to share!
                        <DiscordReactions>
                          <DiscordReaction
                            :count="7"
                            self
                          >
                            <UIcon
                              name="ph:cheers-fill"
                              class="text-success"
                              aria-hidden="true"
                            />
                          </DiscordReaction>
                          <DiscordReaction
                            :count="1"
                            class="text-error"
                          >
                            <UIcon name="ph:knife-fill" aria-hidden="true" />
                          </DiscordReaction>
                        </DiscordReactions>
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Spam">
                        Guys look at me!
                      </template>
                      <template v-else-if="featureIndex === AutomodFeature.Words">
                        I would like to say that you're a
                        <strong>disgusting</strong> person.
                      </template>
                    </DiscordMessage>
                    <DiscordMessage name="wolfstar">
                      Dear <DiscordMention kind="mention">Baddie</DiscordMention>,
                      {{ texts[featureIndex]!.alert }}
                    </DiscordMessage>
                  </DiscordMessages>

                  <div class="flex flex-row items-center gap-1 lg:flex-col">
                    <UIcon
                      name="ph:caret-down-bold"
                      class="radio-feature-arrow rotate-90 lg:rotate-180"
                      role="button"
                      aria-label="Previous automod feature"
                      @click="advanceFeatureIndex(-1)"
                    />
                    <label
                      v-for="(text, index) of texts"
                      :key="index"
                      class="radio-feature-container"
                      :data-tip="text.tooltip"
                      :for="`automod-feature-${index}`"
                    >
                      <input
                        :id="`automod-feature-${index}`"
                        v-model="featureIndex"
                        type="radio"
                        name="automod-feature"
                        class="radio-feature"
                        :value="index"
                      />
                      <span class="sr-only">{{ text.tooltip }}</span>
                    </label>
                    <UIcon
                      name="ph:caret-down-bold"
                      class="radio-feature-arrow -rotate-90 lg:rotate-0"
                      role="button"
                      aria-label="Next automod feature"
                      @click="advanceFeatureIndex(1)"
                    />
                  </div>
                </div>

                <div class="prose text-left">
                  <h3 class="mb-4 text-3xl font-bold">
                    <UIcon name="ph:shield-fill" class="h-8 w-8" aria-hidden="true" />
                    WolfStar can act on
                    <span class="underline underline-offset-4">{{
                      texts[featureIndex]!.title
                    }}</span>
                  </h3>

                  <p>
                    Enjoy the power of moderation with WolfStar, a fully customizable
                    moderation bot for your server.
                  </p>

                  <p>You can define what WolfStar should do on every infraction:</p>
                  <ul>
                    <li>
                      <UIcon name="ph:arrow-u-up-left" class="my-0 mr-1 h-5 w-5" aria-hidden="true" />
                      <strong>Alert the user:</strong> send a message notifying the user
                      of their infraction.
                    </li>
                    <li>
                      <UIcon name="ph:flag-fill" class="my-0 mr-1 h-5 w-5 text-warning" aria-hidden="true" />
                      <strong>Post moderation log:</strong> send a message to the
                      moderation log channel for moderators to see.
                    </li>
                    <li>
                      <UIcon
                        name="ph:trash-simple-fill"
                        class="my-0 mr-1 h-5 w-5 text-error"
                        aria-hidden="true"
                      />
                      <strong>Delete the message:</strong> delete the message that
                      triggered the infraction, keeping your channels clean.
                    </li>
                  </ul>

                  <p>And even what WolfStar should do after repeated infractions!</p>
                  <ul>
                    <li>
                      <UIcon
                        name="ph:shield-check-duotone"
                        class="my-0 mr-1 h-5 w-5 text-purple-500"
                        aria-hidden="true"
                      />
                      <strong>Define the punishment action:</strong> from a simple warning
                      to a full ban, and everything in between, with a customizable
                      <strong>punishment duration</strong> ranging from seconds to even
                      years, or permanent.
                    </li>
                    <li>
                      <UIcon name="ph:hourglass-duotone" class="my-0 mr-1 h-5 w-5" aria-hidden="true" />
                      <strong>Define the threshold:</strong> how many infractions are
                      needed within a period of time before the punishment is applied.
                    </li>
                  </ul>
                </div>
              </section>

              <section class="mt-12 grid gap-4 md:gap-12 lg:grid-cols-2 lg:gap-20">
                <div
                  class="prose text-left
                "
                >
                  <h3 class="mb-4 text-3xl font-bold">
                    <UIcon name="ph:shield-fill" class="h-8 w-8" aria-hidden="true" />
                    A complete suite for
                    <span class="underline underline-offset-4">moderation logs</span>
                  </h3>

                  <p>
                    Easily searchable moderation logs, with a complete history of every
                    action taken by WolfStar in your server, and with the ability to
                    filter them later by user, action, and more!
                  </p>

                  <p>
                    <UIcon
                      name="ph:binoculars-duotone"
                      class="my-0 mr-1 h-5 w-5 text-purple-500"
                      aria-hidden="true"
                    />
                    WolfStar can also listen for external moderation actions. You prefer
                    banning by hand than by bot? Good news, WolfStar can be configured to
                    listen and log external bans, retrieving the reason from audit logs!
                  </p>
                </div>

                <div class="flex flex-col items-center gap-4 lg:flex-row">
                  <div class="flex flex-row items-center gap-1 lg:flex-col">
                    <UIcon
                      name="ph:caret-down-bold"
                      class="radio-feature-arrow rotate-90 lg:rotate-180"
                      role="button"
                      aria-label="Previous moderation action"
                      @click="advanceModerationIndex(-1)"
                    />
                    <label
                      v-for="(action, index) of moderationActions"
                      :key="action.name"
                      class="radio-feature-container"
                      :data-tip="action.name"
                      :for="`moderation-feature-${index}`"
                    >
                      <input
                        :id="`moderation-feature-${index}`"
                        v-model="moderationIndex"
                        type="radio"
                        name="moderation-log"
                        class="radio-feature"
                        :value="index"
                      />
                      <span class="sr-only">{{ action.name }}</span>
                    </label>
                    <UIcon
                      name="ph:caret-down-bold"
                      class="radio-feature-arrow -rotate-90 lg:rotate-0"
                      role="button"
                      aria-label="Next moderation action"
                      @click="advanceModerationIndex(1)"
                    />
                  </div>

                  <div class="flex flex-col items-start">
                    <DiscordMessages class="w-full text-left">
                      <DiscordMessage name="wolfstar">
                        <DiscordEmbed
                          :color="moderationActionRender.color"
                          :author="{
                            icon: '/avatars/wolfstar.png',
                            name: 'WolfStar#9286 (854714837388755004)',
                          }"
                          :footer="{ icon: '/avatars/wolfstar.png', text: 'Case 3' }"
                          :timestamp
                        >
                          <span><strong>❯ Type:</strong>
                            {{ moderationActionRender.name }}</span><br />
                          <span><strong>❯ User:</strong> @baddie (541738403230777351)</span><br />
                          <span><strong>❯ Reason:</strong> spam</span>
                        </DiscordEmbed>
                      </DiscordMessage>
                    </DiscordMessages>

                    <div class="mt-4 join self-start md:self-center">
                      <button
                        class="btn join-item md:btn-wide"
                        :class="{ 'btn-info': moderationTemporary }"
                        :disabled="moderationAction.temporary === null"
                        @click="
                          ((moderationTemporary = !moderationTemporary),
                           (moderationUndo = false))
                        "
                      >
                        <UIcon name="ph:hourglass-duotone" class="my-0 mr-1 h-5 w-5" aria-hidden="true" />
                        Temporary
                      </button>
                      <button
                        class="btn join-item md:btn-wide"
                        :class="{ 'btn-success': moderationUndo }"
                        :disabled="moderationAction.undo === null"
                        @click="
                          ((moderationUndo = !moderationUndo),
                           (moderationTemporary = false))
                        "
                      >
                        <UIcon
                          name="ph:arrow-counter-clockwise-duotone"
                          class="my-0 mr-1 h-5 w-5"
                          aria-hidden="true"
                        />
                        Undo
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </template>

            <template v-else-if="feature.id === 'advanced-logging'">
              <section class="mt-12 grid gap-4 md:gap-12 lg:grid-cols-2 lg:gap-20">
                <div
                  class="flex flex-col items-center gap-4 lg:flex-row"
                >
                  <DiscordMessages class="w-full text-left">
                    <DiscordMessage name="wolfstar">
                      <DiscordEmbed
                        :color="loggingEvents[loggingIndex]!.color"
                        :author="{
                          icon: '/avatars/wolfstar.png',
                          name: 'WolfStar#9286 (854714837388755004)',
                        }"
                        :footer="{ icon: '/avatars/wolfstar.png', text: `Log #${123456 + loggingIndex}` }"
                        :timestamp
                      >
                        <span><strong>❯ Action:</strong> {{ loggingEvents[loggingIndex]!.action }}</span><br />
                        <span
                          v-for="(detail, idx) in loggingEvents[loggingIndex]!.details"
                          :key="idx"
                        >
                          <strong>❯ {{ detail.label }}:</strong> {{ detail.value }}<br />
                        </span>
                      </DiscordEmbed>
                    </DiscordMessage>
                  </DiscordMessages>

                  <div class="flex flex-row items-center gap-1 lg:flex-col">
                    <UIcon
                      name="ph:caret-down-bold"
                      class="radio-feature-arrow rotate-90 lg:rotate-180"
                      role="button"
                      aria-label="Previous logging event"
                      @click="advanceLoggingIndex(-1)"
                    />
                    <label
                      v-for="(event, index) of loggingEvents"
                      :key="index"
                      class="radio-feature-container"
                      :data-tip="event.tooltip"
                      :for="`logging-feature-${index}`"
                    >
                      <input
                        :id="`logging-feature-${index}`"
                        v-model="loggingIndex"
                        type="radio"
                        name="logging-feature"
                        class="radio-feature"
                        :value="index"
                      />
                      <span class="sr-only">{{ event.tooltip }}</span>
                    </label>
                    <UIcon
                      name="ph:caret-down-bold"
                      class="radio-feature-arrow -rotate-90 lg:rotate-0"
                      role="button"
                      aria-label="Next logging event"
                      @click="advanceLoggingIndex(1)"
                    />
                  </div>
                </div>

                <div class="prose text-left">
                  <h3 class="mb-4 text-3xl font-bold">
                    <UIcon :name="loggingEvents[loggingIndex]!.icon ?? 'ph:binoculars-duotone'" class="h-8 w-8" aria-hidden="true" />
                    Keep track of
                    <span class="underline underline-offset-4">{{ loggingEvents[loggingIndex]!.title }}</span>
                  </h3>

                  <p>
                    WolfStar can log almost everything that happens in your server, from
                    members joining and leaving, to channel and role updates, message
                    edits and deletions, and much more.
                  </p>

                  <p>And even what WolfStar should be logging:</p>
                  <ul>
                    <li>
                      <UIcon
                        name="ph:magnifying-glass-duotone"
                        class="my-0 mr-1 h-5 w-5 text-purple-500"
                        aria-hidden="true"
                      />
                      All logs are <strong>fully searchable</strong> and can be filtered by
                      user, action, channel, and more. Keep a complete history of your
                      server's activity.
                    </li>
                    <li>
                      <UIcon
                        name="ph:clock-duotone"
                        class="my-0 mr-1 h-5 w-5 text-info"
                        aria-hidden="true"
                      />
                      Logs are sent to your server <strong>in real-time</strong>, so you
                      can stay up to date with everything that's happening.
                    </li>
                  </ul>
                </div>
              </section>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cast } from "@sapphire/utilities/cast";

const activeFeature = defineModel<number>("activeFeature", { default: 0 });

enum AutomodFeature {
  Attachments,
  Capitals,
  Invites,
  Links,
  Mentions,
  Newlines,
  Reactions,
  Spam,
  Words,
}

const features = [
  {
    id: "moderation-tools",
    title: "Advanced Auto Moderator",
    label: "Automod",
    description: "WolfStar's auto-moderation system is a powerful tool that can help you keep your server safe and clean. It can automatically detect and remove unwanted content, such as spam, bad words, and more.",
    icon: "ph:shield-fill",
  },
  {
    id: "advanced-logging",
    title: "Advanced Logging",
    label: "Logging",
    description: "WolfStar not only comes with a very complete moderation suite, but also advanced logging capabilities to keep track of everything that happens in your server.",
    icon: "ph:binoculars-duotone",
  },
] satisfies {
  id: string;
  title: string;
  label: string;
  description: string;
  icon: string;
}[];

const texts = [
  {
    tooltip: "Attachments",
    title: "attachments",
    alert: "file attachments aren't allowed in this channel.",
  },
  {
    tooltip: "Capitals",
    title: "capital letters",
    alert: "please reduce your use of capital letters.",
  },
  {
    tooltip: "Invites",
    title: "invites",
    alert: "invite links aren't allowed in this channel.",
  },
  {
    tooltip: "Links",
    title: "bad links",
    alert: "you sent links that aren't allowed here.",
  },
  {
    tooltip: "Mentions",
    title: "excessive mentions",
    alert: "you mentioned too many people.",
  },
  {
    tooltip: "Lines",
    title: "excessive lines",
    alert: "your message contains too many lines.",
  },
  {
    tooltip: "Reactions",
    title: "bad reactions",
    alert: "you cannot react with that emoji.",
  },
  {
    tooltip: "Spam",
    title: "spam",
    alert: "please refrain from reposting the same message multiple times.",
  },
  {
    tooltip: "Words",
    title: "bad words",
    alert: "you said something that is not allowed in this server.",
  },
] satisfies {
  tooltip: string;
  title: string;
  alert: string;
}[];

const timestamp = ref(0);
const featureIndex = ref(0);
const loggingIndex = ref(0);
const moderationTemporary = ref(false);
const moderationUndo = ref(false);
const moderationIndex = ref(0);

const moderationActions = Object.values(ModerationActions);

function advanceFeatureIndex(value: -1 | 1) {
  featureIndex.value
    = (featureIndex.value + value + texts.length) % texts.length;
}

function advanceLoggingIndex(value: -1 | 1) {
  loggingIndex.value
    = (loggingIndex.value + value + loggingEvents.length)
      % loggingEvents.length;
}

function advanceModerationIndex(value: -1 | 1) {
  moderationIndex.value
    = (moderationIndex.value + value + moderationActions.length)
      % moderationActions.length;
}

const moderationAction = cast<NonNullable<ComputedRef<ModerationAction>>>(
  computed(() => moderationActions[moderationIndex.value]),
);

const moderationActionRender = computed(() => {
  const action = moderationAction.value;
  if (moderationTemporary.value && action.temporary !== null) {
    return { color: action.temporary, name: `Temporary ${action.name}` };
  }

  if (moderationUndo.value && action.undo !== null) {
    return { color: action.undo, name: `Remove ${action.name}` };
  }

  return { color: action.color, name: action.name };
});

const location = useBrowserLocation();

// Handle hash navigation
function handleHashChange() {
  const hash = location.value.hash?.slice(1);
  if (!hash)
    return;
  const featureIndex = features.findIndex(f => f.id === hash);
  if (featureIndex !== -1) {
    activeFeature.value = featureIndex;
    // Scroll to element after a short delay to ensure it's rendered
    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }
};

// Set timestamp on client-side only to prevent hydration mismatch
onMounted(() => {
  timestamp.value = Date.now();
});

const cleanup = useEventListener(window, "hashchange", handleHashChange);

onUnmounted(cleanup);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Override Discord Embed Background */
:deep(.brand-embed .discord-embed) {
	backdrop-filter: blur(10px);
	border: 1px solid oklch(var(--color-branding-wolfstar) / 0.2);
	background-color: oklch(var(--color-branding-wolfstar) / 0.1) !important;
}

.radio-feature-container {
	@apply tooltip tooltip-top lg:tooltip-right;
	display: inherit;
}

.radio-feature {
	@apply h-4 w-4 cursor-pointer appearance-none rounded-full bg-base-content/20;
}

.radio-feature-arrow {
	@apply h-4 w-4;
}

@media not (hover: hover) {
	.radio-feature {
		@apply h-6 w-6;
	}
	.radio-feature-arrow {
		@apply h-6 w-6;
	}
}

.radio-feature:not(:checked):hover {
	@apply bg-base-content/40;
}

.radio-feature:checked {
	@apply bg-base-content/80;
}

.radio-feature:checked:hover {
	@apply bg-base-content;
}

.radio-feature {
	transition: linear background-color 0.25s;
}

.animate-fade-in {
	animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
	from {
		transform: translateY(10px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>
