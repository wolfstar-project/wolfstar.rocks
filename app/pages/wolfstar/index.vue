<template>
  <section class="mt-28 flex flex-col items-center text-center">
    <h1 class="title pb-4">Imagine a<br />moderation app</h1>
    <p class="max-w-120">
      A very customizable multilanguage application to help you moderate your
      server, with a complete logging suite and more,
      <span class="font-bold underline underline-offset-2">100% for free</span>!
    </p>
  </section>

  <section class="mt-16 join flex items-center justify-center">
    <NuxtLink class="btn join-item sm:btn-wide" :to="Invites.WolfStar">
      <UIcon name="ph:plus-circle-fill" class="h-5 w-5" aria-hidden="true" /> Add App
    </NuxtLink>
    <NuxtLink
      class="btn join-item sm:btn-wide"
      to="#explore"
    >
      <UIcon name="ph:magnifying-glass-fill" class="h-5 w-5" aria-hidden="true" />
      Explore
    </NuxtLink>
  </section>

  <h2 id="explore" class="mt-72 text-5xl font-bold">Explore</h2>
  <div id="moderation-tools" class="mt-32">
    <h2 class="text-5xl font-bold">Advanced Auto Moderator</h2>
    <section class="mt-32 grid gap-4 md:gap-12 lg:grid-cols-2 lg:gap-20">
      <div
        class="flex flex-col-reverse items-center gap-4 max-lg:order-last lg:flex-row"
      >
        <DiscordMessages class="w-full">
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
                  class="flex aspect-video w-full items-center justify-center rounded-lg bg-base-100 drop-shadow-lg"
                >
                  <UIcon
                    name="ph:image-duotone"
                    class="h-24 w-24 animate-pulse text-base-content/20"
                    aria-hidden="true"
                  />
                </div>
                <div
                  class="flex aspect-video w-full items-center justify-center rounded-lg bg-base-100 drop-shadow-lg"
                >
                  <UIcon
                    name="ph:image-duotone"
                    class="h-24 w-24 animate-pulse text-base-content/20"
                    aria-hidden="true"
                  />
                </div>
                <div
                  class="flex aspect-video w-full items-center justify-center rounded-lg bg-base-100 drop-shadow-lg"
                >
                  <UIcon
                    name="ph:image-duotone"
                    class="h-24 w-24 animate-pulse text-base-content/20"
                    aria-hidden="true"
                  />
                </div>
                <div
                  class="flex aspect-video w-full items-center justify-center rounded-lg bg-base-100 drop-shadow-lg"
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

      <div class="prose">
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

    <section class="mt-32 grid gap-4 md:gap-12 lg:grid-cols-2 lg:gap-20">
      <div class="prose">
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
          <DiscordMessages class="w-full">
            <DiscordMessage name="wolfstar">
              <DiscordEmbed
                :color="moderationActionRender.color"
                :author="{
                  icon: '/avatars/wolfstar.png',
                  name: 'WolfStar#9286 (854714837388755004)',
                }"
                :footer="{ icon: '/avatars/wolfstar.png', text: 'Case 3' }"
                :timestamp="Date.now()"
              >
                <span><strong>❯ Type:</strong>
                  {{ moderationActionRender.name }}</span><br />
                <span><strong>❯ User:</strong> @baddie (541738403230777351)</span><br />
                <span><strong>❯ Reason:</strong> spam</span>
              </DiscordEmbed>
            </DiscordMessage>
          </DiscordMessages>

          <div class="mt-4 join self-start">
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
  </div>

  <div id="advanced-logging" class="mt-32">
    <h2 class="text-5xl font-bold">Advanced Logging</h2>
    <p class="mt-4 font-semibold">
      WolfStar not only comes with a very complete moderation suite, but also
      advanced logging capabilities to keep track of everything that happens in
      your server.
    </p>

    <section class="mt-32 grid gap-4 md:gap-12 lg:grid-cols-2 lg:gap-20">
      <div class="flex flex-col-reverse items-center gap-4 max-lg:order-last lg:flex-row">
        <DiscordMessages class="w-full">
          <DiscordMessage name="wolfstar">
            <DiscordEmbed
              :color="loggingEvents[loggingIndex]!.color"
              :author="{
                icon: '/avatars/wolfstar.png',
                name: 'WolfStar#9286 (854714837388755004)',
              }"
              :footer="{ icon: '/avatars/wolfstar.png', text: `Log ID ${123456 + loggingIndex}` }"
              :timestamp="Date.now()"
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

      <div class="prose">
        <h3 class="mb-4 text-3xl font-bold">
          <UIcon :name="loggingEvents[loggingIndex]!.icon" class="h-8 w-8" aria-hidden="true" />
          Keep track of
          <span class="underline underline-offset-4">{{ loggingEvents[loggingIndex]!.title }}</span>
        </h3>

        <p>
          WolfStar can log almost everything that happens in your server, from
          members joining and leaving, to channel and role updates, message
          edits and deletions, and much more.
        </p>

        <p>
          <UIcon
            name="ph:magnifying-glass-duotone"
            class="my-0 mr-1 h-5 w-5 text-purple-500"
            aria-hidden="true"
          />
          All logs are <strong>fully searchable</strong> and can be filtered by
          user, action, channel, and more. Keep a complete history of your
          server's activity.
        </p>

        <p>
          <UIcon
            name="ph:clock-duotone"
            class="my-0 mr-1 h-5 w-5 text-info"
            aria-hidden="true"
          />
          Logs are sent to your server <strong>in real-time</strong>, so you
          can stay up to date with everything that's happening.
        </p>
      </div>
    </section>
  </div>
  <section class="prose">
    <h3 class="mt-32 text-center text-3xl font-bold">And more!</h3>
    <p>
      WolfStar not only comes with a very complete moderation suite, but also:
    </p>
    <ul>
      <li>
        <UIcon
          name="ph:chat-text-duotone"
          class="my-0 mr-1 h-5 w-5 text-warning"
          aria-hidden="true"
        />
        <strong>A large logging suite:</strong> WolfStar can log almost
        everything that happens in your server: moderation actions, message
        updates and deletions, channel updates and deletions, role updates and
        deletions, server updates, members changing voice channels, and more.
      </li>
      <li>
        <UIcon
          name="ph:money-wavy-duotone"
          class="my-0 mr-1 h-5 w-5 text-error"
          aria-hidden="true"
        />
        <strong>No paywalls:</strong> all of WolfStar's features are
        <strong>available for free</strong> and all logs are sent to your server
        as soon as they happen, without any delay. WolfStar Project
        <strong>will never paywall core features</strong>, and also
        <strong>strongly believes in Open-Source Software</strong>, making all
        the apps' source code freely available to everyone, and will always stay
        that way.
      </li>
    </ul>
  </section>

  <section class="invite-card mt-32 flex flex-col items-center">
    <h3 class="mb-4 text-3xl font-bold">Liking what you see?</h3>

    <div class="join">
      <NuxtLink
        :to="Invites.WolfStar"
        class="btn join-item btn-ghost"
      >
        Invite WolfStar
      </NuxtLink>
      <NuxtLink
        to="https://join.wolfstar.rocks"
        class="btn join-item btn-ghost"
      >
        Support Server
      </NuxtLink>
    </div>
  </section>
  <OtherApps :apps="[OtherApps.Staryl]" />
