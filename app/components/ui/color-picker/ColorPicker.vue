<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })" :data-disabled="disabled ? true : undefined">
    <div :class="ui.picker({ class: props.ui?.picker })">
      <div ref="selectorRef" :class="ui.selector({ class: props.ui?.selector })" :style="selectorStyle">
        <div :class="ui.selectorBackground({ class: props.ui?.selectorBackground })" data-color-picker-background>
          <div
            ref="selectorThumbRef"
            :class="ui.selectorThumb({ class: props.ui?.selectorThumb })"
            :style="selectorThumbStyle"
            :data-disabled="disabled ? true : undefined"
          ></div>
        </div>
      </div>
      <div ref="trackRef" :class="ui.track({ class: props.ui?.track })" data-color-picker-track>
        <div
          ref="trackThumbRef"
          :class="ui.trackThumb({ class: props.ui?.trackThumb })"
          :style="trackThumbStyle"
          :data-disabled="disabled ? true : undefined"
        ></div>
      </div>
    </div>
  </Primitive>
</template>

<script lang="ts">
import type { HTMLAttributes } from "vue";
import { ColorTranslator, type HSLObject } from "colortranslator";
import { tv, type VariantProps } from "tailwind-variants";

const colorPicker = tv({
  slots: {
    root: "data-[disabled]:opacity-75",
    picker: "flex gap-4",
    selector: "rounded-md touch-none",
    selectorBackground: "w-full h-full relative rounded-md",
    selectorThumb: "-translate-y-1/2 -translate-x-1/2 absolute size-4 ring-2 ring-(--color-white) rounded-full cursor-pointer data-[disabled]:cursor-not-allowed",
    track: "w-[8px] relative rounded-md touch-none",
    trackThumb: "absolute transform -translate-y-1/2 -translate-x-[4px] rtl:translate-x-[4px] size-4 rounded-full ring-2 ring-(--color-white) cursor-pointer data-[disabled]:cursor-not-allowed",
  },
  variants: {
    size: {
      xs: {
        selector: "w-38 h-38",
        track: "h-38",
      },
      sm: {
        selector: "w-40 h-40",
        track: "h-40",
      },
      md: {
        selector: "w-42 h-42",
        track: "h-42",
      },
      lg: {
        selector: "w-44 h-44",
        track: "h-44",
      },
      xl: {
        selector: "w-46 h-46",
        track: "h-46",
      },
    },
  },
  compoundVariants: [],
  defaultVariants: {
    size: "md",
  },
});

type ColorPicker = VariantProps<typeof colorPicker>;

export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

export function HSLtoHSV(hsl: HSLObject): HSVColor {
  const x = hsl.S * (hsl.L < 50 ? hsl.L : 100 - hsl.L);
  const v = hsl.L + x / 100;

  return {
    h: hsl.H,
    s: hsl.L === 0 ? hsl.S : (2 * x) / v,
    v,
  };
}

export function HSVtoHSL(hsv: HSVColor): HSLObject {
  const x = ((200 - hsv.s) * hsv.v) / 100;

  return {
    H: hsv.h,
    S: x === 0 || x === 200 ? 0 : Math.round((hsv.s * hsv.v) / (x <= 100 ? x : 200 - x)),
    L: x / 2,
  };
}

export interface ColorPickerProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */

  as?: any;
  /**
   * Throttle time in ms for the color picker
   */
  throttle?: number;
  /**
   * Disable the color picker
   */
  disabled?: boolean;
  /**
   * The default value of the color picker
   */
  defaultValue?: string;
  /**
   * Format of the color
   * @defaultValue 'hex'
   */
  format?: "hex" | "rgb" | "hsl" | "cmyk" | "lab";
  /**
   * @defaultValue 'md'
   */
  size?: ColorPicker["size"];

  class?: HTMLAttributes["class"];
  ui?: Partial<typeof colorPicker.slots>;
}
</script>

<script setup lang="ts">
import { useElementBounding, useEventListener, watchPausable, watchThrottled } from "@vueuse/core";
import { isClient } from "@vueuse/shared";
import { Primitive } from "reka-ui";
import { computed, nextTick, ref, toValue } from "vue";

const props = withDefaults(defineProps<ColorPickerProps>(), {
  format: "hex",
  throttle: 50,
  defaultValue: "#FFFFFF",
});
const modelValue = defineModel<string>(undefined);

const ui = computed(() =>
  colorPicker({
    size: props.size,
  }),
);

const pickedColor = computed<HSVColor>({
  get() {
    try {
      const color = new ColorTranslator(modelValue.value || props.defaultValue);

      return HSLtoHSV(color.HSLObject);
    }
    catch {
      return { h: 0, s: 0, v: 100 };
    }
  },
  set(value) {
    const color = new ColorTranslator(HSVtoHSL(value), {
      labUnit: "percent",
      cmykUnit: "percent",
      cmykFunction: "cmyk",
    });

    switch (props.format) {
      case "rgb":
        modelValue.value = color.RGB;
        break;
      case "hsl":
        modelValue.value = color.HSL;
        break;
      case "cmyk":
        modelValue.value = color.CMYK;
        break;
      case "lab":
        modelValue.value = color.CIELab;
        break;
      case "hex":
      default:
        modelValue.value = color.HEX;
    }
  },
});

