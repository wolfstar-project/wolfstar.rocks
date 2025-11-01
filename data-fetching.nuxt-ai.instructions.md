# Nuxt Data Fetching

Follow best practices for data fetching in Nuxt applications.

## Context

Rules for implementing data fetching in Nuxt applications.
- Use useFetch, useAsyncData, or $fetch
- Avoid fetch in lifecycle hooks
- Handle loading states
- Implement proper error handling
- Cache responses when appropriate

## Requirements

- Use useFetch for external API calls
- Use useAsyncData for internal server functions
- Use $fetch for direct API calls
- Handle loading states properly
- Implement proper error handling
- Cache responses when appropriate using key option

## Critical Rules

- NEVER fetch data inside lifecycle hooks
- ALWAYS implement proper error handling
- Handle loading states properly
- Use appropriate Nuxt data fetching composables
