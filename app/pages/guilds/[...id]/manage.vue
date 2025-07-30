<template>
  <div class="flex h-screen bg-gradient-to-br from-base-100/95 to-base-200/90 backdrop-blur-sm">
    <!-- Sidebar Navigation -->
    <div class="glass-sidebar w-64 flex flex-col transition-glass">
      <!-- Header -->
      <div class="p-6 border-b border-base-300/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 class="font-bold text-lg">{{ guildData?.name || 'Guild Settings' }}</h1>
            <p class="text-sm text-base-content/70">Management Dashboard</p>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NuxtLink
          :to="`/guilds/${guildId}/manage`"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-glass hover-lift"
          :class="currentRoute === 'general' ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-base-300/50'"
        >
          <Icon name="heroicons:home" class="w-5 h-5" />
          <span>Dashboard</span>
        </NuxtLink>

        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
            Configuration
          </h3>

          <NuxtLink
            v-for="navItem in navigationItems.filter(item => item.route !== 'general')"
            :key="navItem.route"
            :to="`/guilds/${guildId}/manage/${navItem.route}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-glass hover-lift"
            :class="currentRoute === navItem.route ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-base-300/50'"
          >
            <Icon :name="navItem.icon" class="w-5 h-5" />
            <span>{{ navItem.label }}</span>
            <div v-if="navItem.badge" class="ml-auto">
              <div class="badge badge-sm" :class="`badge-${navItem.badge.color || 'primary'}`">
                {{ navItem.badge.text }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </nav>
    </div>

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
          <Transition name="fade" mode="out-in">
            <div v-if="hasChanges" class="flex gap-3">
              <button
                class="glass btn btn-sm transition-glass hover-lift"
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
        </div>
      </div>

      <!-- Settings Content -->
      <div class="flex-1 overflow-y-auto">
        <Transition name="fade-slide-in" mode="out-in">
          <div v-if="readyToRender" class="p-6">
            <div class="glass-card rounded-xl p-6 fade-slide-in">
              <!-- General Dashboard Content -->
              <GuildSettingsGeneral v-if="currentRoute === 'General'" :guild-data="guildData" :languages="languages" />

              <GuildSettingsModeration v-if="currentRoute === 'Moderation'" :guild-data="guildData" />
              <GuildSettingsChannel v-if="currentRoute === 'Channels'" :guild-data="guildData" />
              <GuildSettingsRole v-if="currentRoute === 'Roles'" :guild-data="guildData" />
              <GuildSettingsEvent v-if="currentRoute === 'Events'" :guild-data="guildData" />
              <GuildSettingsDisabledCommands v-if="currentRoute === 'DisabledCommands'" :guild-data="guildData" :commands="commands" />
            </div>
          </div>
          <!-- Loading State -->
          <div v-else class="flex items-center justify-center h-full">
            <div class="glass card rounded-xl p-8 text-center">
              <span class="loading loading-spinner loading-lg text-primary"></span>
              <p class="mt-4 text-base-content/70">Loading guild settings...</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "nuxt/app";
import type { GuildData } from "~~/server/database";
import { cast, isNullOrUndefined } from "@sapphire/utilities";
import { useRouteParams } from "@vueuse/router";
import { useToast } from "@/composables/useToast";
import useGuild from "~/composables/useGuildData";

const router = useRouter();
const guildId = useRouteParams("id");
const toast = useToast();

interface NavigationItem {
  route: string;
  label: string;
  icon: string;
  description: string;
  badge?: {
    text: string;
    color: string;
  };
}

// Validate Guild ID format (Discord Snowflake: 17-19 digit string)
function isValidGuildId(id: string | string[] | null): boolean {
  if (isNullOrUndefined(id) || Array.isArray(id))
    return false;
  const snowflakeRegex = /^\d{17,19}$/;
  return snowflakeRegex.test(id);
}

// Use composables and stores
const { settings, resetAllChanges, hasChanges, changes } = useGuildSettings();
const guildData = useGuild();
const languagesStore = LanguagesStore();
const commandsStore = CommandsStore();

const loading = ref(true);

// Computed values from stores
const languages = computed(() => languagesStore.languages);
const commands = computed(() => commandsStore.commands);

// Current route detection
const currentRoute = computed(() => "general");

// Navigation items for sidebar
const navigationItems = computed<NavigationItem[]>(() => [
  {
    route: "general",
    label: "General",
    icon: "heroicons:cog-6-tooth",
    badge: {
      text: "New",
      color: "primary",
    },
    description: "Basic bot settings",
  },
  {
    route: "moderation",
    label: "Moderation",
    icon: "heroicons:shield-check",
    description: "Moderation features",
  },
  {
    route: "channels",
    label: "Channels",
    icon: "heroicons:hashtag",
    description: "Channel configuration",
  },
  {
    route: "roles",
    label: "Roles",
    icon: "heroicons:user-group",
    description: "Role management",
  },
  {
    route: "events",
    label: "Events",
    icon: "heroicons:bell",
    description: "Event logging",
  },
  {
    route: "disabled-commands",
    label: "Commands",
    icon: "heroicons:command-line",
    description: "Command settings",
  },
]);

// Page title and description
const currentPageTitle = computed(() => "Dashboard");
const currentPageDescription = computed(() => "Overview of your server settings and quick actions");

// Remove fetchData and move logic inline
// Example: Place this in onMounted or setup
onMounted(async () => {
  try {
    loading.value = true;

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

    const guildSettings = await useFetch(`/api/guilds/${guildId.value}/settings`, {
      onResponseError({ response }) {
        if (response.status === 404) {
          throw createError({
            statusCode: 404,
            statusMessage: "Guild Settings Not Found",
            message: "Settings for this guild could not be found.",
          });
        }
      },
    });

    // Update settings state with the received settings
    if (guildSettings && typeof guildSettings === "object") {
      changes(guildSettings as unknown as GuildData);
    }
  }
  catch (error) {
    useLogger().error("Error fetching data:", cast<NuxtError<unknown>>(error).message);
    await handleError(cast<NuxtError<unknown>>(error));
  }
  finally {
    loading.value = false;
  }
});

async function handleError(error: NuxtError<unknown>) {
  // Handle specific error cases
  switch (error.statusCode) {
    case 400:
      toast.add({
        color: "error",
        title: "Invalid Request",
        description: error.message || "The guild ID provided is not valid.",
        actions: [{
          label: "Go Home",
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            router.push("/");
          },
        }],
      });
      break;
    case 401: {
      const auth = useAuth();
      await auth.clear();
      toast.add({
        color: "error",
        title: "Authentication Error",
        description: "Your session has expired. Please log in again.",
        actions: [{
          label: "Login",
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            router.push("/login");
          },
        }],
      });
      break;
    }
    case 403:
      toast.add({
        color: "error",
        title: "Access Denied",
        description: error.message || "You do not have permission to access this guild.",
        actions: [{
          label: "Go Home",
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            router.push("/");
          },
        }],
      });
      break;
    case 404:
      toast.add({
        color: "error",
        title: "Not Found",
        description: error.message || "The requested guild could not be found.",
        actions: [{
          label: "Go Home",
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            router.push("/");
          },
        }],
      });
      break;
    default:
      toast.add({
        color: "error",
        title: "Operation Failed",
        description: error.message || "An unexpected error occurred.",
      });
  }
}

