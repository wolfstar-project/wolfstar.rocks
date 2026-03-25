---
title: Interactivity API | Browser Mode
---

# Interactivity API

Vitest implements a subset of `@testing-library/user-event` APIs using Chrome DevTools Protocol or webdriver instead of faking events which makes the browser behaviour more reliable and consistent with how users interact with a page.

```ts
import { userEvent } from 'vitest/browser'

await userEvent.click(document.querySelector('.button'))
```

Almost every `userEvent` method inherits its provider options.

## userEvent.setup

```ts
function setup(): UserEvent
```

Creates a new user event instance. This is useful if you need to keep the state of keyboard to press and release buttons correctly.

::: warning
Unlike `@testing-library/user-event`, the default `userEvent` instance from `vitest/browser` is created once, not every time its methods are called! You can see the difference in how it works in this snippet:

```ts
import { userEvent as vitestUserEvent } from 'vitest/browser'
import { userEvent as originalUserEvent } from '@testing-library/user-event'

await vitestUserEvent.keyboard('{Shift}') // press shift without releasing
await vitestUserEvent.keyboard('{/Shift}') // releases shift

await originalUserEvent.keyboard('{Shift}') // press shift without releasing
await originalUserEvent.keyboard('{/Shift}') // DID NOT release shift because the state is different
```

This behaviour is more useful because we do not emulate the keyboard, we actually press the Shift, so keeping the original behaviour would cause unexpected issues when typing in the field.
:::

## userEvent.click

```ts
function click(
  element: Element | Locator,
  options?: UserEventClickOptions,
): Promise<void>
```

Click on an element. Inherits provider's options. Please refer to your provider's documentation for detailed explanation about how this method works.

```ts
import { page, userEvent } from 'vitest/browser'

test('clicks on an element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.click(logo)
  // or you can access it directly on the locator
  await logo.click()

  // With WebdriverIO, this uses either ElementClick (with no arguments) or
  // actions (with arguments). Use an empty object to force the use of actions.
  await logo.click({})
})
```

### Clicking with a modifier

With either WebdriverIO or Playwright:

```ts
await userEvent.keyboard('{Shift>}')
// By using an empty object as the option, this opts in to using a chain of actions
// instead of an ElementClick in webdriver.
// Firefox has a bug that makes this necessary.
// Follow https://bugzilla.mozilla.org/show_bug.cgi?id=1456642 to know when this
// will be fixed.
await userEvent.click(element, {})
await userEvent.keyboard('{/Shift}')
```

With Playwright:
```ts
await userEvent.click(element, { modifiers: ['Shift'] })
```

References:

- Playwright `locator.click` API
- WebdriverIO `element.click` API
- testing-library `click` API

## userEvent.dblClick

```ts
function dblClick(
  element: Element | Locator,
  options?: UserEventDoubleClickOptions,
): Promise<void>
```

Triggers a double click event on an element.

Please refer to your provider's documentation for detailed explanation about how this method works.

```ts
import { page, userEvent } from 'vitest/browser'

test('triggers a double click on an element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.dblClick(logo)
  // or you can access it directly on the locator
  await logo.dblClick()
})
```

References:

- Playwright `locator.dblclick` API
- WebdriverIO `element.doubleClick` API
- testing-library `dblClick` API

## userEvent.tripleClick

```ts
function tripleClick(
  element: Element | Locator,
  options?: UserEventTripleClickOptions,
): Promise<void>
```

Triggers a triple click event on an element. Since there is no `tripleclick` in browser api, this method will fire three click events in a row, and so you must check click event detail to filter the event: `evt.detail === 3`.

Please refer to your provider's documentation for detailed explanation about how this method works.

```ts
import { page, userEvent } from 'vitest/browser'

test('triggers a triple click on an element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })
  let tripleClickFired = false
  logo.addEventListener('click', (evt) => {
    if (evt.detail === 3) {
      tripleClickFired = true
    }
  })

  await userEvent.tripleClick(logo)
  // or you can access it directly on the locator
  await logo.tripleClick()

  expect(tripleClickFired).toBe(true)
})
```

References:

- Playwright `locator.click` API: implemented via `click` with `clickCount: 3` .
- WebdriverIO `browser.action` API: implemented via actions api with `move` plus three `down + up + pause` events in a row
- testing-library `tripleClick` API

