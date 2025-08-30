<template>
  <div class="flex h-screen bg-gradient-to-br from-base-100/95 to-base-200/90 backdrop-blur-sm">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <div class="glass-panel border-b border-base-300/30 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="fade-slide-in">
            <h2 class="text-xl font-bold">{{ currentPageTitle }}</h2>
            <p class="text-sm text-base-content/70">{{ currentPageDescription }}</p>
          </div>

          <!-- Save/Reset Actions -->
          <!-- <Transition name="fade" mode="out-in">
            <div v-if="hasChanges" class="flex gap-3">
              <button
                class="btn-glass btn btn-sm transition-glass hover-lift"
                :class="{ loading }"
                :disabled="loading"
                @click="resetAllChanges"
              >
                <Icon name="heroicons:arrow-path" class="w-4 h-4" />
                Reset Changes
              </button>
              <button
                class="btn btn-primary btn-sm transition-glass hover-lift"
                :class="{ loading }"
                :disabled="loading"
                @click="submitChanges"
              >
                <Icon name="heroicons:check" class="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </Transition>
        </div> -->
        </div>

        <!-- Settings Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <ShadTabs v-model="currentRoute" :items="navigationItems" variant="lift">
            <template #content="{ item }">
              <div class="card card-glass rounded-xl p-6 fade-slide-in">
                <GuildSettingsGeneral v-if="item.value === 'general'" :guild-data="guildData" :languages="languages" />
                <GuildSettingsModeration v-if="item.value === 'moderation'" :guild-data="guildData" />
                <GuildSettingsChannel v-if="item.value === 'channels'" :guild-data="guildData" />
                <GuildSettingsRole v-if="item.value === 'roles'" :guild-data="guildData" />
                <GuildSettingsEvent v-if="item.value === 'events'" :guild-data="guildData" />
                <GuildSettingsDisabledCommands v-if="item.value === 'disabled-commands'" :guild-data="guildData" :commands="commands" />
              </div>
            </template>
          </ShadTabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OauthFlattenedGuild } from "~~/shared/types/discord";
import type { TabsItem } from "~/components/ui/tabs";
import { isNullOrUndefined } from "@sapphire/utilities";
import { useRouteParams } from "@vueuse/router";
import { useCommands } from "@/composables/useCommands";
import { useLanguages } from "@/composables/useLanguages";

const route = useRoute();
const guildIdParam = useRouteParams("id");
const guildData = ref<OauthFlattenedGuild>();
const loading = useState("loading", () => false);

const guildId = computed(() => (Array.isArray(guildIdParam.value) ? guildIdParam.value[0] : guildIdParam.value));

// Current route detection
const currentRoute = computed(() => {
  const pathParts = route.path.split("/");
  const manageIndex = pathParts.indexOf("manage");

  if (manageIndex !== -1 && manageIndex + 1 < pathParts.length) {
    const section = pathParts[manageIndex + 1];
    if (navigationItems.some(item => item.value === section)) {
      return section;
    }
  }

  return "general";
});

// Use composables and stores

const { languages, fetchLanguages } = useLanguages();
const { commands, fetchCommands } = useCommands();

// Navigation items for sidebar
const navigationItems = [
  {
    value: "general",
    label: "General",
    icon: "heroicons:cog-6-tooth",
    badge: {
      label: "New",
      color: "primary",
    },
    description: "Basic bot settings",
  },
  {
    value: "moderation",
    label: "Moderation",
    icon: "heroicons:shield-check",
    description: "Moderation features",
  },
  {
    value: "channels",
    label: "Channels",
    icon: "heroicons:hashtag",
    description: "Channel configuration",
  },
  {
    value: "roles",
    label: "Roles",
    icon: "heroicons:user-group",
    description: "Role management",
  },
  {
    value: "events",
    label: "Events",
    icon: "heroicons:bell",
    description: "Event logging",
  },
  {
    value: "disabled-commands",
    label: "Commands",
    icon: "heroicons:command-line",
    description: "Command settings",
  },
] satisfies TabsItem[];

// Page title and description
const currentPageTitle = computed(() => "Dashboard");
const currentPageDescription = computed(() => "Overview of your server settings and quick actions");

await Promise.all([fetchLanguages(), fetchCommands()]);

// Validate guild ID first
if (!isValidGuildId(guildId.value)) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid Guild ID",
    message: "The provided guild ID is not valid. Guild IDs must be 17-19 digit numbers.",
    data: {
      field: "guildId",
    },
  });
}

// Validate Guild ID format (Discord Snowflake: 17-19 digit string)
function isValidGuildId(id: string | undefined | null): boolean {
  if (isNullOrUndefined(id))
    return false;
  const snowflakeRegex = /^\d{17,19}$/;
  return snowflakeRegex.test(id);
}

onMounted(async () => {
  loading.value = true;
  await fetchLanguages();

  await fetchCommands();

  loading.value = false;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";
/* glass-morphism utilities */
.glass-panel {
	@apply bg-base-100/80 backdrop-blur-md border border-base-300/50;
}

/* Animation utilities */
.transition-glass {
	@apply transition-all duration-300 ease-in-out;
}

.hover-lift {
	@apply hover:transform hover:scale-[1.02] hover:shadow-xl;
}

.fade-slide-in {
	@apply animate-in slide-in-from-left-4 fade-in duration-300;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
	@apply transition-all duration-300 ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
	@apply opacity-0;
}

.fade-slide-in-enter-active,
.fade-slide-in-leave-active {
	@apply transition-all duration-300 ease-in-out;
}

.fade-slide-in-enter-from {
	@apply opacity-0 translate-x-4;
}

.fade-slide-in-leave-to {
	@apply opacity-0 -translate-x-4;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
	width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
	background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
	@apply bg-base-content/20 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	@apply bg-base-content/30;
}
</style>
