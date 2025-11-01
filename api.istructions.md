# API Routes Development Instructions

## Purpose
This file provides guidance for creating and maintaining Next.js API routes in the WolfStar Dashboard.

## API Routes Overview
API routes in Next.js allow you to build backend API endpoints within your Next.js application. They are located in the `src/pages/api/` directory and are automatically mapped to `/api/*` endpoints.

## File Structure
```
src/pages/api/
├── hello.ts           # Example: /api/hello
├── auth/
│   ├── login.ts       # /api/auth/login
│   └── logout.ts      # /api/auth/logout
├── guilds/
│   └── [id].ts        # /api/guilds/:id (dynamic route)
└── webhook/
    └── discord.ts     # /api/webhook/discord
```

## Basic API Route Pattern

### Simple GET Endpoint
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await fetchData();
    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

### POST Endpoint with Validation
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

interface RequestBody {
  name: string;
  email: string;
}

type ResponseData = {
  success: boolean;
  message: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const body = req.body as RequestBody;

    // Validation
    if (!body.name || !body.email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Process request
    const result = await processData(body);

    return res.status(200).json({
      success: true,
      message: 'Data processed successfully',
      data: result
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
```

## HTTP Methods Handling

### Multiple Methods in One Route
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // GET logic
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // POST logic
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  // PUT logic
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  // DELETE logic
}
```

## Dynamic Routes

### Single Parameter
```typescript
// src/pages/api/guilds/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid guild ID' });
  }

  try {
    const guild = await fetchGuild(id);
    
    if (!guild) {
      return res.status(404).json({ message: 'Guild not found' });
    }

    return res.status(200).json(guild);
  } catch (error) {
    console.error('Error fetching guild:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

### Multiple Parameters
```typescript
// src/pages/api/guilds/[guildId]/channels/[channelId].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { guildId, channelId } = req.query;

  if (typeof guildId !== 'string' || typeof channelId !== 'string') {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  // Use guildId and channelId
}
```

### Catch-All Routes
```typescript
// src/pages/api/[...path].ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  // path is an array: /api/a/b/c => path = ['a', 'b', 'c']
}
```

## Authentication & Authorization

### Protected Route Example
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
  };
}

async function authenticate(req: NextApiRequest): Promise<any> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  // Verify token and return user
  const user = await verifyToken(token);
  return user;
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate user
    req.user = await authenticate(req);

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Process authenticated request
    const data = await processRequest(req.user);
    return res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error && error.message === 'No token provided') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

### Middleware Pattern
```typescript
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => void | Promise<void>;

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Middleware
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result?: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });
}

// Example: CORS middleware
const corsMiddleware: Middleware = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, corsMiddleware);
  
  // Your API logic here
}
```

## Discord OAuth Integration

### OAuth Callback Handler
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, error } = req.query;

  if (error) {
    return res.redirect('/error?message=OAuth failed');
  }

  if (typeof code !== 'string') {
    return res.status(400).json({ message: 'Invalid authorization code' });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI!
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Store token securely (in session, database, etc.)
    // NOT in localStorage or cookies without proper security

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth error:', error);
    return res.redirect('/error?message=Authentication failed');
  }
}
```

## Discord API Integration

### Fetching Guild Data
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

async function fetchDiscordGuild(guildId: string, token: string) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { guildId } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (typeof guildId !== 'string') {
    return res.status(400).json({ message: 'Invalid guild ID' });
  }

  try {
    const guild = await fetchDiscordGuild(guildId, token);
    return res.status(200).json(guild);
  } catch (error) {
    console.error('Error fetching guild:', error);
    return res.status(500).json({ message: 'Failed to fetch guild' });
  }
}
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
}

function sendError(
  res: NextApiResponse,
  status: number,
  message: string,
  code?: string,
  details?: any
) {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(details && { details })
  };
  
  return res.status(status).json(response);
}

// Usage
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // API logic
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError(res, 400, error.message, 'VALIDATION_ERROR', error.details);
    }
    
    if (error instanceof AuthError) {
      return sendError(res, 401, 'Unauthorized', 'AUTH_ERROR');
    }
    
    console.error('Unexpected error:', error);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
}
```

## Request Validation

### Using a Validation Library
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

const requestSchema = yup.object({
  name: yup.string().required().min(3).max(50),
  email: yup.string().required().email(),
  age: yup.number().required().min(18).max(120)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = await requestSchema.validate(req.body, {
      abortEarly: false
    });

    // Process validated data
    const result = await processData(validatedData);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

## Rate Limiting

### Simple Rate Limiting
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const identifier = req.headers['x-forwarded-for'] as string || 'unknown';

  if (!checkRateLimit(identifier)) {
    return res.status(429).json({ 
      message: 'Too many requests. Please try again later.' 
    });
  }

  // Process request
}
```

## CORS Configuration

### Setting CORS Headers
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Your API logic
}
```

## Environment Variables

### Secure Usage
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

// Server-side only - never expose to client
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use environment variables safely
  if (!DISCORD_BOT_TOKEN) {
    console.error('Missing DISCORD_BOT_TOKEN');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // API logic using environment variables
}
```

## Response Types

### Standard Response Format
```typescript
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}

type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Usage
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<UserData>>
) {
  try {
    const data = await fetchUserData();
    return res.status(200).json({
      success: true,
      data,
      message: 'User data retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user data',
      code: 'FETCH_ERROR'
    });
  }
}
```

## Best Practices

### Do
- ✅ Always validate input data
- ✅ Use TypeScript types for requests and responses
- ✅ Handle all HTTP methods appropriately
- ✅ Return appropriate HTTP status codes
- ✅ Log errors for debugging
- ✅ Use environment variables for secrets
- ✅ Implement proper error handling
- ✅ Add rate limiting for public endpoints
- ✅ Set proper CORS headers
- ✅ Validate authentication/authorization
- ✅ Use try-catch blocks
- ✅ Return consistent response formats
- ✅ Document API endpoints

### Don't
- ❌ Expose sensitive information in responses
- ❌ Trust client input without validation
- ❌ Use console.log in production (use proper logging)
- ❌ Ignore error cases
- ❌ Return stack traces to clients
- ❌ Store secrets in code
- ❌ Allow unrestricted CORS
- ❌ Forget to handle edge cases
- ❌ Use synchronous operations for I/O
- ❌ Ignore HTTP method checks
- ❌ Return 200 for errors

## HTTP Status Codes

Use appropriate status codes:
- `200` - OK (successful GET, PUT, PATCH)
- `201` - Created (successful POST that creates resource)
- `204` - No Content (successful DELETE)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found (resource doesn't exist)
- `405` - Method Not Allowed (wrong HTTP method)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (unexpected error)
- `503` - Service Unavailable (temporary issue)

## Logging

### Structured Logging
```typescript
function logApiRequest(req: NextApiRequest, status: number, duration: number) {
  console.log(JSON.stringify({
    method: req.method,
    url: req.url,
    status,
    duration,
    timestamp: new Date().toISOString()
  }));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();
  
  try {
    // API logic
    const status = 200;
    logApiRequest(req, status, Date.now() - startTime);
    return res.status(status).json({ success: true });
  } catch (error) {
    const status = 500;
    logApiRequest(req, status, Date.now() - startTime);
    console.error('Error:', error);
    return res.status(status).json({ success: false });
  }
}
```

## Testing
While there's no test infrastructure, ensure:
- Test with different HTTP methods
- Test with valid and invalid data
- Test authentication flows
- Test error scenarios
- Test rate limiting
- Verify CORS headers
- Check response formats