function useColorDraggable(
  targetElement: MaybeRefOrGetter<HTMLElement | null>,
  containerElement: MaybeRefOrGetter<HTMLElement | null>,
  axis: "x" | "y" | "both" = "both",
  initialPosition = { x: 0, y: 0 },
  disabled?: MaybeRefOrGetter<boolean | undefined>,
) {
  const position = ref<{ x: number; y: number }>(initialPosition);
  const pressedDelta = ref<{ x: number; y: number }>();
  const targetRect = useElementBounding(targetElement);
  const containerRect = useElementBounding(containerElement);

  function start(event: PointerEvent) {
    if (toValue(disabled))
      return event.preventDefault();

    const container = toValue(containerElement);

    pressedDelta.value = {
      x: event.clientX - (container ? event.clientX - containerRect.left.value + container.scrollLeft : targetRect.left.value),
      y: event.clientY - (container ? event.clientY - containerRect.top.value + container.scrollTop : targetRect.top.value),
    };

    move(event);
  }

  function move(event: PointerEvent) {
    if (!pressedDelta.value)
      return;

    const container = toValue(containerElement);
    let { x, y } = position.value;

    if (container && (axis === "x" || axis === "both")) {
      x = Math.min(Math.max(0, ((event.clientX - pressedDelta.value.x) / container.scrollWidth) * 100), 100);
    }

    if (container && (axis === "y" || axis === "both")) {
      y = Math.min(Math.max(0, ((event.clientY - pressedDelta.value.y) / container.scrollHeight) * 100), 100);
    }

    position.value = { x, y };
  }

  function end() {
    if (!pressedDelta.value) {
      return;
    }

    pressedDelta.value = undefined;
  }

  if (isClient) {
    useEventListener(containerElement, "pointerdown", start);
    useEventListener(window, "pointermove", move);
    useEventListener(window, "pointerup", end);
  }

  return {
    position,
  };
}

function normalizeHue(hue: number, dir: "left" | "right" = "left"): number {
  if (dir === "right") {
    return (hue * 100) / 360;
  }

  return (hue / 100) * 360;
}

function normalizeBrightness(brightness: number): number {
  return 100 - brightness;
}

const selectorRef = ref<HTMLDivElement | null>(null);
const selectorThumbRef = ref<HTMLDivElement | null>(null);
const trackRef = ref<HTMLDivElement | null>(null);
const trackThumbRef = ref<HTMLDivElement | null>(null);

const disabled = computed(() => props.disabled);

const { position: selectorThumbPosition } = useColorDraggable(
  selectorThumbRef,
  selectorRef,
  "both",
  {
    x: pickedColor.value.s,
    y: normalizeBrightness(pickedColor.value.v),
  },
  disabled,
);

const { position: trackThumbPosition } = useColorDraggable(
  trackThumbRef,
  trackRef,
  "y",
  {
    x: 0,
    y: normalizeHue(pickedColor.value.h, "right"),
  },
  disabled,
);

const { pause: pauseWatchColor, resume: resumeWatchColor } = watchPausable(pickedColor, (hsb) => {
  selectorThumbPosition.value = {
    x: hsb.s,
    y: normalizeBrightness(hsb.v),
  };
  trackThumbPosition.value = {
    x: 0,
    y: normalizeHue(hsb.h, "right"),
  };
});

watchThrottled(
  [selectorThumbPosition, trackThumbPosition],
  () => {
    pauseWatchColor();

    pickedColor.value = {
      h: normalizeHue(trackThumbPosition.value.y),
      s: selectorThumbPosition.value.x,
      v: normalizeBrightness(selectorThumbPosition.value.y),
    };

    nextTick(resumeWatchColor);
  },
  { throttle: () => props.throttle },
);

const trackThumbColor = computed(
  () =>
    new ColorTranslator(
      HSVtoHSL({
        h: normalizeHue(trackThumbPosition.value.y),
        s: 100,
        v: 100,
      }),
    ).HEX,
);

const selectorStyle = computed(() => ({
  backgroundColor: trackThumbColor.value,
}));

const selectorThumbStyle = computed(() => ({
  backgroundColor: new ColorTranslator(modelValue.value || props.defaultValue).HEX,
  left: `${selectorThumbPosition.value.x}%`,
  top: `${selectorThumbPosition.value.y}%`,
}));

const trackThumbStyle = computed(() => ({
  backgroundColor: trackThumbColor.value,
  top: `${trackThumbPosition.value.y}%`,
}));
</script>

<style scoped>
[data-color-picker-background] {
	background-image: linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(to right, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

[data-color-picker-track] {
	background-image: linear-gradient(0deg, red 0, #f0f 17%, #00f 33%, #0ff 50%, #0f0 67%, #ff0 83%, red);
}
</style>