async function submitChanges() {
  try {
    loading.value = true;

    if (!guildId.value || !isValidGuildId(guildId.value as string)) {
      throw createError({
        statusCode: 400,
        message: "Invalid guild ID",
      });
    }

    // Update settings using PATCH endpoint
    const { data } = await useFetch(`/api/guilds/${guildId.value}/settings`, {
      method: "PATCH",
      body: {
        data: Object.entries(settings.value),
      },
      onResponseError({ response }) {
        if (response.status === 404) {
          throw createError({
            statusCode: 404,
            message: "Guild settings not found",
          });
        }
        if (response.status === 400) {
          throw createError({
            statusCode: 400,
            message: "Invalid settings",
          });
        }
      },
    });

    if (!data.value) {
      throw createError({
        statusCode: 500,
        message: "Failed to update settings",
      });
    }

    resetAllChanges();
    toast.add({
      color: "success",
      icon: "heroicons:check",
      title: "Settings Updated",
      description: "Settings updated successfully",
    });
  }
  catch (error) {
    await handleError(cast<NuxtError<unknown>>(error));
  }
  finally {
    loading.value = false;
  }
}

const readyToRender = computed(
  () => !loading.value && guildData.value && settings.value && Object.keys(guildData.value).length > 0 && Object.keys(settings.value).length > 0,
);

useHead({
  title: computed(() => `${guildData.value?.name ?? "Guild"} Settings - Dashboard`),
  meta: [
    {
      name: "description",
      content: "Manage your guild settings dashboard",
    },
  ],
});
</script>

<style scoped>
@reference "@/assets/css/main.css";
/* glass-morphism utilities */
.glass-panel {
	@apply bg-base-100/80 backdrop-blur-md border border-base-300/50;
}

.glass-sidebar {
	@apply bg-base-200/70 backdrop-blur-lg border-r border-base-300/30;
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