## userEvent.wheel <Version>4.1.0</Version> {#userevent-wheel}

```ts
function wheel(
  element: Element | Locator,
  options: UserEventWheelOptions,
): Promise<void>
```

Triggers a `wheel` event on an element.

You can specify the scroll amount using either `delta` for precise pixel-based control, or `direction` for simpler directional scrolling (`up`, `down`, `left`, `right`). When you need to trigger multiple wheel events, use the `times` option rather than calling the method multiple times for better performance.

```ts
import { page, userEvent } from 'vitest/browser'

test('scroll using delta values', async () => {
  const tablist = page.getByRole('tablist')

  // Scroll right by 100 pixels
  await userEvent.wheel(tablist, { delta: { x: 100 } })

  // Scroll down by 50 pixels
  await userEvent.wheel(tablist, { delta: { y: 50 } })

  // Scroll diagonally 2 times
  await userEvent.wheel(tablist, { delta: { x: 50, y: 100 }, times: 2 })
})

test('scroll using direction', async () => {
  const tablist = page.getByRole('tablist')

  // Scroll right 5 times
  await userEvent.wheel(tablist, { direction: 'right', times: 5 })

  // Scroll left once
  await userEvent.wheel(tablist, { direction: 'left' })
})
```

Wheel events can also be triggered directly from [locators](/api/browser/locators#wheel):

```ts
import { page } from 'vitest/browser'

await page.getByRole('tablist').wheel({ direction: 'right' })
```

::: warning
This method is intended for testing UI that explicitly listens to `wheel` events (e.g., custom zoom controls, horizontal tab scrolling, canvas interactions). If you need to scroll the page to bring an element into view, rely on the built-in automatic scrolling functionality provided by other `userEvent` methods or [locator actions](/api/browser/locators#methods) instead.
:::

## userEvent.fill

```ts
function fill(
  element: Element | Locator,
  text: string,
): Promise<void>
```

Set a value to the `input`/`textarea`/`contenteditable` field. This will remove any existing text in the input before setting the new value.

```ts
import { page, userEvent } from 'vitest/browser'

test('update input', async () => {
  const input = page.getByRole('input')

  await userEvent.fill(input, 'foo') // input.value == foo
  await userEvent.fill(input, '{{a[[') // input.value == {{a[[
  await userEvent.fill(input, '{Shift}') // input.value == {Shift}

  // or you can access it directly on the locator
  await input.fill('foo') // input.value == foo
})
```

This methods focuses the element, fills it and triggers an `input` event after filling. You can use an empty string to clear the field.

::: tip
This API is faster than using [`userEvent.type`](#userevent-type) or [`userEvent.keyboard`](#userevent-keyboard), but it **doesn't support** user-event `keyboard` syntax (e.g., `{Shift}{selectall}`).

We recommend using this API over [`userEvent.type`](#userevent-type) in situations when you don't need to enter special characters or have granular control over keypress events.
:::

References:

- Playwright `locator.fill` API
- WebdriverIO `element.setValue` API
- testing-library `type` API

## userEvent.keyboard

```ts
function keyboard(text: string): Promise<void>
```

The `userEvent.keyboard` allows you to trigger keyboard strokes. If any input has a focus, it will type characters into that input. Otherwise, it will trigger keyboard events on the currently focused element (`document.body` if there are no focused elements).

This API supports user-event `keyboard` syntax.

```ts
import { userEvent } from 'vitest/browser'

test('trigger keystrokes', async () => {
  await userEvent.keyboard('foo') // translates to: f, o, o
  await userEvent.keyboard('{{a[[') // translates to: {, a, [
  await userEvent.keyboard('{Shift}{f}{o}{o}') // translates to: Shift, f, o, o
  await userEvent.keyboard('{a>5}') // press a without releasing it and trigger 5 keydown
  await userEvent.keyboard('{a>5/}') // press a for 5 keydown and then release it
})
```

References:

- Playwright `Keyboard` API
- WebdriverIO `action('key')` API
- testing-library `type` API

## userEvent.tab

```ts
function tab(options?: UserEventTabOptions): Promise<void>
```

Sends a `Tab` key event. This is a shorthand for `userEvent.keyboard('{tab}')`.

```ts
import { page, userEvent } from 'vitest/browser'

test('tab works', async () => {
  const [input1, input2] = page.getByRole('input').elements()

  expect(input1).toHaveFocus()

  await userEvent.tab()

  expect(input2).toHaveFocus()

  await userEvent.tab({ shift: true })

  expect(input1).toHaveFocus()
})
```

References:

- Playwright `Keyboard` API
- WebdriverIO `action('key')` API
- testing-library `tab` API

## userEvent.type

```ts
function type(
  element: Element | Locator,
  text: string,
  options?: UserEventTypeOptions,
): Promise<void>
```

::: warning
If you don't rely on special characters (e.g., `{shift}` or `{selectall}`), it is recommended to use [`userEvent.fill`](#userevent-fill) instead for better performance.
:::

The `type` method implements `@testing-library/user-event`'s `type` utility built on top of `keyboard` API.

This function allows you to type characters into an `input`/`textarea`/`contenteditable` element. It supports user-event `keyboard` syntax.

If you just need to press characters without an input, use [`userEvent.keyboard`](#userevent-keyboard) API.

```ts
import { page, userEvent } from 'vitest/browser'

test('update input', async () => {
  const input = page.getByRole('input')

  await userEvent.type(input, 'foo') // input.value == foo
  await userEvent.type(input, '{{a[[') // input.value == foo{a[
  await userEvent.type(input, '{Shift}') // input.value == foo{a[
})
```

::: info
Vitest doesn't expose `.type` method on the locator like `input.type` because it exists only for compatibility with the `userEvent` library. Consider using `.fill` instead as it is faster.
:::

References:

- Playwright `locator.press` API
- WebdriverIO `action('key')` API
- testing-library `type` API

## userEvent.clear

```ts
function clear(element: Element | Locator, options?: UserEventClearOptions): Promise<void>
```

This method clears the input element content.

```ts
import { page, userEvent } from 'vitest/browser'

test('clears input', async () => {
  const input = page.getByRole('input')

  await userEvent.fill(input, 'foo')
  expect(input).toHaveValue('foo')

  await userEvent.clear(input)
  // or you can access it directly on the locator
  await input.clear()

  expect(input).toHaveValue('')
})
```

References:

- Playwright `locator.clear` API
- WebdriverIO `element.clearValue` API
- testing-library `clear` API

## userEvent.selectOptions

```ts
function selectOptions(
  element: Element | Locator,
  values:
    | HTMLElement
    | HTMLElement[]
    | Locator
    | Locator[]
    | string
    | string[],
  options?: UserEventSelectOptions,
): Promise<void>
```

The `userEvent.selectOptions` allows selecting a value in a `<select>` element.

::: warning
If select element doesn't have `multiple` attribute, Vitest will select only the first element in the array.

Unlike `@testing-library`, Vitest doesn't support listbox at the moment, but we plan to add support for it in the future.
:::

```ts
import { page, userEvent } from 'vitest/browser'

test('clears input', async () => {
  const select = page.getByRole('select')

  await userEvent.selectOptions(select, 'Option 1')
  // or you can access it directly on the locator
  await select.selectOptions('Option 1')

  expect(select).toHaveValue('option-1')

  await userEvent.selectOptions(select, 'option-1')
  expect(select).toHaveValue('option-1')

  await userEvent.selectOptions(select, [
    page.getByRole('option', { name: 'Option 1' }),
    page.getByRole('option', { name: 'Option 2' }),
  ])
  expect(select).toHaveValue(['option-1', 'option-2'])
})
```

::: warning
`webdriverio` provider doesn't support selecting multiple elements because it doesn't provide API to do so.
:::

References:

- Playwright `locator.selectOption` API
- WebdriverIO `element.selectByIndex` API
- testing-library `selectOptions` API

## userEvent.hover

```ts
function hover(
  element: Element | Locator,
  options?: UserEventHoverOptions,
): Promise<void>
```

This method moves the cursor position to the selected element. Please refer to your provider's documentation for detailed explanation about how this method works.

::: warning
If you are using `webdriverio` provider, the cursor will move to the center of the element by default.

If you are using `playwright` provider, the cursor moves to "some" visible point of the element.
:::

```ts
import { page, userEvent } from 'vitest/browser'

test('hovers logo element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.hover(logo)
  // or you can access it directly on the locator
  await logo.hover()
})
```

References:

- Playwright `locator.hover` API
- WebdriverIO `element.moveTo` API
- testing-library `hover` API

## userEvent.unhover

```ts
function unhover(
  element: Element | Locator,
  options?: UserEventHoverOptions,
): Promise<void>
```

This works the same as [`userEvent.hover`](#userevent-hover), but moves the cursor to the `document.body` element instead.

::: warning
By default, the cursor position is in "some" visible place (in `playwright` provider) or in the center (in `webdriverio` provider) of the body element, so if the currently hovered element is already in the same position, this method will have no effect.
:::

```ts
import { page, userEvent } from 'vitest/browser'

test('unhover logo element', async () => {
  const logo = page.getByRole('img', { name: /logo/ })

  await userEvent.unhover(logo)
  // or you can access it directly on the locator
  await logo.unhover()
})
```

References:

- Playwright `locator.hover` API
- WebdriverIO `element.moveTo` API
- testing-library `hover` API

## userEvent.upload

```ts
function upload(
  element: Element | Locator,
  files: string[] | string | File[] | File,
  options?: UserEventUploadOptions,
): Promise<void>
```

Change a file input element to have the specified files.

```ts
import { page, userEvent } from 'vitest/browser'

test('can upload a file', async () => {
  const input = page.getByRole('button', { name: /Upload files/ })

  const file = new File(['file'], 'file.png', { type: 'image/png' })

  await userEvent.upload(input, file)
  // or you can access it directly on the locator
  await input.upload(file)

  // you can also use file paths relative to the root of the project
  await userEvent.upload(input, './fixtures/file.png')
})
```

::: warning
`webdriverio` provider supports this command only in `chrome` and `edge` browsers. It also only supports string types at the moment.
:::

References:

- Playwright `locator.setInputFiles` API
- WebdriverIO `browser.uploadFile` API
- testing-library `upload` API

## userEvent.dragAndDrop

```ts
function dragAndDrop(
  source: Element | Locator,
  target: Element | Locator,
  options?: UserEventDragAndDropOptions,
): Promise<void>
```

Drags the source element on top of the target element. Don't forget that the `source` element has to have the `draggable` attribute set to `true`.

```ts
import { page, userEvent } from 'vitest/browser'

test('drag and drop works', async () => {
  const source = page.getByRole('img', { name: /logo/ })
  const target = page.getByTestId('logo-target')

  await userEvent.dragAndDrop(source, target)
  // or you can access it directly on the locator
  await source.dropTo(target)

  await expect.element(target).toHaveTextContent('Logo is processed')
})
```

::: warning
This API is not supported by the default `preview` provider.
:::

References:

- Playwright `frame.dragAndDrop` API
- WebdriverIO `element.dragAndDrop` API

## userEvent.copy

```ts
function copy(): Promise<void>
```

Copy the selected text to the clipboard.

```js
import { page, userEvent } from 'vitest/browser'

test('copy and paste', async () => {
  // write to 'source'
  await userEvent.click(page.getByPlaceholder('source'))
  await userEvent.keyboard('hello')

  // select and copy 'source'
  await userEvent.dblClick(page.getByPlaceholder('source'))
  await userEvent.copy()

  // paste to 'target'
  await userEvent.click(page.getByPlaceholder('target'))
  await userEvent.paste()

  await expect.element(page.getByPlaceholder('source')).toHaveTextContent('hello')
  await expect.element(page.getByPlaceholder('target')).toHaveTextContent('hello')
})
```

References:

- testing-library `copy` API

## userEvent.cut

```ts
function cut(): Promise<void>
```

Cut the selected text to the clipboard.

```js
import { page, userEvent } from 'vitest/browser'

test('copy and paste', async () => {
  // write to 'source'
  await userEvent.click(page.getByPlaceholder('source'))
  await userEvent.keyboard('hello')

  // select and cut 'source'
  await userEvent.dblClick(page.getByPlaceholder('source'))
  await userEvent.cut()

  // paste to 'target'
  await userEvent.click(page.getByPlaceholder('target'))
  await userEvent.paste()

  await expect.element(page.getByPlaceholder('source')).toHaveTextContent('')
  await expect.element(page.getByPlaceholder('target')).toHaveTextContent('hello')
})
```

References:

- testing-library `cut` API

## userEvent.paste

```ts
function paste(): Promise<void>
```

Paste the text from the clipboard. See [`userEvent.copy`](#userevent-copy) and [`userEvent.cut`](#userevent-cut) for usage examples.

References:

- testing-library `paste` API
