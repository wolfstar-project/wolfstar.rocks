---
number: 8968
title: "v4: Timeout starting forks runner."
type: other
state: closed
created: 2025-11-07
url: "https://github.com/vitest-dev/vitest/issues/8968"
reactions: 18
comments: 33
labels: "[p4-important]"
---

# v4: Timeout starting forks runner.

### Describe the bug

After upgrading to Vitest 4 our test started to fail randomly with: 

> Error: [vitest-pool]: Timeout starting forks runner.

<img width="892" height="138" alt="Image" src="https://github.com/user-attachments/assets/095e08c7-fce1-4e67-bb3b-a89128fda828" />

The project is a monorepo with 25 different packages. The test are being orchestrated with `turborepo`

The failures not only happens on my local but also in our CI workflows.

The vite config in use is:

```js
{
  plugins: [
    react(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: ['@babel/plugin-syntax-jsx', ['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    vanillaExtractPlugin(),
    tsconfigPaths(),
  ],
  test: {
    bail: 3,
    logHeapUsage: true,
    include: [ '**/*.test.*' ],
    exclude: [
      '**/node_modules',
      '**/coverage',
      '**/build',
      '**/dist',
      '**/types'
    ],
    setupFiles: [ './vitest.setup.js' ],
    coverage: {
      provider: 'v8',
      clean: true,
      include: ['**/app/**/*.{js,ts,jsx,tsx}', '**/components/**/*.{js,ts,jsx,tsx}'],
      allowExternal: false,
      exclude: ['**/node_modules', '**/coverage', '**/build', '**/dist', '**/types', '**/*.css'],
    },
    environment: 'happy-dom'
  }
}
```
Everything was running fine in v3.

### Reproduction

https://github.com/lfantone/vitest-threads-error

### System Info

```shell
System:
    OS: macOS 26.0.1
    CPU: (10) arm64 Apple M1 Pro
    Memory: 1.44 GB / 32.00 GB
    Shell: 5.9 - /bin/zsh
  Binaries:
    Node: 22.21.0 - /Users/lfantone/.volta/tools/image/node/22.21.0/bin/node
    Yarn: 4.10.3 - /Users/lfantone/.volta/tools/image/yarn/3.8.3/bin/yarn
    npm: 10.9.4 - /Users/lfantone/.volta/tools/image/node/22.21.0/bin/npm
  Browsers:
    Chrome: 142.0.7444.60
    Safari: 26.0.1
```

### Used Package Manager

yarn

### Validations

...

---

## Top Comments

**@AriPerkkio** [maintainer]:

Could you also verify if this error comes up with following versions:

- `4.0.0-beta.19`
- `4.0.0-beta.18`
- `4.0.0-beta.5`
- `4.0.0-beta.4`

For example, `npm install vitest@4.0.0-beta.4`.

**@lfantone** (+1):

In my case this is failing on a Github Action workflow under the ubuntu machine. There is no Windows Defender there.

Everything works fine in Vitest@3.2.4, none of the v4 versions works for me.
`vmForks` or `vmThreads` throws another errors.

Unfortunately I cannot place the same setup as it's a private organisation , but when running without turbo I faced another kind of errors:

```bash
⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  components/atoms/table/table.test.jsx [ components/atoms/table/table.test.jsx ]
Error: "transformResult" in not defined. This is a bug in Vitest.
 ❯ components/atoms/table/table.css.ts:8:31
 ❯ components/atoms/table/table.test.jsx:4:1

...

**@lfantone** (+1):

### with `4.0.0-beta.19` `4.0.0-beta.18` `4.0.0-beta.5`

```bash
Error: Cannot read properties of undefined (reading 'startsWith')
@adg-octopus/resources:test:  ❯ reviveInvokeError ../node_modules/vite/dist/node/module-runner.js:475:14
@adg-octopus/resources:test:  ❯ Object.invoke ../node_modules/vite/dist/node/module-runner.js:491:33
@adg-octopus/resources:test:  ❯ ../node_modules/vite/dist/node/module-runner.js:1073:21
```

### with `4.0.0-beta.4``

Test are running fine