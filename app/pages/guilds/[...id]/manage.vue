<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <GuildSettingsGeneral />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useCommands } from "@/composables/useCommands";
import { useLanguages } from "@/composables/useLanguages";

definePageMeta({
  layout: "dashboard",
});

const loading = useState("loading", () => false);

const { isNotificationsSlideoverOpen } = useDashboardLayout();

// Use composables and stores

const { fetchLanguages } = useLanguages();
const { fetchCommands } = useCommands();

onMounted(async () => {
  loading.value = true;
  await fetchLanguages();

  await fetchCommands();

  loading.value = false;
});
</script>
