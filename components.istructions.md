# Component Development Instructions

## Purpose
This file provides guidance for creating and maintaining React components in the WolfStar Dashboard.

## Component Categories

### 1. Presentational Components (`src/components/presentational/`)
**Purpose**: Pure presentational components focused on UI rendering.

**Guidelines**:
- Should be stateless when possible
- Receive data via props
- Focus on rendering UI
- Use `memo()` for performance
- Should be reusable across different pages

**Example Pattern**:
```typescript
import { memo, type FC } from 'react';
import { Box, Typography } from '@mui/material';

export interface CardComponentProps {
  /** The title to display */
  title: string;
  /** Optional description */
  description?: string;
}

const CardComponent: FC<CardComponentProps> = ({ title, description }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">{title}</Typography>
    {description && <Typography variant="body2">{description}</Typography>}
  </Box>
);

export default memo(CardComponent);
```

### 2. Select Components (`src/components/selects/`)
**Purpose**: Form inputs and selection components.

**Guidelines**:
- Extend Material-UI form component props when appropriate
- Include `currentValue` prop for controlled components
- Support `onChange` handlers
- Include descriptive labels and helper text
- Support both controlled and uncontrolled modes

**Example Pattern**:
```typescript
import { memo, type FC } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import type { SwitchProps } from '@mui/material/Switch';

export interface SelectBooleanProps extends SwitchProps {
  /** The label text */
  title: string;
  /** Current value */
  currentValue: boolean;
  /** Optional description */
  description?: string;
}

const SelectBoolean: FC<SelectBooleanProps> = ({ 
  title, 
  currentValue, 
  onChange, 
  description,
  ...props 
}) => (
  <FormControlLabel
    control={<Switch {...props} checked={currentValue} onChange={onChange} />}
    label={title}
  />
);

export default memo(SelectBoolean);
```

### 3. Page Components (`src/components/pages/`)
**Purpose**: Complex components specific to certain pages.

**Guidelines**:
- Can contain local state and side effects
- Compose multiple smaller components
- Handle data fetching and error states
- Include loading states
- May use contexts for shared state

### 4. Routing Components (`src/components/routing/`)
**Purpose**: Components related to navigation and routing.

**Guidelines**:
- Use Next.js Link component for navigation
- Support active route highlighting
- Handle route changes appropriately
- Include proper accessibility for navigation

### 5. Material Components (`src/components/material/`)
**Purpose**: Custom or wrapped Material-UI components.

**Guidelines**:
- Extend MUI components with custom functionality
- Maintain MUI theming compatibility
- Document custom props clearly
- Ensure accessibility standards are met

## Component Best Practices

### Props Definition
1. **Use TypeScript interfaces**: Always define props with TypeScript
2. **JSDoc comments**: Add descriptions for non-obvious props
3. **Optional props**: Use `?` for optional properties
4. **Default props**: Use default parameters or destructuring defaults

```typescript
export interface MyComponentProps {
  /** Required string prop */
  title: string;
  /** Optional number with default */
  count?: number;
  /** Callback function */
  onAction?: () => void;
}

const MyComponent: FC<MyComponentProps> = ({ 
  title, 
  count = 0, 
  onAction 
}) => {
  // Component implementation
};
```

### Event Handlers
- Prefix with `handle`: `handleClick`, `handleChange`, `handleSubmit`
- Use `useCallback` for callbacks passed as props to memoized children
- Type event handlers properly: `React.MouseEvent`, `React.ChangeEvent`

```typescript
const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handle click
}, [dependencies]);
```

### Styling
1. **Use MUI's `sx` prop**: For inline styles
2. **Leverage theme**: Access theme via `sx` or `useTheme` hook
3. **Consistent spacing**: Use theme spacing units
4. **Responsive design**: Use MUI breakpoints

```typescript
<Box
  sx={{
    p: 2,
    bgcolor: 'background.paper',
    borderRadius: 1,
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' }
  }}
>
  {/* Content */}
</Box>
```

### Performance Optimization
1. **Use `memo()`**: Wrap components to prevent unnecessary re-renders
2. **Use `useMemo()`**: For expensive calculations
3. **Use `useCallback()`**: For callback functions passed to children
4. **Lazy loading**: Use `next/dynamic` for code splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
});
```

### State Management in Components
1. **Local state**: Use `useState` for component-specific state
2. **Side effects**: Use `useEffect` with proper dependencies
3. **Derived state**: Use `useMemo` instead of `useEffect`
4. **Shared state**: Use context via Constate

```typescript
const [value, setValue] = useState<string>('');

const derivedValue = useMemo(() => {
  return value.toUpperCase();
}, [value]);

useEffect(() => {
  // Side effect
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### Accessibility
1. **ARIA labels**: Use `aria-label`, `aria-labelledby`
2. **Keyboard navigation**: Support Tab, Enter, Escape
3. **Focus management**: Use `autoFocus` and `tabIndex` appropriately
4. **Semantic HTML**: Use proper HTML5 elements

```typescript
<button
  aria-label="Close dialog"
  onClick={handleClose}
  tabIndex={0}
>
  <CloseIcon />
</button>
```

### Error Boundaries
- Consider wrapping components in error boundaries for critical sections
- Provide fallback UI for errors
- Log errors appropriately

## Testing Components
While there's no current test infrastructure:
- Ensure components work in both light and dark themes
- Test with different prop combinations
- Verify keyboard navigation
- Check mobile responsiveness
- Validate with screen readers when possible

## Common Patterns

### Conditional Rendering
```typescript
{condition && <Component />}
{value ? <ComponentA /> : <ComponentB />}
{items.map(item => <Item key={item.id} {...item} />)}
```

### Forwarding Refs
```typescript
import { forwardRef, memo } from 'react';

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
);

export default memo(Component);
```

### Custom Hooks
```typescript
const useCustomHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);
  
  return { value, setValue: handleChange };
};
```

## File Structure
```
ComponentName.tsx
├── Imports (external, then internal)
├── Type definitions
├── Component implementation
├── Default export with memo()
└── Sub-components (if any, in same file or separate)
```

## Don't
- ❌ Create overly complex components - split them
- ❌ Use index files for re-exports (not the pattern here)
- ❌ Mix presentation and business logic excessively
- ❌ Forget to memoize when passing callbacks to children
- ❌ Use inline function definitions in JSX for event handlers
- ❌ Ignore TypeScript errors
- ❌ Skip accessibility considerations

## Do
- ✅ Keep components focused and single-purpose
- ✅ Use proper TypeScript types
- ✅ Follow existing naming conventions
- ✅ Document complex logic with comments
- ✅ Consider performance implications
- ✅ Make components reusable when appropriate
- ✅ Test components thoroughly in the UI
- ✅ Follow MUI and React best practices
