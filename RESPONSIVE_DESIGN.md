# Responsive Design System Documentation

## Tổng quan

Hệ thống thiết kế responsive của Facebook Clone được xây dựng trên **Mobile-First approach** với Tailwind CSS, đảm bảo trải nghiệm tối ưu trên tất cả các thiết bị.

## Breakpoint System

### Standard Tailwind Breakpoints
```css
/* Mobile (default) */
/* 0px - 639px */

/* Small (sm) */
@media (min-width: 640px) { }

/* Medium (md) */  
@media (min-width: 768px) { }

/* Large (lg) */
@media (min-width: 1024px) { }

/* Extra Large (xl) */
@media (min-width: 1280px) { }

/* 2X Large (2xl) */
@media (min-width: 1536px) { }
```

### Device Categories

#### 📱 Mobile (320px - 639px)
- **Primary**: iPhone SE, iPhone 12/13/14, Android phones
- **Layout**: Single column, full-width components
- **Navigation**: Hamburger menu, bottom tabs
- **Interactions**: Touch-first, larger tap targets

#### 📟 Tablet (640px - 1023px)
- **Primary**: iPad, Android tablets, small laptops
- **Layout**: Two-column layouts, sidebar navigation
- **Navigation**: Collapsible sidebar, tab navigation
- **Interactions**: Mixed touch/mouse

#### 💻 Desktop (1024px+)
- **Primary**: Laptops, desktop monitors
- **Layout**: Multi-column layouts, persistent sidebar
- **Navigation**: Full navigation bar, dropdown menus
- **Interactions**: Mouse-first, hover states

## Responsive Design Principles

### 1. Mobile-First Development
```tsx
// ✅ Correct: Start with mobile, enhance for larger screens
<div className="w-full p-4 md:w-1/2 md:p-6 lg:w-1/3 lg:p-8">

// ❌ Incorrect: Desktop-first approach
<div className="w-1/3 p-8 md:w-1/2 md:p-6 sm:w-full sm:p-4">
```

### 2. Progressive Enhancement
```tsx
// Base mobile styles + enhanced desktop features
<Button 
  className="w-full text-sm md:w-auto md:text-base"
  variant="primary"
>
  Create Post
</Button>
```

### 3. Content Priority
- **Mobile**: Show essential content only
- **Tablet**: Add secondary information
- **Desktop**: Full feature set with auxiliary content

## Component Responsive Patterns

### 1. Spacing System
```tsx
// Responsive padding/margin
<div className="p-3 md:p-6 lg:p-8">
  <div className="space-y-3 md:space-y-4 lg:space-y-6">
    {content}
  </div>
</div>
```

### 2. Grid Layouts
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

### 3. Typography Scaling
```tsx
// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Page Title
</h1>

<p className="text-sm md:text-base leading-relaxed">
  Body content
</p>
```

### 4. Navigation Patterns
```tsx
// Mobile: Hidden sidebar, hamburger menu
// Desktop: Persistent sidebar
<aside className="hidden md:block w-64 h-screen bg-card border-r">
  {/* Desktop sidebar */}
</aside>

<div className="md:hidden">
  {/* Mobile hamburger menu */}
  <MobileMenuButton />
</div>
```

## UI Component Responsive Guidelines

### Button Component
```tsx
// Size adaptation
<Button 
  size="sm"           // Mobile: Compact
  className="md:size-md lg:size-lg"  // Scale up on larger screens
>
  Action
</Button>

// Full width on mobile, auto on desktop
<Button className="w-full md:w-auto">
  Submit
</Button>
```

### Modal Component
```tsx
<Modal 
  size="full"         // Mobile: Full screen
  className="md:size-lg"  // Desktop: Large modal
  isOpen={isOpen}
  onClose={onClose}
>
  {content}
</Modal>
```

### Card Component
```tsx
<Card className="mx-2 md:mx-0 md:max-w-md lg:max-w-lg">
  {/* Responsive margins and max-width */}
</Card>
```

### Input Fields
```tsx
<Input 
  className="text-base md:text-sm"  // Prevent zoom on iOS
  placeholder="Search..."
/>
```

## Layout Responsive Patterns

### 1. Messenger Interface

#### Mobile Layout (< 768px)
```tsx
// Full screen overlay
<div className="fixed inset-0 z-50 bg-background md:relative md:inset-auto">
  <MessengerContainer />
</div>
```

#### Desktop Layout (>= 768px)
```tsx
// Floating chat window
<div className="fixed bottom-4 right-4 w-80 h-96 md:block">
  <MessengerContainer />
</div>
```

### 2. Feed Layout

#### Mobile: Single Column
```tsx
<div className="w-full space-y-4">
  {posts.map(post => (
    <PostCard key={post.id} className="mx-2" />
  ))}
</div>
```

