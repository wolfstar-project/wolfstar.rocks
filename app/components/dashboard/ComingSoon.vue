<template>
	<DashboardPageHeader :title="title" :description="description">
		<UBadge color="neutral" variant="subtle" size="lg" class="font-semibold">
			{{ ts("dashboard.coming_soon.badge") }}
		</UBadge>
	</DashboardPageHeader>

	<section class="console-card flex flex-col items-center gap-3 px-4 py-14 text-center">
		<span
			class="flex size-12 items-center justify-center rounded-lg bg-base-content/8 text-muted"
			aria-hidden="true"
		>
			<UIcon :name="item?.icon ?? 'ic:round-hourglass-empty'" class="size-6" />
		</span>
		<p class="text-base font-semibold">{{ ts("dashboard.coming_soon.title") }}</p>
		<p class="max-w-md text-[0.8125rem] leading-normal text-muted">
			{{ ts("dashboard.coming_soon.body", { name: title }) }}
		</p>
	</section>
</template>

<script setup lang="ts">
const { ts } = useI18n();
const { section } = useDashboardNavigation();

// The page describes whichever announced section is open.
const item = computed(() => findDashboardNavItem(section.value));
const title = computed(() => ts(item.value?.labelKey ?? "dashboard.coming_soon.title"));
const description = computed(() =>
	item.value?.descriptionKey ? ts(item.value.descriptionKey) : undefined,
);
</script>
