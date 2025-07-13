# UI Components User Guide

## Tổng Quan

Dự án Facebook Clone này sử dụng một hệ thống UI components hoàn chỉnh được xây dựng với **TypeScript**, **Tailwind CSS**, và **CSS Variables** để đảm bảo tính nhất quán và dễ bảo trì.

## Design System

### Color Scheme
```css
/* Light Mode */
--primary: 240 100% 66%;           /* #4f46e5 - Blue */
--success: 142.1 76.2% 36.3%;      /* #228B22 - Green */
--warning: 45 100% 51%;            /* #FFC107 - Amber */
--info: 200 86% 55%;               /* #3498db - Blue */
--destructive: 0 100% 50%;         /* #ff0000 - Red */

/* Dark Mode - Tự động adjust */
```

### Animation System
- **Duration**: 200ms (standard), 300ms (complex)
- **Easing**: `ease-soft` (custom cubic-bezier)
- **Effects**: backdrop-blur, scale transforms, shadows

---

## Components Documentation

### 1. Button Component

**Path**: `components/ui/Button.tsx`

#### Variants
```tsx
import Button from "@/components/ui/Button";

// Basic Usage
<Button variant="primary" size="md" onClick={handleClick}>
  Primary Button
</Button>

// With Icons
<Button 
  variant="success" 
  icon={CheckIcon}
  iconRight={ArrowRightIcon}
>
  Save Changes
</Button>

// Loading State
<Button variant="primary" loading={isLoading}>
  {isLoading ? "Saving..." : "Save"}
</Button>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "primary" \| "success" \| "danger" \| "warning" \| "info" \| "outline" \| "ghost" \| "link"` | `"default"` | Button style variant |
| `size` | `"sm" \| "md" \| "lg" \| "smx" \| "icon"` | `"md"` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `fullWidth` | `boolean` | `false` | Full width button |
| `icon` | `ComponentType` | - | Left icon component |
| `iconRight` | `ComponentType` | - | Right icon component |

#### Examples
```tsx
// Facebook-style primary action
<Button variant="primary" size="lg" fullWidth>
  Create Post
</Button>

// Destructive action
<Button variant="danger" size="sm">
  Delete Account
</Button>

// Icon only button
<Button variant="ghost" size="icon">
  <Heart className="w-4 h-4" />
</Button>
```

---

### 2. Input Component

**Path**: `components/ui/Input.tsx`

#### Basic Usage
```tsx
import Input from "@/components/ui/Input";

<Input 
  label="Email Address"
  placeholder="Enter your email"
  type="email"
  required
  error={errors.email}
  description="We'll never share your email"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message |
| `description` | `string` | - | Help text |
| `required` | `boolean` | `false` | Required field indicator |

#### Advanced Features
- **Auto-validation**: Sử dụng HTML5 validation với internationalized messages
- **Focus animations**: Primary color underline và glow effects
- **Error states**: Real-time error display với smooth animations

---

### 3. Textarea Component

**Path**: `components/ui/Textarea.tsx`

#### Usage
```tsx
import Textarea from "@/components/ui/Textarea";

<Textarea
  label="Post Content"
  placeholder="What's on your mind?"
  variant="default"
  size="lg"
  rows={4}
  error={errors.content}
/>
```

#### Variants
- **default**: Standard với border và focus effects
- **filled**: Background filled style
- **outlined**: Prominent border style

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "filled" \| "outlined"` | `"default"` | Textarea style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |

---

### 4. Modal Component

**Path**: `components/ui/Modal.tsx`

#### Usage
```tsx
import Modal from "@/components/ui/Modal";

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create New Post"
  size="lg"
>
  <div>Modal content here</div>
</Modal>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Modal visibility |
| `onClose` | `() => void` | - | Close handler |
| `title` | `string` | - | Modal title |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Modal size |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `closeOnOverlayClick` | `boolean` | `true` | Close on backdrop click |

---

### 5. Toast Notifications

**Path**: `components/ui/Toast.tsx`

#### Setup
```tsx
// In your root layout or App component
import { ToastProvider } from "@/components/ui/Toast";

