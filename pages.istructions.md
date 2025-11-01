# Pages Development Instructions

## Purpose
This file provides guidance for creating and maintaining Next.js pages in the WolfStar Dashboard.

## Next.js Pages Overview
Pages in Next.js are React components that are automatically routed based on their file structure in the `src/pages/` directory.

## File Structure
```
src/pages/
├── _app.tsx          # Custom App component
├── _document.tsx     # Custom Document component
├── _error.tsx        # Custom Error page
├── 404.tsx           # Custom 404 page
├── index.tsx         # Home page (/)
├── commands.tsx      # Commands page (/commands)
├── guilds.tsx        # Guilds listing (/guilds)
├── guilds/           # Dynamic guild pages
│   └── [guildId]/    # Dynamic routes
├── oauth/            # OAuth related pages
│   ├── callback.tsx  # OAuth callback
│   └── guild.tsx     # Guild OAuth
└── privacy.tsx       # Privacy policy
```

## Page Component Patterns

### Basic Page
```typescript
import type { NextPage } from 'next';
import { Container, Typography } from '@mui/material';
import { NextSeo } from 'next-seo';

const PageName: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Page Title - WolfStar"
        description="Page description for SEO"
      />
      <Container>
        <Typography variant="h1">Page Title</Typography>
        {/* Page content */}
      </Container>
    </>
  );
};

export default PageName;
```

### Page with Server-Side Props
```typescript
import type { GetServerSideProps, NextPage } from 'next';

interface PageProps {
  data: SomeDataType;
}

const PageName: NextPage<PageProps> = ({ data }) => {
  return (
    // Page JSX
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  // Fetch data
  const data = await fetchData();
  
  return {
    props: {
      data
    }
  };
};

export default PageName;
```

### Page with Static Props
```typescript
import type { GetStaticProps, NextPage } from 'next';

interface PageProps {
  data: SomeDataType;
}

const PageName: NextPage<PageProps> = ({ data }) => {
  return (
    // Page JSX
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const data = await fetchData();
  
  return {
    props: {
      data
    },
    revalidate: 60 // Revalidate every 60 seconds
  };
};

export default PageName;
```

### Dynamic Routes
For dynamic routes like `/guilds/[guildId]/settings`:

```typescript
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const GuildSettings: NextPage = () => {
  const router = useRouter();
  const { guildId } = router.query;
  
  return (
    // Use guildId in your component
  );
};

export default GuildSettings;
```

## SEO Best Practices

### Using next-seo
All pages should include proper SEO metadata:

```typescript
import { NextSeo } from 'next-seo';

<NextSeo
  title="Page Title - WolfStar"
  description="A clear, concise description of the page content"
  openGraph={{
    title: 'Page Title',
    description: 'Page description',
    images: [
      {
        url: 'https://wolfstar.rocks/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WolfStar Dashboard'
      }
    ]
  }}
  twitter={{
    cardType: 'summary_large_image'
  }}
/>
```

### SEO Checklist
- ✅ Unique title for each page
- ✅ Descriptive meta description (150-160 characters)
- ✅ Open Graph tags for social sharing
- ✅ Twitter card metadata
- ✅ Canonical URLs
- ✅ Proper heading hierarchy (h1, h2, h3, etc.)

## Special Pages

### _app.tsx
- Wraps all pages
- Initializes global state/contexts
- Loads global styles
- Configures theme provider
- Adds layout components

**Don't modify unless**:
- Adding global providers
- Changing theme configuration
- Adding global error handling

### _document.tsx
- Customizes HTML document structure
- Adds custom `<head>` elements
- Configures Emotion for SSR
- Sets up PWA manifest

**Don't modify unless**:
- Adding global scripts
- Changing document structure
- Updating PWA configuration

### _error.tsx
- Custom error page component
- Handles 404 and 500 errors
- Should provide helpful error messages

## Data Fetching Patterns

### Client-Side Fetching
For data that doesn't need SSR:

```typescript
import { useEffect, useState } from 'react';

const PageName: NextPage = () => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/endpoint');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return null;
  
  return (
    // Render with data
  );
};
```

### Server-Side Fetching
For data that needs to be fetched on every request:

```typescript
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const data = await fetchDataFromAPI();
    
    return {
      props: {
        data
      }
    };
  } catch (error) {
    return {
      notFound: true // Returns 404 page
    };
  }
};
```

### Static Generation
For pages that can be pre-rendered:

