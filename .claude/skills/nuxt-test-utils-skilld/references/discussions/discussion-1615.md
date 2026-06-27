---
number: 1615
title: Reporter are not taken into account and it always use default reporter
category: "Q&A"
created: 2026-03-10
url: "https://github.com/nuxt/test-utils/discussions/1615"
upvotes: 1
comments: 0
answered: false
---

# Reporter are not taken into account and it always use default reporter

Config:
```

import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern'
      }
    }
  },
  esbuild: {
    target: 'esnext',
    minify: false
  },
  optimizeDeps: {
    include: ['vue', 'vuex', 'vuetify', 'axios', 'lodash', 'moment-timezone', 'vue-i18n', '@vue/test-utils'],
    exclude: ['gojs', 'vue-axios', 'highcharts', 'bpmn-js', 'socket.io-client', 'broadcast-channel']
  },
  plugins: [],
  test: {
    globals: true,
    hookTimeout: 30000,
    coverage: {
      reporter: ['html', 'cobertura']
    },
    pool: 'threads',
    environment: 'happy-dom',
    setupFiles: './unitTestUtils/test.config.js',
    server: {
      deps: {
        inline: ['vuetify']
      }
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './junit.xml'
    }
  },
  resolve: {
    alias: {
      'vue-axios': new URL('./unitTestUtils/mocks/vue-axios-mock.js', import.meta.url).pathname,
      gojs: new URL('./unitTestUtils/mocks/gojs-mock.js', import.meta.url).pathname
    }
  }
});
```...