<ToastProvider position="top-right" maxToasts={5}>
  {children}
</ToastProvider>
```

#### Usage
```tsx
import { useToast } from "@/components/ui/Toast";

const { addToast } = useToast();

// Success notification
addToast({
  type: "success",
  title: "Post Created",
  message: "Your post has been published successfully!",
  duration: 3000
});

// Error with action
addToast({
  type: "error", 
  title: "Upload Failed",
  message: "Failed to upload image. Please try again.",
  action: {
    label: "Retry",
    onClick: () => retryUpload()
  }
});
```

#### Toast Types
- **success**: Green với CheckCircle icon
- **error**: Red với AlertCircle icon  
- **warning**: Amber với AlertTriangle icon
- **info**: Blue với Info icon

---

### 6. Badge Component

**Path**: `components/ui/Badge.tsx`

#### Usage
```tsx
import { Badge, NotificationBadge } from "@/components/ui/Badge";

// Basic badge
<Badge variant="primary" size="sm">New</Badge>

// Notification badge
<NotificationBadge count={5} variant="danger">
  <MessageIcon />
</NotificationBadge>

// Dot indicator
<Badge dot variant="success" pulse />
```

#### Variants
- **default**, **primary**, **success**, **warning**, **danger**, **info**
- **outline**, **ghost**

#### NotificationBadge Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | - | Notification count |
| `maxCount` | `number` | `99` | Max count display |
| `dot` | `boolean` | `false` | Show dot instead of count |
| `position` | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left"` | `"top-right"` | Badge position |

---

### 7. Progress Components

**Path**: `components/ui/Progress.tsx`

#### Linear Progress
```tsx
import { Progress } from "@/components/ui/Progress";

<Progress 
  value={75} 
  max={100} 
  variant="primary"
  size="md"
  showValue
  label="Upload Progress"
  animated
/>
```

#### Circular Progress
```tsx
import { CircularProgress } from "@/components/ui/Progress";

<CircularProgress
  value={60}
  size={64}
  strokeWidth={4}
  variant="success"
  showValue
/>
```

#### Step Progress
```tsx
import { StepProgress } from "@/components/ui/Progress";

<StepProgress
  steps={["Basic Info", "Upload Photo", "Preferences", "Complete"]}
  currentStep={2}
  variant="primary"
/>
```

---

### 8. Dropdown Menu

**Path**: `components/ui/DropdownMenu.tsx`

#### Usage
```tsx
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";

<DropdownMenu
  trigger={<Button variant="outline">Options</Button>}
  align="start"
  side="bottom"
>
  <DropdownMenuItem icon={EditIcon} onClick={handleEdit}>
    Edit Post
  </DropdownMenuItem>
  <DropdownMenuItem icon={ShareIcon} shortcut="⌘S">
    Share
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem destructive icon={TrashIcon}>
    Delete
  </DropdownMenuItem>
</DropdownMenu>
```

#### Select Dropdown
```tsx
import { SelectDropdown } from "@/components/ui/DropdownMenu";

<SelectDropdown
  options={[
    { value: "public", label: "Public" },
    { value: "friends", label: "Friends Only" },
    { value: "private", label: "Only Me" }
  ]}
  value={privacy}
  onValueChange={setPrivacy}
  placeholder="Select privacy..."
/>
```

---

### 9. Radio Group

**Path**: `components/ui/RadioGroup.tsx`

#### Basic Radio Group
```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

<RadioGroup value={theme} onValueChange={setTheme}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="light" id="light" />
    <label htmlFor="light">Light Theme</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="dark" id="dark" />
    <label htmlFor="dark">Dark Theme</label>
  </div>
</RadioGroup>
```

