# Styling and Theming Instructions

## Purpose
This file provides guidance for styling and theming in the WolfStar Dashboard using Material-UI (MUI) and Emotion.

## Styling Approach
The WolfStar Dashboard uses Material-UI v5 with Emotion for CSS-in-JS styling.

## Material-UI Theme System

### Theme Usage
The application uses MUI's theming system configured in `src/pages/_app.tsx` and `src/pages/_document.tsx`.

### Accessing Theme
```typescript
import { useTheme } from '@mui/material/styles';

const MyComponent: FC = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(2)
      }}
    >
      Content
    </Box>
  );
};
```

## Styling Methods

### 1. The `sx` Prop (Recommended)
The `sx` prop is the preferred way to style MUI components:

```typescript
import { Box, Typography } from '@mui/material';

<Box
  sx={{
    p: 2,                          // padding: theme.spacing(2)
    m: 1,                          // margin: theme.spacing(1)
    bgcolor: 'primary.main',       // background-color: theme.palette.primary.main
    color: 'text.primary',         // color: theme.palette.text.primary
    borderRadius: 1,               // border-radius: theme.shape.borderRadius
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    
    // Responsive styles
    width: { xs: '100%', sm: '50%', md: '33.33%' },
    
    // Pseudo-selectors
    '&:hover': {
      bgcolor: 'primary.dark'
    },
    
    // Child selectors
    '& .child-class': {
      color: 'secondary.main'
    }
  }}
>
  Content
</Box>
```

### 2. Styled Components (For Complex Styles)
Use Emotion's `styled` API for complex, reusable styled components:

```typescript
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  
  '&:hover': {
    boxShadow: theme.shadows[4]
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

// Usage
<StyledCard>Content</StyledCard>
```

### 3. Custom Component Styles (Avoid)
Avoid inline styles or CSS classes. Use `sx` prop or `styled` instead.

```typescript
// ❌ Don't use inline styles
<div style={{ color: 'red', padding: '16px' }}>Content</div>

// ✅ Use sx prop
<Box sx={{ color: 'error.main', p: 2 }}>Content</Box>
```

## Theme Structure

### Color Palette
Access theme colors via palette:

```typescript
// Primary colors
theme.palette.primary.main
theme.palette.primary.light
theme.palette.primary.dark
theme.palette.primary.contrastText

// Secondary colors
theme.palette.secondary.main
theme.palette.secondary.light
theme.palette.secondary.dark

// Error, warning, info, success
theme.palette.error.main
theme.palette.warning.main
theme.palette.info.main
theme.palette.success.main

// Text colors
theme.palette.text.primary
theme.palette.text.secondary
theme.palette.text.disabled

// Background colors
theme.palette.background.default
theme.palette.background.paper

// Action colors
theme.palette.action.active
theme.palette.action.hover
theme.palette.action.selected
theme.palette.action.disabled
```

### Spacing
Use theme spacing for consistent spacing:

```typescript
// Spacing multiplier (default: 8px)
theme.spacing(1)  // 8px
theme.spacing(2)  // 16px
theme.spacing(3)  // 24px
theme.spacing(0.5) // 4px

// In sx prop (shorthand)
<Box sx={{ p: 2 }}>        // padding: 16px
<Box sx={{ m: 1 }}>        // margin: 8px
<Box sx={{ px: 3 }}>       // padding-left & padding-right: 24px
<Box sx={{ py: 2 }}>       // padding-top & padding-bottom: 16px
<Box sx={{ mt: 4 }}>       // margin-top: 32px
<Box sx={{ mb: 2 }}>       // margin-bottom: 16px
```

### Typography
Use theme typography variants:

```typescript
import { Typography } from '@mui/material';

<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="h3">Heading 3</Typography>
<Typography variant="h4">Heading 4</Typography>
<Typography variant="h5">Heading 5</Typography>
<Typography variant="h6">Heading 6</Typography>
<Typography variant="body1">Body text 1</Typography>
<Typography variant="body2">Body text 2</Typography>
<Typography variant="subtitle1">Subtitle 1</Typography>
<Typography variant="subtitle2">Subtitle 2</Typography>
<Typography variant="caption">Caption text</Typography>
<Typography variant="button">Button text</Typography>
<Typography variant="overline">Overline text</Typography>

// Custom styling
<Typography 
  variant="h4" 
  sx={{ 
    color: 'primary.main',
    fontWeight: 'bold',
    textAlign: 'center'
  }}
>
  Styled Heading
</Typography>
```

### Breakpoints
Use responsive breakpoints:

