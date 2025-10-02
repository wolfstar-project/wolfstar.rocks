<template>
  <div
    class="w-full h-full flex justify-between relative"
    :class="[
      colorMode === 'light' ? ['bg-white', 'text-gray-900'] : ['bg-[#212121]', 'text-white'],
    ]"
  >
    <!-- Background gradient overlay -->
    <div
      v-if="!useCustomBackground"
      class="flex absolute top-0 right-[-50%]"
      :style="{
        width: '150%',
        height: '150%',
        backgroundImage: `radial-gradient(circle, rgba(${themeRgb}, 0.4) 0%, ${colorMode === 'dark' ? 'rgba(5, 5, 5, 0.2)' : 'rgba(255, 255, 255, 0.6)'} 50%, ${colorMode === 'dark' ? 'rgba(5, 5, 5, 0)' : 'rgba(255, 255, 255, 0)'} 70%)`,
      }"
    ></div>

    <!-- Custom SVG background with brand colors -->
    <svg
      v-if="useCustomBackground"
      class="absolute top-0 right-0"
      width="1200"
      height="675"
      viewBox="0 0 1200 675"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g style="mix-blend-mode:overlay" :opacity="colorMode === 'dark' ? '0.7' : '0.5'" filter="url(#filter0_f_448_25)">
        <circle cx="901.5" cy="45.5" r="199.5" :fill="gradientColors.primary" />
        <circle cx="600.5" cy="216.5" r="199.5" :fill="gradientColors.secondary" />
        <circle cx="179.5" cy="317.5" r="199.5" :fill="gradientColors.tertiary" />
      </g>
      <defs>
        <filter id="filter0_f_448_25" x="-240" y="-374" width="1561" height="1111" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="110" result="effect1_foregroundBlur_448_25" />
        </filter>
      </defs>
    </svg>

    <div class="h-full w-full flex flex-col justify-between relative p-[60px]">
      <!-- Main content area -->
      <div class="flex flex-row justify-between items-start flex-1">
        <div
          class="flex flex-col w-full"
          :class="hasIcon ? 'max-w-[65%]' : 'max-w-[85%]'"
        >
          <!-- Headline -->
          <p
            v-if="
              headline"
            class="uppercase text-[24px] mb-4 font-semibold"
            :style="{ color: brandColors.accent }"
          >
            {{ headline }}
          </p>

          <!-- Title -->
          <h1
            class="m-0 font-bold mb-[30px] text-[75px] leading-tight"
            style="display: block; text-overflow: ellipsis;"
            :style="{ lineClamp: description ? 2 : 3 }"
          >
            {{ title?.slice(0, 60) }}
          </h1>

          <!-- Description -->
          <p
            v-if="description"
            class="text-[32px] leading-tight"
            :class="[
              colorMode === 'light' ? 'text-gray-700' : 'text-[#E4E4E7]',
            ]"
            style="
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 3;
              line-clamp: 3;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            {{ description }}
          </p>
        </div>

        <div v-if="hasIcon" class="w-[30%] flex items-center">
          <component
            :is="IconComponent"
            :name="icon"
            size="200px"
            class="opacity-80"
            style="filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));"
          />
        </div>
      </div>

      <div class="flex flex-row items-center justify-between mt-8">
        <div class="flex items-center">
          <p
            v-if="siteName"
            class="text-[28px] font-bold"
            :class="[
              colorMode === 'light' ? 'text-gray-800' : 'text-white'
            ]"
          >
            {{ siteName }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export interface OGImageProps {
  // Content props
  title?: string;
  description?: string;
  headline?: string;

  // Appearance props
  colorMode?: "dark" | "light";
  theme?: string;
  useCustomBackground?: boolean;

  // Site branding props
  siteName?: string;
  siteLogo?: string;
  icon?: string;

}
</script>

<script setup lang="ts">
/**
 * @credits Nuxt SEO <https://nuxtseo.com/> and Pergel <https://nuxtlabs.com/>
 */
import { computed, defineComponent, h, resolveComponent } from "vue";

const { theme = "", title = "", description, headline = "", colorMode = "dark", useCustomBackground = true, icon = "custom:wolfstar" } = defineProps<OGImageProps>();

const hasIcon = computed(() => typeof icon === "string" && icon.trim().length > 0);

const HexRegex = /^#(?:[0-9a-f]{3}){1,2}$/i;

// WolfStar brand colors - Black and Red
const brandColors = computed(() => {
  return {
    primary: BrandingColors.Primary,
    accent: "#FF0000",
    iconFill: "url(#paint1_diamond_563_6)",
  };
});

// Theme color processing with brand defaults
const themeHex = computed(() => {
  // Use WolfStar brand color if no custom theme provided
  if (!theme) {
    return brandColors.value.accent; // Use red as default
  }

  // regex test if valid hex
  if (HexRegex.test(theme))
    return theme;

  // if it's hex without the hash, just add the hash
  if (HexRegex.test(`#${theme}`))
    return `#${theme}`;

  // if it's rgb or rgba, we convert it to hex
  if (theme.toLowerCase().startsWith("rgb")) {
    const rawValues = theme.substring(theme.indexOf("(") + 1, theme.lastIndexOf(")")).split(",");

    const channels = rawValues.slice(0, 3).map(v => {
      const trimmed = v.trim();
      if (trimmed.endsWith("%")) {
        return Math.round(Number.parseFloat(trimmed.slice(0, -1)) * 2.55);
      }
      return Number.parseInt(trimmed, 10);
    });

    if (channels.length < 3 || channels.some(v => Number.isNaN(v))) {
      return brandColors.value.accent;
    }

    const hex = channels.map(v => {
      const clamped = Math.max(0, Math.min(255, v));
      const hexValue = clamped.toString(16);
      return hexValue.length === 1 ? `0${hexValue}` : hexValue;
    }).join("");

    return `#${hex}`;
  }
  return brandColors.value.accent; // Use red as fallback
});

const themeRgb = computed(() => {
  const hex = themeHex.value.replace("#", "");
  const parts = hex.match(/.{1,2}/g);
  if (!parts)
    return "255, 0, 0";
  const [r, g, b] = parts.slice(0, 3).map(v => Number.parseInt(v, 16));
  return `${r}, ${g}, ${b}`;
});

// Enhanced gradient colors using brand palette
const gradientColors = computed(() => {
  return {
    primary: brandColors.value.accent, // Red
    secondary: BrandingColors.Secondary, // Light red
    tertiary: "#990000", // Dark red
  };
});

// Icon component handling
const IconComponent = computed(() => {
  // Try to resolve UIcon component, fallback to div if not available
  try {
    return resolveComponent("UIcon");
  }
  catch {
    return defineComponent({
      render() {
        return h("div", { class: "text-gray-500 text-center" }, "🎨");
      },
    });
  }
});
</script>