#### Radio Group with Labels
```tsx
import { RadioGroupWithLabel } from "@/components/ui/RadioGroup";

<RadioGroupWithLabel
  items={[
    { 
      value: "everyone", 
      label: "Everyone", 
      description: "Anyone can see this post" 
    },
    { 
      value: "friends", 
      label: "Friends", 
      description: "Only your friends can see" 
    }
  ]}
  value={privacy}
  onValueChange={setPrivacy}
  variant="card"
/>
```

#### Radio Button Group
```tsx
import { RadioButtonGroup } from "@/components/ui/RadioGroup";

<RadioButtonGroup
  items={[
    { value: "grid", label: "Grid", icon: GridIcon },
    { value: "list", label: "List", icon: ListIcon }
  ]}
  value={viewMode}
  onValueChange={setViewMode}
  variant="outline"
/>
```

---

### 10. Skeleton Loaders

**Path**: `components/ui/Skeleton.tsx`

#### Basic Skeletons
```tsx
import { Skeleton, SkeletonAvatar, SkeletonText } from "@/components/ui/Skeleton";

// Basic skeleton
<Skeleton className="h-4 w-[250px]" />

// Avatar skeleton
<SkeletonAvatar size="lg" />

// Text lines
<SkeletonText lines={3} />
```

#### Pre-built Layouts
```tsx
import { SkeletonPost, SkeletonCard, SkeletonMessage } from "@/components/ui/Skeleton";

// Facebook post skeleton
<SkeletonPost />

// Card with avatar and content
<SkeletonCard showAvatar showImage textLines={2} />

// Message bubble
<SkeletonMessage own={false} showAvatar />

// Chat conversation
<div className="space-y-4">
  <SkeletonMessage own={false} />
  <SkeletonMessage own={true} />
  <SkeletonMessage own={false} />
</div>
```

---

### 11. Alert Component

**Path**: `components/ui/Alert.tsx`

#### Usage
```tsx
import Alert from "@/components/ui/Alert";

<Alert
  variant="success"
  title="Post Published"
  description="Your post has been successfully shared with your friends."
/>

<Alert
  variant="error"
  title="Upload Error"
  description="Failed to upload image. Please check your internet connection."
/>
```

#### Variants
- **default**: Neutral information
- **info**: Blue informational alerts
- **success**: Green success messages
- **warning**: Amber warnings
- **error**: Red error messages

---

### 12. Form Controls

#### Switch Component
```tsx
import { Switch } from "@/components/ui/Switch";

<Switch
  checked={notifications}
  onCheckedChange={setNotifications}
  label="Email Notifications"
/>
```

#### Checkbox Component
```tsx
import { Checkbox } from "@/components/ui/CheckBox";

<Checkbox
  checked={agreeToTerms}
  onCheckedChange={setAgreeToTerms}
  label="I agree to the Terms of Service"
/>
```

#### Card Component
```tsx
import Card from "@/components/ui/Card";

<Card
  title="Recent Activity"
  description="Your recent interactions"
  hoverable
  clickable
  onClick={handleCardClick}
  footer={
    <Button variant="outline" size="sm">
      View All
    </Button>
  }
>
  <div>Card content here</div>
</Card>
```

---

## Usage Patterns

### 1. Form Layout
```tsx
<div className="space-y-6">
  <Input
    label="Full Name"
    placeholder="Enter your full name"
    required
  />
  
  <Textarea
    label="Bio"
    placeholder="Tell us about yourself"
    rows={4}
  />
  
  <div className="flex items-center space-x-4">
    <Switch
      checked={isPublic}
      onCheckedChange={setIsPublic}
      label="Public Profile"
    />
    
    <Checkbox
      checked={receiveEmails}
      onCheckedChange={setReceiveEmails}
      label="Email Updates"
    />
  </div>
  
  <div className="flex gap-3">
    <Button variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
    <Button variant="primary" type="submit">
      Save Profile
    </Button>
  </div>
</div>
```

