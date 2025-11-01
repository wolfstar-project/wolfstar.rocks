# Utilities Development Instructions

## Purpose
This file provides guidance for creating and maintaining utility functions and helpers in the WolfStar Dashboard.

## Utility Files Location
All utilities are located in `src/utils/` directory.

## File Organization
```
src/utils/
├── structures/          # Complex data structures
│   └── color/          # Color-related utilities
├── wolfstarUtils.ts    # WolfStar-specific utilities
├── isBrowser.ts        # Browser detection utility
└── reactOnlyText.ts    # React text extraction utility
```

## Utility File Pattern

### Basic Utility File
```typescript
/**
 * Copyright 2019-2020 Aura Román
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Description of what this utility does
 */

// Imports
import type { SomeType } from 'some-package';

// Constants
export const CONSTANT_VALUE = 'value';

// Type definitions
export type UtilityType = {
  key: string;
  value: number;
};

/**
 * Description of the function
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 */
export function utilityFunction(param1: string, param2: number): ReturnType {
  // Implementation
  return result;
}
```

## Utility Function Guidelines

### Pure Functions
Utilities should be pure functions when possible:
- Same input always produces same output
- No side effects
- Don't modify input parameters
- Don't depend on external state

```typescript
// Good - Pure function
export function formatUsername(username: string): string {
  return `@${username.trim()}`;
}

// Bad - Impure function (modifies external state)
let counter = 0;
export function incrementCounter(): number {
  return ++counter;
}
```

### Type Safety
Always provide explicit types:

```typescript
// Good - Explicit types
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad - No types
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### JSDoc Comments
Document complex utilities with JSDoc:

```typescript
/**
 * Converts a Discord timestamp to a human-readable date string
 * @param timestamp - Discord snowflake timestamp
 * @param locale - Optional locale for formatting (defaults to 'en-US')
 * @returns Formatted date string
 * @example
 * ```ts
 * const date = formatDiscordTimestamp('123456789012345678');
 * // Returns: "January 1, 2023"
 * ```
 */
export function formatDiscordTimestamp(
  timestamp: string,
  locale: string = 'en-US'
): string {
  // Implementation
}
```

## Common Utility Patterns

### Constants and Enums
Export shared constants:

```typescript
export enum Time {
  Millisecond = 1,
  Second = 1000,
  Minute = 1000 * 60,
  Hour = 1000 * 60 * 60,
  Day = 1000 * 60 * 60 * 24,
  Year = 1000 * 60 * 60 * 24 * 365
}

export const DEFAULT_AVATAR_SIZE = 256;
export const MAX_MESSAGE_LENGTH = 2000;
```

### Type Guards
Create type guard utilities:

```typescript
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isValidGuildId(id: unknown): id is string {
  return typeof id === 'string' && /^\d{17,19}$/.test(id);
}
```

### Validation Functions
Create validation utilities:

```typescript
/**
 * Validates if a string is a valid hex color
 * @param color - Color string to validate
 * @returns True if valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validates Discord webhook URL
 * @param url - URL to validate
 * @returns True if valid webhook URL
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'discord.com' && 
           parsed.pathname.startsWith('/api/webhooks/');
  } catch {
    return false;
  }
}
```

### Formatting Utilities
Create consistent formatters:

```typescript
/**
 * Formats a number with thousand separators
 * @param value - Number to format
 * @param locale - Locale for formatting
 * @returns Formatted string
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Formats bytes to human-readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
```

### Transformation Utilities
Create data transformation utilities:

```typescript
/**
 * Converts an array to a Map keyed by a property
 * @param array - Array to convert
 * @param key - Property to use as key
 * @returns Map of items
 */
export function arrayToMap<T, K extends keyof T>(
  array: T[],
  key: K
): Map<T[K], T> {
  return new Map(array.map(item => [item[key], item]));
}

/**
 * Deep clones an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
```

### Async Utilities
Create utilities for async operations:

```typescript
/**
 * Delays execution for specified milliseconds
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError!;
}
```

## Discord-Specific Utilities

### Avatar URL Generation
```typescript
import type { RESTGetAPICurrentUserResult } from 'discord-api-types/v9';

/**
 * Gets a URL to an avatar for a user
 * @param user - The API User to get the avatar for
 * @param options - Extra options for the avatar URL
 * @returns Avatar URL
 */
