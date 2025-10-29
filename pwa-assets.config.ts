/**
 * PWA Assets Generator configuration file
 * See: https://vite-pwa-org.netlify.app/assets-generator/
 */

import {
  combinePresetAndAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset:
    combinePresetAndAppleSplashScreens({
      ...minimal2023Preset,
      transparent: {
        sizes: [36, 48, 72, 96, 144, 192, 256, 384, 512],
        favicons: [
          [16, "favicon-16x16.png"],
          [32, "favicon-32x32.png"],
          [194, "favicon-194x194.png"],
        ],
      },
      maskable: {
        sizes: [512],
      },
      apple: {
        sizes: [57, 60, 72, 76, 114, 120, 144, 152, 180],
      },
      assetName: (type, size) => {
        switch (type) {
          case "transparent":
            return `android-chrome-${size.width}x${size.height}.png`;
          case "maskable":
            return "maskable_icon.png";
          case "apple":
            return `apple-touch-icon-${size.width}x${size.height}.png`;
        }
      },
    }, {
      darkImageResolver: (image) => {
        return image;
      },
      padding: 0.3,
      darkResizeOptions: { background: "#050505", fit: "contain" },
      resizeOptions: {
        background: "white",
        fit: "contain",
      },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        basePath: "/icons/",
        xhtml: false,
      },
      png: {
        compressionLevel: 9,
        quality: 85,
      },
      name: (landscape, size, _dark) => {
        return `apple-splash-${landscape ? "landscape" : "portrait"}-${size.width}x${size.height}.png`;
      },
    }, [
      // iPhone devices
      "iPhone 14 Pro Max",
      "iPhone 14 Pro",
      "iPhone 14 Plus",
      "iPhone 14",
      "iPhone 13 Pro Max",
      "iPhone 13 Pro",
      "iPhone 13",
      "iPhone 13 mini",
      "iPhone 12 Pro Max",
      "iPhone 12 Pro",
      "iPhone 12",
      "iPhone 12 mini",
      "iPhone 11 Pro Max",
      "iPhone 11 Pro",
      "iPhone 11",
      "iPhone XS Max",
      "iPhone XS",
      "iPhone XR",
      "iPhone X",
      "iPhone 8 Plus",
      "iPhone 8",
      "iPhone 7 Plus",
      "iPhone 7",
      "iPhone 6s Plus",
      "iPhone 6s",
      "iPhone 6 Plus",
      "iPhone 6",
      // iPad devices
      "iPad Pro 12.9\"",
      "iPad Pro 11\"",
      "iPad Pro 10.5\"",
      "iPad Pro 9.7\"",
      "iPad Air 10.9\"",
      "iPad Air 9.7\"",
      "iPad 10.2\"",
      "iPad 9.7\"",
      "iPad mini 8.3\"",
      "iPad mini 7.9\"",
    ]),
  images: ["public/icons/logo.svg"],
});
