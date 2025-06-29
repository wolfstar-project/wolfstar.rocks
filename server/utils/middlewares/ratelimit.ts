import type { EventHandlerRequest, H3Event } from 'h3'
import type { Optional } from 'utility-types'
import { RateLimitManager } from '@sapphire/ratelimits'
import { createError, defineEventHandler, getHeader, setHeader } from 'h3'

interface RateLimitOptions {
  time: number // Time in seconds
  max: number // Maximum number of requests
  message: string | ((event: H3Event) => string)
  auth: boolean // Whether to use authentication ID or IP
  getUserId: (event: H3Event) => Promise<string | null> | string | null // Function to get user ID
}

// Create a singleton rate limit manager for reuse
const managers = new Map<string, RateLimitManager>()

/**
 * Creates a rate limit middleware for h3
 */
export function createRateLimit(
  options: Optional<RateLimitOptions> = {
    time: 5,
    max: 10,
    message: (event: H3Event) => `Rate limit exceeded. Please try again later. IP address: ${getClientIP(event)}`,
    auth: false,
  },
) {
  const { time, max, message, auth, getUserId } = options as RateLimitOptions

  // Create a unique manager ID based on the options
  const managerId = `${time}:${max}:${auth}`

  // Create or reuse the manager
  if (!managers.has(managerId)) {
    managers.set(managerId, new RateLimitManager(time, max))
  }
  const xRateLimitLimit = options.time

  const manager = managers.get(managerId)!

  return defineEventHandler(async (event) => {
    let id: string | null

    // Determine the identifier based on auth option
    if (auth && getUserId) {
      const userId = await getUserId(event)
      id = userId || getClientIP(event)
    }
    else {
      id = getClientIP(event)
    }

    // Acquire a bucket for this identifier
    const bucket = manager.acquire(id)

    // Set date header
    setHeader(event, 'Date', new Date().toUTCString())

    // Check if limited
    if (bucket.limited) {
      setHeader(event, 'Retry-After', bucket.remainingTime)

      const errorMessage = typeof message === 'function' ? message(event) : message

      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        message: errorMessage,
      })
    }

    // Consume a token
    try {
      bucket.consume()
    }
    catch {
      // Ignore errors during consumption
    }

    // Set rate limit headers
    setHeader(event, 'X-RateLimit-Limit', xRateLimitLimit!.toString())
    setHeader(event, 'X-RateLimit-Remaining', bucket.remaining.toString())
    setHeader(event, 'X-RateLimit-Reset', bucket.remainingTime.toString())
  })
}

/**
 * Middleware function that can be used directly in route handlers
 */
export default async function defineRateLimitMiddleware<T extends EventHandlerRequest>(
  event: H3Event<T>,
  options: Optional<RateLimitOptions> = {
    time: 5,
    max: 10,
    message: (event: H3Event) => `Rate limit exceeded. Please try again later. IP address: ${getClientIP(event)}`,
    auth: false,
  },
) {
  const { time, max, message, auth, getUserId } = options as RateLimitOptions
  if (!time || max) {
    throw new Error('Rate limit time and max must be defined')
  }

  const manager = new RateLimitManager(time, max)
  const xRateLimitLimit = options.time

  // Determine the identifier based on auth option
  let id: string | null
  if (auth && getUserId) {
    const userId = await getUserId(event)
    id = userId || getClientIP(event)
  }
  else {
    id = getClientIP(event)
  }

  // Acquire a bucket for this identifier
  const bucket = manager.acquire(id)

  // Set date header
  setHeader(event, 'Date', new Date().toUTCString())

  // Check if limited
  if (bucket.limited) {
    setHeader(event, 'Retry-After', bucket.remainingTime)

    const errorMessage = typeof message === 'function' ? message(event) : message

    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: errorMessage,
    })
  }

  // Consume a token
  try {
    bucket.consume()
  }
  catch {
    // Ignore errors during consumption
  }

  // Set rate limit headers
  setHeader(event, 'X-RateLimit-Limit', xRateLimitLimit!.toString())
  setHeader(event, 'X-RateLimit-Remaining', bucket.remaining.toString())
  setHeader(event, 'X-RateLimit-Reset', bucket.remainingTime.toString())
}

function getClientIP(event: H3Event) {
  return (getHeader(event, 'x-forwarded-for') ?? event.node.req.socket.remoteAddress) as string
}
