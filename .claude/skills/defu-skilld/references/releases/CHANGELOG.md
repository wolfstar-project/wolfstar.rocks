# Changelog

All notable changes to this project will be documented in this file. See standard-version for commit guidelines.

## v6.1.7

compare changes

###  Fixes

- **defu.d.cts:** Export Defu types (#157)

###  Build

- Correct the `types` export entry (#160)

###  Contributors

- Jakub Michálek (@J-Michalek)
- Kricsleo (@kricsleo)

## v6.1.6

compare changes

###  Build

- Fix mixed types (407b516)

###  Contributors

- Pooya Parsa (@pi0)

## v6.1.5

compare changes

###  Fixes

- Prevent prototype pollution via `__proto__` in defaults (#156)
- Ignore inherited enumerable properties (11ba022)

###  Chore

- Add tea.yaml (70cffe5)
- Update repo (23cc432)
- Fix typecheck (89df6bb)

###  Tests

- Add more tests for plain objects (b65f603)

###  CI

- Bump node (9237d9c)

###  Contributors

- Pooya Parsa (@pi0)
- Kricsleo (@kricsleo)

## v6.1.4

compare changes

###  Fixes

- Merge objects with `Module` type (#121)

###  Refactors

- Move `isPlainObject` to `_utils` to allow testing (e922a16)
- Make `isPlainObject` logic more readable (e458b63)

###  Documentation

- Fix typo (#116)

###  Chore

- **release:** V6.1.3 (3834ca1)
- Update deps and lint (e5a48d3)
- Enable `skipLipCheck` for type tests (7c7a9a4)

###  Tests

- Improve tests for isPlainObject (b24a213)

###  Contributors

- Alexander Lichter (@manniL)
- Pooya Parsa (@pi0)
- Yu Le <is.yuler@gmail.com>

## v6.1.3

compare changes

###  Fixes

- Only merge plain objects (#111)

###  Documentation

- Update badges (581dd92)
- Fix typo (#96)
- Fix the result of the array merging (#99)
- Fix typo (#107)

###  Build

- Backward compatible cjs entry (#110)

###  Chore

- Update dependencies (63d0e8e)
- Enable ts strict mode (82d68c7)
- Fix tests (59d0f6a)

###  Styles

- Format with prettier v3 (32650f1)

###  Contributors

- Pooya Parsa (@pi0)
- Abdul Al-Hasany <info@kalimah-apps.com>
- Kricsleo
- Donald Shtjefni (@dnldsht)
- Sébastien Chopin <seb@nuxtjs.com>

## v6.1.2

compare changes

###  Fixes

- Add node16 compatible type declaration (#73)

###  Chore

- Fix renovate config (#56)
- Use changelogen to release (5e24124)

###  Styles

- Format with prettier (26477ed)

###  Contributors

- Pooya Parsa <pooya@pi0.io>
- Daniel Roe <daniel@roe.dev>
- Nozomu Ikuta <nick.0508.nick@gmail.com>

### 6.1.1 (2022-11-14)

## 6.1.0 (2022-08-16)

### Features

- export `Defu` type helper (#45) (551ae4c)

### Bug Fixes

- **types:** constrain inferred types of `Defu` (3d3ea3e)

### 6.0.1 (2022-08-16)

### Bug Fixes

- add typing to allow for non-objects input args (#42) (1f3a701)
- merge object strings of many types (#44) (c7226f9)

## 6.0.0 (2022-03-21)

###  BREAKING CHANGES

- Use named exports:

* `import defu from 'defu'` => `import { defu } from 'defu'`
* `defu.fn` => `import { defuFn }`
* `defu.arrayFn` => `import { defuArrayFn }`

- When merging input value with defaults with an array, order is reversed

### Features

- concat array defaults to the last (f6df314)
- use named exports (4a8fc52)

### Bug Fixes

- workaround for #32 (7b1f284)

### 5.0.1 (2022-01-13)

## 5.0.0 (2021-05-12)

###  BREAKING CHANGES

- `undefined` values will be bypassed and not consistent behavior with defaults-deep anymore.

### Features

- skip nullish values from source (#29) (076f10a)

### 4.0.1 (2021-04-23)

## 4.0.0 (2021-04-23)

###  BREAKING CHANGES

- module exports

### Features

- module exports (42df406)

### 3.2.2 (2020-11-10)

### Bug Fixes

- switch back to bili for es5 support till fixing in siroc (07786c2)

### 3.2.1 (2020-11-09)

### Bug Fixes

- **types:** correct type inference where merged types are same (#26) (f322607)

## 3.2.0 (2020-11-09)

### Features

- add type inference for defu result (#24) (934d736)
- pass namespace to custom merger (#25) (6bd7ef5)

## 3.1.0 (2020-08-04)

### Features

- add defu.arrayFn (#21) (df05ed0)

### 3.0.1 (2020-07-29)

### Bug Fixes

- recursively pass merger (ec09394)

## 3.0.0 (2020-07-28)

###  BREAKING CHANGES

- defau will merge arrays too (#18)

### Features

- extend and custom merger (#19) (4932232)
- merge arrays (#18) (22c631e)

### 2.0.4 (2020-05-22)

### Bug Fixes

- correct path to types (33d4bf0)

### 2.0.3 (2020-05-22)

### Bug Fixes

- specify type declaration file more precisely (#15) (6aa47d4)

### 2.0.2 (2020-04-19)

### 2.0.1 (2020-04-19)

### Docs

- Add note about `null`

## 2.0.0 (2020-04-19)

### Features

- Support passing multiple defaults (89ef702)
- Typescript rewrite (9c906e6)

<a name="1.0.0"></a>

# 1.0.0 (2020-02-02)

<a name="0.0.4"></a>

## 0.0.4 (2020-01-01)

### Bug Fixes

- improve es5 compatibility (#2, #9) (5a6de7c)

<a name="0.0.3"></a>

## 0.0.3 (2019-05-25)

<a name="0.0.2"></a>

## 0.0.2 (2019-05-25)

<a name="0.0.1"></a>

## 0.0.1 (2019-02-07)

### Bug Fixes

- imrpove non-object handlers (f89fa28)
