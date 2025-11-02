---
applyTo: **/*.vue
---

# Nuxt Hydration Best Practices

## Context

Hydration is the process of making the server-rendered HTML interactive on the client.

- Mismatches between server and client output can cause issues.
- Ensure consistent state and DOM structure.
- Debug hydration errors using browser devtools.

## Requirements

- Ensure consistent state between server and client
- Avoid direct DOM manipulation before hydration
- Use keys for list rendering consistency
- Debug hydration mismatch warnings carefully
- Use <ClientOnly> sparingly for non-critical UI

## Examples

<example>
<template>
  <div>
    <h1>Welcome to Our App</h1>

    <!-- Main content works with SSR -->
    <main>
      <p>This critical content is server-rendered and hydrated normally</p>
      <ProductList :products="products" />
    </main>

    <!-- Only wrapping third-party component that doesn't support SSR -->
    <ClientOnly>
      <ThirdPartyChart :data="chartData" />
      <template #fallback>
        <div class="chart-placeholder">Chart loading...</div>
      </template>
    </ClientOnly>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAsyncData } from '#app'

const { data: products } = useAsyncData('products', () =>
  $fetch('/api/products')
)

const chartData = ref([10, 25, 45, 30, 65, 40])
</script>
</example>

<example>
<template>
  <div>
    <h1>User Profile</h1>
    <div v-if="isPending">Loading...</div>
    <div v-else-if="user">
      <p>Welcome, {{ user.name }}</p>
      <p>Member since: {{ formatDate(user.joinDate) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFetch } from '#app'

// Using Nuxt's useFetch ensures consistent state between server and client
const { data: user, pending: isPending } = useFetch('/api/user')

// Shared utility function used on both server and client
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>
</example>

<example>
<template>
  <div>
    <h2>Todo List</h2>
    <ul>
      <!-- Using a unique and stable key for list rendering -->
      <li v-for="todo in todos" :key="todo.id">
        {{ todo.text }}
        <button @click="toggleComplete(todo.id)">
          {{ todo.completed ? '✓' : '○' }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn Nuxt', completed: true },
  { id: 2, text: 'Build an app', completed: false },
  { id: 3, text: 'Deploy to production', completed: false }
])

function toggleComplete(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.completed = !todo.completed
}
</script>
</example>

<example>
<template>
  <div>
    <h1>Chart Example</h1>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Using Vue's ref for DOM access
const chartContainer = ref(null)

// Proper DOM manipulation after hydration is complete
onMounted(() => {
  if (chartContainer.value) {
    renderChart(chartContainer.value)
  }
})

function renderChart(element) {
  // Using a declarative approach with Vue's reactivity
  const chart = document.createElement('div')
  chart.className = 'chart'
  chart.textContent = 'Chart Content'

  // Clean up any existing content
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }

  element.appendChild(chart)
}
</script>

<style scoped>
.chart-container {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
}
</style>
</example>

<example type="invalid">
<template>
  <div>
    <!-- BAD: Wrapping the entire app in ClientOnly -->
    <ClientOnly>
      <h1>Welcome to Our App</h1>

      <header>
        <NavBar :user="user" />
      </header>

      <main>
        <p>This critical content doesn't need ClientOnly</p>
        <ProductList :products="products" />
      </main>

      <footer>
        <p>© 2023 Our Company</p>
      </footer>
    </ClientOnly>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// BAD: Not using Nuxt's data fetching utilities
const user = ref(null)
const products = ref([])

// Fetching data only on client side
onMounted(async () => {
  // This approach loses the benefits of SSR
  const userResponse = await fetch('/api/user')
  user.value = await userResponse.json()

  const productsResponse = await fetch('/api/products')
  products.value = await productsResponse.json()
})
</script>
</example>

<example type="invalid">
<template>
  <div>
    <h1>Chart Example</h1>
    <div id="chart-container"></div>
  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'

// BAD: Direct DOM manipulation without waiting for hydration
onMounted(() => {
  // This will cause hydration mismatches
  const container = document.getElementById('chart-container')
  container.innerHTML = '<div class="chart">Chart Content</div>'

  // Adding event listeners directly to DOM
  container.addEventListener('click', () => {
    alert('Chart clicked!')
  })

  // Modifying DOM styles directly
  container.style.backgroundColor = '#f0f0f0'
  container.style.padding = '20px'
  container.style.borderRadius = '8px'
})
</script>
</example>

<example type="invalid">
<template>
  <div>
    <h1>User Profile</h1>
    <div v-if="!user">Loading...</div>
    <div v-else>
      <p>Welcome, {{ user.name }}</p>
      <p>Member since: {{ formattedDate }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// BAD: Different state on server vs client
const user = ref(null)

// BAD: This computed prop will have different values on server vs client
const formattedDate = computed(() => {
  if (!user.value?.joinDate) return ''
  // This will produce different results on server and client
  return new Date(user.value.joinDate).toLocaleDateString()
})

// BAD: Only fetching data on client side causes hydration mismatch
onMounted(async () => {
  const response = await fetch('/api/user')
  user.value = await response.json()
})
</script>
</example>

<example type="invalid">
<template>
  <div>
    <h2>Todo List</h2>
    <ul>
      <!-- BAD: Missing or non-unique keys -->
      <li v-for="(todo, index) in todos">
        {{ todo.text }}
        <button @click="removeTodo(index)">Delete</button>
      </li>
    </ul>

    <ul>
      <!-- BAD: Using index as key when items can be reordered -->
      <li v-for="(todo, index) in sortableTodos" :key="index">
        {{ todo.text }}
        <button @click="moveUp(index)" v-if="index > 0">Move Up</button>
      </li>
    </ul>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const todos = ref([
  { text: 'Learn Nuxt', completed: true },
  { text: 'Build an app', completed: false },
  { text: 'Deploy to production', completed: false }
])

const sortableTodos = ref([
  { text: 'First task', priority: 1 },
  { text: 'Second task', priority: 2 },
  { text: 'Third task', priority: 3 }
])

function removeTodo(index) {
  todos.value.splice(index, 1)
}

function moveUp(index) {
  if (index > 0) {
    const temp = sortableTodos.value[index]
    sortableTodos.value[index] = sortableTodos.value[index - 1]
    sortableTodos.value[index - 1] = temp
  }
}
</script>
</example>

## Critical Rules

- Ensure consistent state between server and client
- Avoid direct DOM manipulation before hydration
- Use keys for list rendering consistency
- Debug hydration mismatch warnings carefully
- Use <ClientOnly> sparingly for non-critical UI