### 2. Post Creation Flow
```tsx
const [isUploading, setIsUploading] = useState(false);

<Card title="Create Post">
  <div className="space-y-4">
    <Textarea
      placeholder="What's on your mind?"
      rows={3}
    />
    
    {isUploading && (
      <Progress
        value={uploadProgress}
        label="Uploading image..."
        animated
      />
    )}
    
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" icon={ImageIcon}>
          Photo
        </Button>
        <Button variant="ghost" size="sm" icon={VideoIcon}>
          Video
        </Button>
      </div>
      
      <Button variant="primary" loading={isPosting}>
        Post
      </Button>
    </div>
  </div>
</Card>
```

### 3. Notification System
```tsx
// Setup toast notifications for common actions
const { addToast } = useToast();

const handlePostCreate = async () => {
  try {
    await createPost(postData);
    addToast({
      type: "success",
      title: "Post Created",
      message: "Your post has been published!"
    });
  } catch (error) {
    addToast({
      type: "error",
      title: "Failed to Create Post",
      message: error.message,
      action: {
        label: "Retry",
        onClick: () => handlePostCreate()
      }
    });
  }
};
```

### 4. Loading States
```tsx
// Page-level loading
{isLoading ? (
  <div className="space-y-4">
    <SkeletonPost />
    <SkeletonPost />
    <SkeletonPost />
  </div>
) : (
  <div className="space-y-4">
    {posts.map(post => <PostComponent key={post.id} post={post} />)}
  </div>
)}

// Component-level loading
<Button variant="primary" loading={isSubmitting}>
  {isSubmitting ? "Creating..." : "Create Post"}
</Button>
```

---

## Best Practices

### 1. Color Usage
- Sử dụng **semantic colors**: `success` cho thành công, `destructive` cho nguy hiểm
- **Primary** cho main actions, **outline** cho secondary actions
- **Ghost** cho subtle interactions, **link** cho navigation

### 2. Sizing Consistency
- **sm**: Compact interfaces, mobile-first
- **md**: Standard desktop size (default)
- **lg**: Prominent actions, hero sections

### 3. Animation Guidelines
- Giữ animations **subtle** và **meaningful**
- Sử dụng `ease-soft` cho smooth transitions
- **200ms** cho micro-interactions, **300ms** cho complex animations

### 4. Accessibility
- Luôn provide **labels** cho form controls
- Sử dụng **semantic HTML** và **ARIA attributes**
- Đảm bảo **keyboard navigation** hoạt động
- Maintain **color contrast** standards

### 5. Performance
- **Lazy load** heavy components khi cần thiết
- Sử dụng **Skeleton loaders** cho better perceived performance
- **Memoize** expensive calculations trong components

---

## Troubleshooting

### Common Issues

1. **Colors not applying**: Đảm bảo CSS variables được import trong `globals.css`
2. **Animations not smooth**: Check Tailwind config có `ease-soft` custom easing
3. **Dark mode not working**: Verify CSS variables có dark mode variants
4. **TypeScript errors**: Ensure proper import paths và prop types

### Debug Tips
```tsx
// Check if CSS variables are loaded
console.log(getComputedStyle(document.documentElement).getPropertyValue('--primary'));

// Debug component props
<Button {...props} className={cn("debug-border", props.className)} />
```

---

## Component Checklist

Khi tạo component mới, đảm bảo:

- [ ] Sử dụng project's CSS variables
- [ ] Support dark mode automatic
- [ ] Include hover/focus states
- [ ] Add smooth transitions
- [ ] Provide TypeScript interfaces
- [ ] Include forwardRef khi cần
- [ ] Add accessibility attributes
- [ ] Follow naming conventions
- [ ] Include size variants
- [ ] Document props và usage

---

**Cập nhật lần cuối**: December 2024  
**Version**: 2.0.0  
**Tác giả**: Facebook Clone Development Team

Để có thêm ví dụ hoặc hỗ trợ, vui lòng tham khảo source code trong thư mục `components/ui/` hoặc liên hệ team development.