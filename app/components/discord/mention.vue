<template>
  <button
    class="tag"
    type="button"
    :aria-label
  >
    <span v-if="kind === 'mention'" aria-hidden="true">@</span>
    <icons-app v-else-if="kind === 'app'" class="icon" aria-hidden="true" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
/* filepath: d:\codes\wolfstar.rocks\app\components\discord\mention.vue */
const props = withDefaults(defineProps<{ kind?: "mention" | "app" }>(), {
  kind: "mention",
});

// derive readable text from the first slot vnode safely
const slots = useSlots();

const slotText = computed(() => {
  const s = slots.default?.();
  if (!s || s.length === 0)
    return "";
  const first = s[0] as any;

  // Try common vnode shapes
  const children = first?.children ?? first?.text ?? "";
  if (typeof children === "string")
    return children;
  if (Array.isArray(children)) {
    return children
      .map((c: any) => (typeof c === "string" ? c : c?.children ?? c?.text ?? ""))
      .join("");
  }
  return String(children ?? "");
});

const ariaLabel = computed(() => {
  const text = slotText.value.trim();
  return props.kind === "mention"
    ? `Mention ${text}`.trim()
    : `App command ${text}`.trim();
});

// Expose kind for template usage (keep original name)
const { kind } = toRefs(props);
</script>

<style scoped>
@reference "@/assets/css/main.css";
.tag {
	@apply gap-1 rounded-md px-1 py-0.5 font-medium;
	background-color: hsla(235, 85.6%, 64.7%, 0.5);
	color: hsl(235, 86.2%, 95%, 1);

	@media (prefers-color-scheme: light) {
		background-color: hsla(235, 85.6%, 64.7%, 0.25);
		color: hsl(235, 86.2%, 50%, 1);
	}
}

.tag > .icon {
	@apply mr-0.5 inline-block h-3 w-3 -translate-y-0.5;
}

.tag:hover,
.tag:focus-visible {
	background-color: hsl(235, 85.6%, 64.7%, 1);
	color: hsl(0, 0%, 100%, 1);
	@apply transition-colors duration-150;

	@media (prefers-color-scheme: light) {
		background-color: hsl(235, 85.6%, 55%, 1);
		color: hsl(0, 0%, 100%, 1);
	}
}
</style>