```typescript
export const getStaticProps: GetStaticProps = async () => {
  const data = await fetchData();
  
  return {
    props: {
      data
    },
    revalidate: 3600 // Revalidate every hour
  };
};

// For dynamic routes
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await generatePaths();
  
  return {
    paths,
    fallback: 'blocking' // or true, false
  };
};
```

## Loading States
Always handle loading states gracefully:

```typescript
import { CircularProgress, Box } from '@mui/material';

const LoadingState = () => (
  <Box display="flex" justifyContent="center" p={4}>
    <CircularProgress />
  </Box>
);
```

## Error States
Provide helpful error messages:

```typescript
import { Alert, Container } from '@mui/material';

const ErrorState = ({ error }: { error: Error }) => (
  <Container>
    <Alert severity="error">
      {error.message || 'An error occurred. Please try again.'}
    </Alert>
  </Container>
);
```

## Authentication & Authorization

### Protected Pages
For pages requiring authentication:

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // Example

const ProtectedPage: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) return <LoadingState />;
  if (!user) return null;
  
  return (
    // Protected content
  );
};
```

### OAuth Flow
For OAuth-related pages (callback, guild selection):
- Handle OAuth codes and tokens securely
- Redirect appropriately after authentication
- Handle errors gracefully
- Store tokens securely (not in localStorage)

## Layout and Structure

### Page Layout
Most pages should follow this structure:

```typescript
const PageName: NextPage = () => {
  return (
    <>
      <NextSeo {...seoConfig} />
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h1" gutterBottom>
            Page Title
          </Typography>
          
          {/* Page content sections */}
          <Section1 />
          <Section2 />
        </Box>
      </Container>
    </>
  );
};
```

### Responsive Design
Ensure pages work on all screen sizes:

```typescript
<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2
  }}
>
  {/* Content */}
</Box>
```

## Performance Optimization

### Code Splitting
Use dynamic imports for heavy components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingState />,
  ssr: false // Disable SSR if not needed
});
```

### Image Optimization
Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/image.png"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>
```

### Font Optimization
Fonts are optimized via Next.js automatically. Ensure custom fonts are properly configured in `_document.tsx`.

## Navigation

### Internal Links
Use Next.js Link component:

```typescript
import Link from 'next/link';

<Link href="/about">
  <a>About</a>
</Link>

// Or with MUI Button
<Button component={Link} href="/about">
  About
</Button>
```

### Programmatic Navigation
Use Next.js router:

```typescript
import { useRouter } from 'next/router';

const router = useRouter();

const handleNavigate = () => {
  router.push('/destination');
  // or
  router.replace('/destination'); // No history entry
};
```

## API Routes Integration
Pages interact with API routes in `src/pages/api/`:

```typescript
const fetchData = async () => {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return response.json();
};
```

## Best Practices Checklist

### Every Page Should
- ✅ Include NextSeo component with proper metadata
- ✅ Handle loading states
- ✅ Handle error states
- ✅ Be responsive (mobile, tablet, desktop)
- ✅ Have proper TypeScript types
- ✅ Follow accessibility guidelines
- ✅ Use proper heading hierarchy
- ✅ Include proper page title

### Every Page Should Not
- ❌ Make API calls in component body (use useEffect or getServerSideProps)
- ❌ Store sensitive data in client-side state
- ❌ Ignore loading/error states
- ❌ Have inline styles (use MUI's sx prop)
- ❌ Use console.log in production
- ❌ Bypass TypeScript types
- ❌ Forget accessibility attributes

## Discord Integration
For pages dealing with Discord data:
- Use proper Discord API types
- Handle rate limits
- Cache data appropriately
- Handle missing/invalid guild IDs
- Respect user permissions

## Environment Variables
Access environment variables properly:

```typescript
// Client-side (must have NEXT_PUBLIC_ prefix)
const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

// Server-side (getServerSideProps, API routes)
const secret = process.env.CLIENT_SECRET;
```

## Common Patterns

### Conditional Page Access
```typescript
if (!hasAccess) {
  return <AccessDenied />;
}
```

### Multi-step Forms
```typescript
const [step, setStep] = useState(1);

const handleNext = () => setStep(s => s + 1);
const handleBack = () => setStep(s => s - 1);

return (
  <>
    {step === 1 && <Step1 onNext={handleNext} />}
    {step === 2 && <Step2 onNext={handleNext} onBack={handleBack} />}
    {step === 3 && <Step3 onBack={handleBack} />}
  </>
);
```

## Debugging
- Use Next.js built-in error overlay in development
- Check browser console for errors
- Use React DevTools
- Monitor network requests
- Check server logs for SSR issues