</template>

<script setup lang="ts">
import { cast } from "@sapphire/utilities/cast";

definePageMeta({ alias: ["/"] });

useSeoMetadata({
  title: "Home",
  description:
    "WolfStar's landing page.\nA very customizable multilanguage application to help you moderate your server, with a complete logging suite and more, 100% for free!",
  shouldSeoImage: true,
});

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

const featureIndex = ref(0);

const loggingEvents = [
  {
    tooltip: "Member Join",
    title: "member joins",
    icon: "ph:user-plus-fill",
    color: "#FFA500",
    action: "User Joined",
    details: [
      { label: "User", value: "@newmember (123456789012345678)" },
      { label: "Account Created", value: "2023-01-01 12:00:00 UTC" },
    ],
  },
  {
    tooltip: "Member Leave",
    title: "member leaves",
    icon: "ph:user-minus-fill",
    color: "#FF6B6B",
    action: "User Left",
    details: [
      { label: "User", value: "@oldmember (987654321098765432)" },
      { label: "Roles", value: "@Member, @Verified" },
      { label: "Joined At", value: "2023-06-15 08:30:00 UTC" },
    ],
  },
  {
    tooltip: "Message Delete",
    title: "message deletions",
    icon: "ph:trash-simple-fill",
    color: "#E74C3C",
    action: "Message Deleted",
    details: [
      { label: "User", value: "@someone (456789012345678901)" },
      { label: "Channel", value: "#general" },
      { label: "Content", value: "This message has been deleted" },
    ],
  },
  {
    tooltip: "Message Edit",
    title: "message edits",
    icon: "ph:pencil-simple-fill",
    color: "#3498DB",
    action: "Message Edited",
    details: [
      { label: "User", value: "@editor (234567890123456789)" },
      { label: "Channel", value: "#chat" },
      { label: "Before", value: "Original message" },
      { label: "After", value: "Edited message" },
    ],
  },
  {
    tooltip: "Channel Create",
    title: "channel creation",
    icon: "ph:hash-fill",
    color: "#2ECC71",
    action: "Channel Created",
    details: [
      { label: "Channel", value: "#new-channel" },
      { label: "Type", value: "Text Channel" },
      { label: "Created By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Channel Delete",
    title: "channel deletion",
    icon: "ph:hash-straight-fill",
    color: "#E67E22",
    action: "Channel Deleted",
    details: [
      { label: "Channel", value: "#old-channel" },
      { label: "Type", value: "Text Channel" },
      { label: "Deleted By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Channel Update",
    title: "channel updates",
    icon: "ph:hash-fill",
    color: "#F39C12",
    action: "Channel Updated",
    details: [
      { label: "Channel", value: "#general" },
      { label: "Changes", value: "Name changed from #old-general to #general" },
      { label: "Updated By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Role Create",
    title: "role creation",
    icon: "ph:shield-plus-fill",
    color: "#9B59B6",
    action: "Role Created",
    details: [
      { label: "Role", value: "@NewRole" },
      { label: "Color", value: "#5865F2" },
      { label: "Created By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Role Update",
    title: "role updates",
    icon: "ph:shield-check-fill",
    color: "#1ABC9C",
    action: "Role Updated",
    details: [
      { label: "Role", value: "@Moderator" },
      { label: "Changes", value: "Permissions updated" },
      { label: "Updated By", value: "@admin (112233445566778899)" },
    ],
  },
  {
    tooltip: "Role Delete",
    title: "role deletion",
    icon: "ph:shield-minus-fill",
    color: "#E91E63",
    action: "Role Deleted",
    details: [
      { label: "Role", value: "@OldRole" },
      { label: "Color", value: "#99AAB5" },
      { label: "Deleted By", value: "@admin (112233445566778899)" },
    ],
  },
] satisfies {
  tooltip: string;
  title: string;
  icon: string;
  color: string;
  action: string;
  details: { label: string; value: string }[];
}[];

const loggingIndex = ref(0);

const moderationActions = Object.values(ModerationActions);
const moderationIndex = ref(0);
const moderationAction = cast<NonNullable<ComputedRef<ModerationAction>>>(
  computed(() => moderationActions[moderationIndex.value]),
);

const moderationTemporary = ref(false);
const moderationUndo = ref(false);

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
</script>

<style scoped>
@reference "@/assets/css/main.css";
.title {
	@apply text-4xl font-bold leading-[3.05rem] md:text-5xl md:leading-[3.8rem] bg-linear-to-b from-white to-branding-wolfstar bg-clip-text text-transparent;
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

.invite-card {
	@apply relative p-12 text-white;
}

.invite-card::before {
	@apply absolute left-0 top-0 -z-10 h-full w-full -rotate-2 rounded-xl drop-shadow-lg;
	background: linear-gradient(to bottom right in oklch, var(--color-red-600) 0%, var(--color-purple-600) 70%);
	content: '';
}
</style>
