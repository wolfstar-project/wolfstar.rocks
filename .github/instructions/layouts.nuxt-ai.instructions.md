---
applyTo: **/layouts/**/*.vue
---

# Nuxt Layouts

## Context

Rules for implementing layouts in Nuxt applications.

- Use layouts for shared UI elements across pages
- Implement proper navigation and routing
- Handle authentication and authorization
- Manage layout-specific state and composables

## Requirements

- Use script setup and Composition API
- Implement semantic HTML structure
- Use proper navigation components (NuxtLink)
- Handle layout-specific state with composables
- Implement proper authentication flow
- Use CSS Grid/Flexbox for layout structure
- Handle responsive design
- Manage route transitions
- Implement proper error boundaries
- Use proper TypeScript types

## Examples

<example>
<script setup lang="ts">
// Auth middleware
definePageMeta({
  middleware: ['auth']
})

// Handle auth state
const { user, isAuthenticated } = useAuth()

// Redirect if not authenticated
onMounted(() => {
if (!isAuthenticated) {
navigateTo('/login')
}
})

// Handle auth-specific navigation
const { currentWorkspace } = useWorkspace()
</script>

<template>
  <div class="auth-layout">
    <!-- Auth-specific header -->
    <header>
      <div class="user-info">
        <img :src="user.avatar" :alt="user.name" />
        <span>{{ user.name }}</span>
      </div>
      <div class="workspace">
        <span>{{ currentWorkspace.name }}</span>
      </div>
    </header>

    <!-- Sidebar navigation -->
    <div class="layout-content">
      <nav class="sidebar">
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        <NuxtLink to="/settings">Settings</NuxtLink>
        <NuxtLink to="/profile">Profile</NuxtLink>
      </nav>

      <!-- Main content -->
      <main>
        <slot />
      </main>
    </div>

  </div>
</template>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

.layout-content {
  display: grid;
  grid-template-columns: 250px 1fr;
}
</style>
</example>

<example>
<script setup lang="ts">
// Define layout-level state
const { isMenuOpen } = useMenu()
const { user } = useAuth()

// Handle layout-level navigation
const router = useRouter()
const route = useRoute()

// Watch route changes for analytics
watch(
() => route.path,
(path) => {
trackPageView(path)
}
)
</script>

<template>
  <div class="layout">
    <!-- Header with navigation -->
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
        <template v-if="user">
          <NuxtLink to="/dashboard">Dashboard</NuxtLink>
          <button @click="logout">Logout</button>
        </template>
        <NuxtLink v-else to="/login">Login</NuxtLink>
      </nav>
    </header>

    <!-- Main content area -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer>
      <p>&copy; {{ new Date().getFullYear() }} My App</p>
    </footer>

  </div>
</template>

<style scoped>
.layout {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto;
}
</style>
</example>

<example type="invalid">
<script>
// ❌ Wrong: Not using script setup
export default {
  data() {
    return {
      // ❌ Wrong: Using options API instead of composition API
      isMenuOpen: false,
      user: null
    }
  },
  // ❌ Wrong: Using mounted hook for auth check
  mounted() {
    this.checkAuth()
  },
  methods: {
    // ❌ Wrong: Not using composables for auth
    async checkAuth() {
      try {
        const response = await fetch('/api/auth')
        this.user = await response.json()
      } catch (error) {
        console.error(error)
      }
    },
    // ❌ Wrong: Direct DOM manipulation
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : ''
    }
  }
}
</script>

<template>
  <!-- ❌ Wrong: No semantic HTML structure -->
  <div>
    <!-- ❌ Wrong: Inline styles -->
    <div style="background: #fff; padding: 20px;">
      <button @click="toggleMenu">Menu</button>
    </div>

    <!-- ❌ Wrong: No proper navigation structure -->
    <div v-if="isMenuOpen">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </div>

    <!-- ❌ Wrong: No proper content structure -->
    <div style="padding: 20px;">
      <slot />
    </div>

  </div>
</template>
</example>

## Critical Rules

- ALWAYS use script setup and Composition API
- Use proper navigation components
- Implement proper authentication flow
- Use semantic HTML structure
- Handle layout-specific state with composables
- Implement proper error handling