export function displayAvatarURL(
  user: RESTGetAPICurrentUserResult | null | undefined,
  { format = 'default', size = 256 } = {}
) {
  if (!user) {
    return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 4) + 1}.png`;
  }
  
  if (user.avatar === null) {
    return `https://cdn.discordapp.com/embed/avatars/${user.discriminator}.png`;
  }
  
  if (format === 'default') {
    format = user.avatar.startsWith('a_') ? 'gif' : 'png';
  }
  
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=${size}`;
}
```

### Snowflake Utilities
```typescript
/**
 * Extracts timestamp from Discord snowflake
 * @param snowflake - Discord snowflake ID
 * @returns Timestamp in milliseconds
 */
export function snowflakeToTimestamp(snowflake: string): number {
  return Number(BigInt(snowflake) >> 22n) + 1420070400000;
}

/**
 * Converts snowflake to Date object
 * @param snowflake - Discord snowflake ID
 * @returns Date object
 */
export function snowflakeToDate(snowflake: string): Date {
  return new Date(snowflakeToTimestamp(snowflake));
}
```

### Permission Utilities
```typescript
/**
 * Checks if user has specific permission
 * @param permissions - User's permission bitfield
 * @param permission - Permission to check
 * @returns True if user has permission
 */
export function hasPermission(
  permissions: bigint,
  permission: bigint
): boolean {
  return (permissions & permission) === permission;
}
```

## Browser-Specific Utilities

### Browser Detection
```typescript
/**
 * Checks if code is running in browser environment
 * @returns True if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safely access localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 * @returns Stored value or default
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}
```

## React-Specific Utilities

### React Children Utilities
```typescript
import type { ReactNode } from 'react';

/**
 * Extracts text content from React children
 * @param children - React children
 * @returns Text content
 */
export function reactOnlyText(children: ReactNode): string {
  if (!children) return '';
  
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  
  if (Array.isArray(children)) {
    return children.map(reactOnlyText).join('');
  }
  
  if (typeof children === 'object' && 'props' in children) {
    return reactOnlyText(children.props.children);
  }
  
  return '';
}
```

## Error Handling Utilities

### Custom Errors
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Handlers
```typescript
/**
 * Safely extracts error message
 * @param error - Error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}
```

## URL and String Utilities

### URL Helpers
```typescript
/**
 * Builds URL with query parameters
 * @param base - Base URL
 * @param params - Query parameters
 * @returns Complete URL
 */
export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean>
): string {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}
```

### String Helpers
```typescript
/**
 * Truncates string to specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(
  str: string,
  length: number,
  suffix: string = '...'
): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Capitalizes first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

## Testing Utilities
While there's no test infrastructure, write testable utilities:

```typescript
// Testable - Pure function, no dependencies
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Hard to test - Depends on external state
let config: Config;
export function useConfig() {
  return config;
}
```

## Best Practices

### Do
- ✅ Write pure functions when possible
- ✅ Use explicit TypeScript types
- ✅ Add JSDoc comments for complex utilities
- ✅ Export constants with meaningful names
- ✅ Handle edge cases (null, undefined, empty arrays, etc.)
- ✅ Include examples in JSDoc
- ✅ Use meaningful function names
- ✅ Keep functions focused and single-purpose
- ✅ Include Apache 2.0 license header in new files

### Don't
- ❌ Use `any` type
- ❌ Modify input parameters (mutate)
- ❌ Depend on external state
- ❌ Include side effects in pure utilities
- ❌ Create overly complex utilities
- ❌ Use global variables
- ❌ Ignore error cases
- ❌ Write utilities that do too many things

## Performance Considerations

### Memoization
For expensive computations:

```typescript
const cache = new Map<string, Result>();

export function expensiveOperation(input: string): Result {
  if (cache.has(input)) {
    return cache.get(input)!;
  }
  
  const result = performExpensiveCalculation(input);
  cache.set(input, result);
  return result;
}
```

### Debounce/Throttle
```typescript
/**
 * Debounces a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

## File Naming
- Use camelCase for utility files (e.g., `wolfstarUtils.ts`)
- Use descriptive names that indicate purpose
- Group related utilities in the same file or subdirectory
- Use `.ts` extension (not `.tsx`) unless React components are exported

## Exports
```typescript
// Named exports (preferred for utilities)
export function utility1() { }
export function utility2() { }
export const CONSTANT = 'value';

// Default export (avoid for utilities)
// Only use if file exports a single main utility
export default function mainUtility() { }
```