```typescript
// Breakpoint values
theme.breakpoints.values.xs  // 0px
theme.breakpoints.values.sm  // 600px
theme.breakpoints.values.md  // 900px
theme.breakpoints.values.lg  // 1200px
theme.breakpoints.values.xl  // 1536px

// In sx prop
<Box
  sx={{
    width: {
      xs: '100%',    // 0-599px
      sm: '80%',     // 600-899px
      md: '60%',     // 900-1199px
      lg: '50%',     // 1200-1535px
      xl: '40%'      // 1536px+
    },
    fontSize: {
      xs: '0.875rem',
      md: '1rem',
      lg: '1.125rem'
    }
  }}
>
  Responsive content
</Box>

// Using breakpoint helpers
<Box
  sx={{
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem'
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.125rem'
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      fontSize: '1rem'
    }
  }}
>
  Content
</Box>
```

### Shadows
Use theme shadows:

```typescript
theme.shadows[0]   // none
theme.shadows[1]   // subtle shadow
theme.shadows[2]   // light shadow
theme.shadows[4]   // medium shadow
theme.shadows[8]   // pronounced shadow
theme.shadows[24]  // maximum shadow

// In sx prop
<Box sx={{ boxShadow: 2 }}>Card with shadow</Box>
```

### Shape
Use theme shape for border radius:

```typescript
theme.shape.borderRadius  // Default: 4px

// In sx prop
<Box sx={{ borderRadius: 1 }}>     // theme.shape.borderRadius * 1
<Box sx={{ borderRadius: 2 }}>     // theme.shape.borderRadius * 2
<Box sx={{ borderRadius: '50%' }}> // Circle
```

## Layout Components

### Container
Use Container for consistent page width:

```typescript
import { Container } from '@mui/material';

<Container maxWidth="lg">  {/* xs, sm, md, lg, xl, false */}
  Page content
</Container>

<Container 
  maxWidth="md" 
  sx={{ 
    py: 4,  // Vertical padding
    minHeight: '100vh'
  }}
>
  Centered content
</Container>
```

### Grid System
Use Grid for responsive layouts:

```typescript
import { Grid } from '@mui/material';

<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    Left column
  </Grid>
  <Grid item xs={12} md={6}>
    Right column
  </Grid>
</Grid>

// Complex grid
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    Responsive item
  </Grid>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    Responsive item
  </Grid>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    Responsive item
  </Grid>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    Responsive item
  </Grid>
</Grid>
```

### Stack
Use Stack for flexbox layouts:

```typescript
import { Stack } from '@mui/material';

<Stack 
  direction="row"           // 'row' | 'column'
  spacing={2}               // Gap between items
  alignItems="center"
  justifyContent="space-between"
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Responsive direction
<Stack 
  direction={{ xs: 'column', md: 'row' }}
  spacing={2}
>
  Content
</Stack>
```

### Box
Use Box as a general-purpose container:

```typescript
import { Box } from '@mui/material';

<Box
  component="section"  // HTML element
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1
  }}
>
  Content
</Box>
```

## Common Styling Patterns

### Cards
```typescript
import { Card, CardContent, CardHeader, CardActions } from '@mui/material';

<Card 
  sx={{ 
    maxWidth: 400,
    boxShadow: 2,
    '&:hover': {
      boxShadow: 4
    }
  }}
>
  <CardHeader title="Card Title" />
  <CardContent>
    Card content
  </CardContent>
  <CardActions>
    <Button>Action</Button>
  </CardActions>
</Card>
```

### Buttons
```typescript
import { Button } from '@mui/material';

<Button variant="contained" color="primary">
  Primary Button
</Button>

<Button variant="outlined" color="secondary">
  Secondary Button
</Button>

<Button variant="text">
  Text Button
</Button>

<Button 
  variant="contained" 
  sx={{ 
    px: 4,
    py: 1.5,
    borderRadius: 2,
    textTransform: 'none'
  }}
>
  Custom Styled Button
</Button>
```

### Forms
```typescript
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

<TextField
  fullWidth
  label="Username"
  variant="outlined"
  sx={{ mb: 2 }}
/>

<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Option</InputLabel>
  <Select label="Select Option">
    <MenuItem value={1}>Option 1</MenuItem>
    <MenuItem value={2}>Option 2</MenuItem>
  </Select>
</FormControl>
```

### Flex Layouts
```typescript
// Centered content
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  }}
>
  Centered content
</Box>

// Space between
<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 2
  }}
>
  <div>Left</div>
  <div>Right</div>
</Box>
```