#### Desktop: Multi-column with Sidebar
```tsx
<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside className="hidden lg:block">
    <Sidebar />
  </aside>
  <main className="lg:col-span-2">
    <Feed />
  </main>
  <aside className="hidden lg:block">
    <RightSidebar />
  </aside>
</div>
```

## Touch & Interaction Guidelines

### 1. Touch Targets
```tsx
// Minimum 44px touch target
<button className="min-h-11 min-w-11 p-2 md:min-h-10 md:min-w-10 md:p-1">
  <Icon className="w-6 h-6 md:w-5 md:h-5" />
</button>
```

### 2. Hover States
```tsx
// Only show hover effects on devices that support it
<div className="hover:bg-accent hover:text-accent-foreground @media (hover: hover)">
  Hover content
</div>
```

### 3. Swipe Gestures
```tsx
// Enable swipe navigation on mobile
<div className="overflow-x-auto md:overflow-x-visible">
  <div className="flex gap-4 pb-4 md:grid md:grid-cols-3 md:pb-0">
    {items}
  </div>
</div>
```

## Performance Optimizations

### 1. Image Responsive Loading
```tsx
<img 
  src={imageSrc}
  srcSet={`${imageSrc}?w=320 320w, ${imageSrc}?w=768 768w, ${imageSrc}?w=1024 1024w`}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto object-cover"
  loading="lazy"
/>
```

### 2. Conditional Component Loading
```tsx
// Only load heavy components on desktop
{isDesktop && <ComplexDataVisualization />}

// Use lighter alternatives on mobile
{isMobile ? <SimpleMobileChart /> : <DetailedDesktopChart />}
```

### 3. Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
```

## Testing Strategy

### 1. Device Testing Matrix
| Screen Size | Device Examples | Primary Tests |
|-------------|----------------|---------------|
| 320px | iPhone SE | Navigation, form inputs |
| 375px | iPhone 12/13 | Chat interface, modal |
| 768px | iPad | Two-column layout |
| 1024px | Laptop | Sidebar navigation |
| 1440px | Desktop | Full layout |

### 2. Browser Developer Tools
```javascript
// Test responsive breakpoints
const breakpoints = [320, 375, 768, 1024, 1440];
breakpoints.forEach(width => {
  window.resizeTo(width, 800);
  // Test functionality
});
```

### 3. Accessibility Testing
- Screen reader compatibility across devices
- Keyboard navigation on desktop
- Touch accessibility on mobile
- Color contrast in both light/dark modes

## Best Practices Checklist

### ✅ Mobile Development
- [ ] Touch targets minimum 44px
- [ ] Text readable without zoom (16px+)
- [ ] Navigation accessible with thumb
- [ ] Forms prevent zoom on input focus
- [ ] Loading states for slow connections

### ✅ Tablet Optimization
- [ ] Efficient use of screen real estate
- [ ] Mixed interaction patterns (touch + cursor)
- [ ] Landscape/portrait orientation support
- [ ] Sidebar collapsible behavior

### ✅ Desktop Enhancement
- [ ] Hover states for interactive elements
- [ ] Keyboard shortcuts documented
- [ ] Multi-column layouts utilized
- [ ] Context menus and tooltips
- [ ] Drag and drop functionality

### ✅ Cross-Platform
- [ ] Consistent branding across devices
- [ ] Feature parity where appropriate
- [ ] Performance optimized for each platform
- [ ] Graceful degradation for older browsers

## Common Responsive Utilities

### 1. Container Queries (Future Enhancement)
```css
/* When container queries are supported */
@container (min-width: 400px) {
  .card { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
  }
}
```

### 2. Custom Responsive Classes
```css
/* Custom utility classes */
.container-responsive {
  @apply w-full max-w-sm mx-auto md:max-w-2xl lg:max-w-4xl xl:max-w-6xl;
}

.text-responsive {
  @apply text-sm md:text-base lg:text-lg;
}

.spacing-responsive {
  @apply p-4 md:p-6 lg:p-8;
}
```

### 3. JavaScript Helpers
```typescript
// Responsive detection hook
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet, isDesktop };
};
```

---

## Implementation Priority

### Phase 1: Critical Components ⚡
1. **MessengerContainer** - Mobile chat experience
2. **Navigation** - Mobile hamburger menu
3. **Modal** - Full-screen mobile modals
4. **Button** - Touch-friendly sizing

### Phase 2: Layout Enhancement 📐
1. **Grid Systems** - Responsive card layouts
2. **Form Components** - Mobile-optimized inputs
3. **Feed Layout** - Column adaptation
4. **Sidebar** - Collapsible behavior

### Phase 3: Advanced Features 🚀
1. **Performance** - Image optimization
2. **Animations** - Touch-friendly transitions
3. **Accessibility** - Screen reader support
4. **Testing** - Automated responsive tests

---

**Cập nhật**: December 2024  
**Version**: 1.0.0  
**Platform**: Facebook Clone - Next.js 15.3.1 + TailwindCSS 4.1.7