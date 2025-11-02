---
applyTo: **/plugins/**/*.{ts,js}
---

# Nuxt Plugins

## Context

Rules for implementing plugins in Nuxt applications.

- Use defineNuxtPlugin for type safety
- Implement proper dependency injection
- Handle client/server contexts properly
- Use TypeScript for better maintainability

## Requirements

- Use defineNuxtPlugin for plugin creation
- Implement proper TypeScript types
- Use provide/inject pattern for sharing functionality
- Handle both client and server contexts
- Implement proper error handling
- Use runtime config for environment variables
- Follow proper naming conventions
- Avoid global state mutations
- Implement proper cleanup in plugins
- Use composables when appropriate

## Examples

<example>
// Define API client types
interface ApiClient {
  get: <T>(url: string, config?: RequestConfig) => Promise<T>
  post: <T>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>
  put: <T>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>
}

// Define plugin
export default defineNuxtPlugin(() => {
const config = useRuntimeConfig()
const token = useCookie('auth_token')

// Create base client
const client = $fetch.create({
baseURL: config.public.apiBase,
headers: {
'Content-Type': 'application/json',
},
// Add request interceptor
onRequest({ options }) {
// Add auth token if available
if (token.value) {
options.headers = {
...options.headers,
Authorization: `Bearer ${token.value}`,
}
}
},
// Add response interceptor
async onResponse({ response }) {
if (!response.ok) {
// Handle common errors
switch (response.status) {
case 401:
navigateTo('/login')
break
case 403:
throw createError({
statusCode: 403,
message: 'Forbidden',
})
break
default:
throw createError({
statusCode: response.status,
message: response.\_data?.message || 'API Error',
})
}
}
},
})

// Create typed methods
const api: ApiClient = {
get: (url, config) => client(url, { ...config, method: 'GET' }),
post: (url, data, config) => client(url, { ...config, method: 'POST', body: data }),
put: (url, data, config) => client(url, { ...config, method: 'PUT', body: data }),
delete: (url, config) => client(url, { ...config, method: 'DELETE' }),
}

return {
provide: {
api,
},
}
})

</example>

<example>
// Define plugin types
interface AuthPlugin {
  user: Ref<User | null>
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: ComputedRef<boolean>
}

// Define plugin
export default defineNuxtPlugin(() => {
// State
const user = useState<User | null>('user', () => null)
const token = useCookie('auth_token')

// Computed
const isAuthenticated = computed(() => !!user.value)

// Methods
async function login(credentials: Credentials) {
const { data, error } = await useFetch('/api/auth/login', {
method: 'POST',
body: credentials,
})

    if (error.value) {
      throw createError({
        statusCode: 401,
        message: 'Authentication failed',
      })
    }

    user.value = data.value.user
    token.value = data.value.token

}

async function logout() {
await useFetch('/api/auth/logout', {
method: 'POST',
})

    user.value = null
    token.value = null
    navigateTo('/login')

}

return {
provide: {
auth: {
user,
login,
logout,
isAuthenticated,
},
},
}
})

</example>

<example type="invalid">
// ❌ Wrong: Not using defineNuxtPlugin
export default (context: any) => {
  // ❌ Wrong: Using global window object
  if (process.client) {
    window.myGlobalHelper = {
      // ❌ Wrong: Exposing sensitive data globally
      apiKey: 'secret_key_123',
      // ❌ Wrong: Not using typed functions
      async fetchData(url) {
        const response = await fetch(url)
        return response.json()
      },
    }
  }

// ❌ Wrong: Not using proper injection
context.app.config.globalProperties.$helper = {
// ❌ Wrong: Not handling errors
async makeRequest(url: string) {
const response = await fetch(url)
return response.json()
},
// ❌ Wrong: Direct DOM manipulation
showNotification(message: string) {
const div = document.createElement('div')
div.textContent = message
document.body.appendChild(div)
},
}

// ❌ Wrong: Not returning proper plugin structure
return {
// ❌ Wrong: Not using provide/inject pattern
helper: context.app.config.globalProperties.$helper,
}
}

</example>

## Critical Rules

- ALWAYS use defineNuxtPlugin
- Use proper TypeScript types
- Implement proper error handling
- Use provide/inject pattern
- Handle SSR properly
- Avoid global state mutations