### Responsive Design
```typescript
<Box
  sx={{
    // Mobile first
    fontSize: '0.875rem',
    p: 1,
    
    // Tablet
    [theme.breakpoints.up('sm')]: {
      fontSize: '1rem',
      p: 2
    },
    
    // Desktop
    [theme.breakpoints.up('md')]: {
      fontSize: '1.125rem',
      p: 3
    }
  }}
>
  Responsive content
</Box>
```

## Dark Mode Support

### Theme-Aware Colors
Always use theme colors for dark mode support:

```typescript
// ✅ Good - Adapts to theme
<Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
  Content
</Box>

// ❌ Bad - Hardcoded colors
<Box sx={{ bgcolor: '#ffffff', color: '#000000' }}>
  Content
</Box>
```

### Conditional Styling Based on Mode
```typescript
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
const isDark = theme.palette.mode === 'dark';

<Box
  sx={{
    bgcolor: isDark ? 'grey.900' : 'grey.100',
    // or
    bgcolor: (theme) => 
      theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'
  }}
>
  Content
</Box>
```

## Accessibility

### Color Contrast
Ensure sufficient color contrast:
- Use theme palette colors which are optimized for accessibility
- Test with WCAG contrast checkers
- Don't rely solely on color to convey information

### Focus Styles
Ensure visible focus indicators:

```typescript
<Button
  sx={{
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2
    }
  }}
>
  Button
</Button>
```

### Semantic HTML
Use appropriate HTML elements:

```typescript
<Box component="nav">Navigation</Box>
<Box component="main">Main content</Box>
<Box component="footer">Footer</Box>
```

## Performance Optimization

### Memoize Styled Components
```typescript
import { memo } from 'react';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  // styles
}));

const MyComponent = memo(() => (
  <StyledBox>Content</StyledBox>
));
```

### Avoid Inline Functions in sx
```typescript
// ❌ Bad - Creates new function on every render
<Box
  sx={{
    bgcolor: () => calculateColor()
  }}
>
  Content
</Box>

// ✅ Good - Calculate outside render
const bgColor = calculateColor();
<Box sx={{ bgcolor: bgColor }}>
  Content
</Box>
```

## Common Patterns

### Loading States
```typescript
import { Skeleton, CircularProgress } from '@mui/material';

// Skeleton
<Skeleton variant="rectangular" width={210} height={118} />
<Skeleton variant="text" />
<Skeleton variant="circular" width={40} height={40} />

// Spinner
<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
  <CircularProgress />
</Box>
```

### Alerts and Snackbars
```typescript
import { Alert, Snackbar } from '@mui/material';

<Alert severity="success">Success message</Alert>
<Alert severity="error">Error message</Alert>
<Alert severity="warning">Warning message</Alert>
<Alert severity="info">Info message</Alert>

<Snackbar 
  open={open} 
  autoHideDuration={6000}
  onClose={handleClose}
>
  <Alert onClose={handleClose} severity="success">
    Snackbar message
  </Alert>
</Snackbar>
```

### Dialogs and Modals
```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Dialog Title</DialogTitle>
  <DialogContent>
    Dialog content
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleSubmit}>Submit</Button>
  </DialogActions>
</Dialog>
```

## Best Practices

### Do
- ✅ Use the `sx` prop for component-specific styles
- ✅ Use theme values (palette, spacing, breakpoints)
- ✅ Create styled components for complex, reusable styles
- ✅ Use responsive breakpoints for mobile-first design
- ✅ Use theme colors for dark mode support
- ✅ Follow MUI component API guidelines
- ✅ Use semantic HTML via `component` prop
- ✅ Ensure accessibility (contrast, focus, ARIA)

### Don't
- ❌ Use inline styles
- ❌ Hardcode colors, spacing, or breakpoint values
- ❌ Create CSS classes (use MUI's system)
- ❌ Use `!important` (use specificity properly)
- ❌ Ignore responsive design
- ❌ Forget dark mode support
- ❌ Mix styling approaches inconsistently
- ❌ Override MUI styles aggressively

## sx Prop Shorthand Reference

```typescript
// Spacing
p: 2          // padding
m: 2          // margin
pt, pr, pb, pl  // padding-top, right, bottom, left
mt, mr, mb, ml  // margin-top, right, bottom, left
px, py        // horizontal, vertical padding
mx, my        // horizontal, vertical margin

// Display & Layout
display
flexDirection
alignItems
justifyContent
gap

// Sizing
width, height
minWidth, minHeight
maxWidth, maxHeight

// Colors
color
bgcolor       // backgroundColor
borderColor

// Typography
fontSize
fontWeight
textAlign
lineHeight

// Borders
border
borderRadius
borderTop, borderRight, borderBottom, borderLeft

// Positioning
position
top, right, bottom, left
zIndex

// Effects
boxShadow
opacity
```
