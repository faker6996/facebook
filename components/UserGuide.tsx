"use client";

import React, { useState } from "react";

// Import all UI components
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/CheckBox";
import { Switch } from "@/components/ui/Switch";
import Card from "@/components/ui/Card";
import { Badge, NotificationBadge } from "@/components/ui/Badge";
import { Progress, CircularProgress, StepProgress } from "@/components/ui/Progress";
import Modal from "@/components/ui/Modal";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, SelectDropdown } from "@/components/ui/DropdownMenu";
import { RadioGroup, RadioGroupItem, RadioGroupWithLabel, RadioButtonGroup } from "@/components/ui/RadioGroup";
import { Skeleton, SkeletonAvatar, SkeletonText, SkeletonPost, SkeletonMessage } from "@/components/ui/Skeleton";
import Alert from "@/components/ui/Alert";
import { LoadingSpinner } from "@/components/ui/Loading";
import { InlineLoading, ButtonLoading } from "@/components/ui/GlobalLoading";
import { loading } from "@/lib/utils/loading";

// Import icons
import { Heart, MessageCircle, Share, Settings, User, Image, Video, Plus, Edit, Trash, Grid, List, Search, ChevronDown, ChevronRight, Users, Bell, Check, X, AlertTriangle, Info, Upload, Download, Play, Pause, SkipForward, Star } from "lucide-react";

// Import responsive utilities
import { useResponsive, RESPONSIVE_CLASSES } from "@/lib/utils/responsive";
import { ResponsiveLayout, ResponsiveGrid, ResponsiveContainer, ResponsiveText, MobileOnly, TabletOnly, DesktopOnly } from "@/components/layout/ResponsiveLayout";
import { cn } from "@/lib/utils/cn";

// ----- Responsive Demo Section -----
const ResponsiveDemo = () => {
  const { deviceType, screenSize, isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <Card title="📱 Responsive Design Demo" className="mb-8">
      <div className="space-y-6">
        {/* Device Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Current Device Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Device Type:</span>
              <span className={cn(
                "ml-2 px-2 py-1 rounded text-xs",
                deviceType === 'mobile' && "bg-red-100 text-red-800",
                deviceType === 'tablet' && "bg-yellow-100 text-yellow-800", 
                deviceType === 'desktop' && "bg-green-100 text-green-800"
              )}>
                {deviceType.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium">Screen:</span>
              <span className="ml-2">{screenSize.width} x {screenSize.height}px</span>
            </div>
            <div>
              <span className="font-medium">Breakpoints:</span>
              <span className="ml-2">
                {isMobile && "📱"} {isTablet && "📟"} {isDesktop && "💻"}
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Text Demo */}
        <div>
          <h4 className="font-semibold mb-4">Responsive Typography</h4>
          <div className="space-y-3">
            <ResponsiveText as="h1" variant="heading" className="font-bold text-primary">
              Responsive Heading (scales with device)
            </ResponsiveText>
            <ResponsiveText as="h3" variant="subheading" className="font-semibold text-muted-foreground">
              Responsive Subheading
            </ResponsiveText>
            <ResponsiveText variant="body">
              This is responsive body text that adapts to screen size. On mobile it's smaller, on desktop it's larger for better readability.
            </ResponsiveText>
          </div>
        </div>

        {/* Responsive Grid Demo */}
        <div>
          <h4 className="font-semibold mb-4">Responsive Grid Layout</h4>
          <ResponsiveGrid variant="cards" gap="md">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} title={`Card ${i + 1}`} className="h-32">
                <p className="text-sm text-muted-foreground">
                  Grid adapts: 1 col mobile, 2 cols tablet, 3 cols desktop
                </p>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Device-Specific Content */}
        <div>
          <h4 className="font-semibold mb-4">Device-Specific Components</h4>
          <div className="space-y-3">
            <MobileOnly>
              <Alert variant="info" title="Mobile Only" description="This alert only shows on mobile devices" />
            </MobileOnly>
            <TabletOnly>
              <Alert variant="warning" title="Tablet Only" description="This alert only shows on tablet devices" />
            </TabletOnly>
            <DesktopOnly>
              <Alert variant="success" title="Desktop Only" description="This alert only shows on desktop devices" />
            </DesktopOnly>
          </div>
        </div>

        {/* Responsive Button Sizes */}
        <div>
          <h4 className="font-semibold mb-4">Responsive Button Sizes</h4>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="primary">Small (scales down on desktop)</Button>
            <Button size="md" variant="success">Medium (responsive)</Button>
            <Button size="lg" variant="info">Large (scales down on desktop)</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Buttons are larger on mobile for easier touch interaction, smaller on desktop to save space.
          </p>
        </div>
      </div>
    </Card>
  );
};

// ----- Loading System Demo Components -----
const LoadingSystemDemo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLocalSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Simulate API call
      const results = await new Promise(resolve => {
        setTimeout(() => {
          resolve([
            { id: 1, name: "Nguyễn Văn A", email: "a@example.com" },
            { id: 2, name: "Trần Thị B", email: "b@example.com" }
          ]);
        }, 2000);
      });
      setSearchResults(results as any[]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    
    loading.show("Đang tìm kiếm toàn cục...");
    
    try {
      const results = await new Promise(resolve => {
        setTimeout(() => {
          resolve([
            { id: 1, name: "Global Result A", email: "a@global.com" },
            { id: 2, name: "Global Result B", email: "b@global.com" }
          ]);
        }, 2000);
      });
      setSearchResults(results as any[]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      loading.hide();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">Loading Demos</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            size="sm" 
            onClick={handleLocalSearch}
            disabled={isSearching}
          >
            {isSearching ? "Đang tìm..." : "Tìm local"}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleGlobalSearch}
          >
            Tìm global
          </Button>
        </div>
      </div>

      <InlineLoading isLoading={isSearching} text="Đang tìm kiếm..." />

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Kết quả:</p>
          {searchResults.map((user) => (
            <div key={user.id} className="text-sm p-2 bg-muted/50 rounded">
              {user.name} - {user.email}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <strong>Local:</strong> InlineLoading component | <strong>Global:</strong> loading.wrap() cho toàn màn hình
      </div>
    </div>
  );
};

const ManualLoadingDemo = () => {
  const [result, setResult] = useState<string>("");

  const handleGlobalLoading = async () => {
    loading.show("Đang xử lý...");
    
    try {
      // Simulate long operation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setResult("Hoàn thành!");
    } catch (error) {
      setResult("Có lỗi xảy ra");
    } finally {
      loading.hide();
    }
  };

  const handleSimpleLoading = async () => {
    loading.show("Xử lý với show/hide...");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setResult("Hoàn thành với show/hide!");
    } catch (error) {
      setResult("Có lỗi xảy ra");
    } finally {
      loading.hide();
    }
  };

  const clearResult = () => setResult("");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">Global Loading Control</h4>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleGlobalLoading}
          >
            loading.show()
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleSimpleLoading}
          >
            loading.show/hide
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={clearResult}
          >
            Xóa
          </Button>
        </div>
      </div>

      {result && (
        <div className="text-sm p-2 bg-success/10 text-success rounded">
          {result}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
Sử dụng <strong>loading.show()</strong> ở đầu và <strong>loading.hide()</strong> trong finally
      </div>
    </div>
  );
};

const LoadingUIDemo = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-medium">Loading Spinners</h4>
        <div className="flex items-center gap-4">
          <div className="text-center space-y-1">
            <LoadingSpinner size="sm" />
            <div className="text-xs text-muted-foreground">Small</div>
          </div>
          <div className="text-center space-y-1">
            <LoadingSpinner size="md" />
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="text-center space-y-1">
            <LoadingSpinner size="lg" />
            <div className="text-xs text-muted-foreground">Large</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Inline Loading</h4>
        <div className="space-y-2">
          <InlineLoading isLoading={true} text="Đang tải..." />
          <InlineLoading isLoading={true} />
          <InlineLoading isLoading={true} size="sm" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Loading với Buttons</h4>
        <div className="flex gap-2">
          <ButtonLoading isLoading={true} className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm">
            Đang gửi...
          </ButtonLoading>
          <ButtonLoading isLoading={false} className="bg-success text-success-foreground px-3 py-1 rounded text-sm">
            Hoàn thành
          </ButtonLoading>
        </div>
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
        💡 <strong>Best Practice:</strong><br/>
        <code>loading.show()</code> - Hiển thị loading<br/>
        <code>loading.hide()</code> - Ẩn loading (luôn gọi trong finally)<br/>
        <code>InlineLoading</code> - Loading nhỏ cho từng phần
      </div>
    </div>
  );
};

const UserGuideContent: React.FC = () => {
  // State for demonstrations
  const [modalOpen, setModalOpen] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [radioValue, setRadioValue] = useState("option1");
  const [selectValue, setSelectValue] = useState("");
  const [progressValue, setProgressValue] = useState(45);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [privacy, setPrivacy] = useState("friends");
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const handleToastDemo = (type: "success" | "error" | "warning" | "info") => {
    const messages = {
      success: { title: "Success!", message: "Operation completed successfully" },
      error: { title: "Error!", message: "Something went wrong" },
      warning: { title: "Warning!", message: "Please check your input" },
      info: { title: "Info", message: "Here's some information" }
    };

    addToast({
      type,
      ...messages[type],
      duration: 3000
    });
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ResponsiveContainer size="wide">
      <div className="py-8 space-y-12">
        <div className="text-center space-y-4">
          <ResponsiveText as="h1" variant="heading" className="font-bold text-foreground">
            🎨 UI Components Guide
          </ResponsiveText>
          <ResponsiveText variant="body" className="text-muted-foreground">
            Complete component library for Facebook Clone project with responsive design patterns
          </ResponsiveText>
        </div>

        {/* Responsive Demo - Always first */}
        <ResponsiveDemo />

      {/* Buttons Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Buttons</h2>
        <Card>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="primary">Primary</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="info">Info</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Button Sizes</h3>
              <div className="flex items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Heart className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Button States</h3>
              <div className="flex gap-3">
                <Button variant="primary" icon={Plus}>With Icon</Button>
                <Button variant="primary" loading={loading} onClick={handleLoadingDemo}>
                  {loading ? "Loading..." : "Load Demo"}
                </Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Form Controls Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Form Controls</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Input & Textarea">
            <div className="space-y-4">
              <Input
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                description="We'll never share your email"
              />

              <Textarea
                label="Bio"
                placeholder="Tell us about yourself..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                variant="default"
                size="md"
                rows={3}
              />

              <div className="flex items-center justify-between">
                <Switch
                  checked={switchValue}
                  onCheckedChange={setSwitchValue}
                  label="Email Notifications"
                />

                <Checkbox
                  checked={checkboxValue}
                  onChange={(e) => setCheckboxValue(e.target.checked)}
                  label="I agree to terms"
                />
              </div>
            </div>
          </Card>

          <Card title="Radio Groups">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Basic Radio Group</h4>
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <label htmlFor="option1" className="text-sm">Option 1</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <label htmlFor="option2" className="text-sm">Option 2</label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Button Group</h4>
                <RadioButtonGroup
                  items={[
                    { value: "grid", label: "Grid", icon: Grid },
                    { value: "list", label: "List", icon: List }
                  ]}
                  value={viewMode}
                  onValueChange={setViewMode}
                  variant="outline"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Select Dropdown</h4>
                <SelectDropdown
                  options={[
                    { value: "public", label: "Public" },
                    { value: "friends", label: "Friends Only" },
                    { value: "private", label: "Only Me" }
                  ]}
                  value={selectValue}
                  onValueChange={setSelectValue}
                  placeholder="Select privacy..."
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Progress & Loading Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Progress & Loading</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Progress Bars">
            <div className="space-y-6">
              <Progress
                value={progressValue}
                variant="primary"
                showValue
                label="Upload Progress"
              />

              <div className="flex items-center gap-4">
                <CircularProgress value={75} variant="success" showValue />
                <CircularProgress value={50} variant="warning" size={48} />
                <CircularProgress value={25} variant="danger" size={32} />
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => setProgressValue(Math.max(0, progressValue - 10))}
                >
                  -10%
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setProgressValue(Math.min(100, progressValue + 10))}
                >
                  +10%
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Step Progress">
            <div className="space-y-4">
              <StepProgress
                steps={["Basic Info", "Upload Photo", "Preferences", "Complete"]}
                currentStep={currentStep}
                variant="primary"
              />
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                >
                  Previous
                </Button>
                <Button 
                  size="sm" 
                  disabled={currentStep === 3}
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Badges & Notifications Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Badges & Notifications</h2>
        
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Badges</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge dot variant="success" pulse />
                <Badge count={99} />
                <Badge count={999} maxCount={99} />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Notification Badges</h3>
              <div className="flex items-center gap-6">
                <NotificationBadge count={5} variant="danger">
                  <MessageCircle className="w-6 h-6" />
                </NotificationBadge>
                
                <NotificationBadge dot variant="success" pulse>
                  <User className="w-6 h-6" />
                </NotificationBadge>
                
                <NotificationBadge count={12} position="top-left">
                  <Heart className="w-6 h-6" />
                </NotificationBadge>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Toast Notifications</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleToastDemo("success")}>Success</Button>
                <Button size="sm" onClick={() => handleToastDemo("error")}>Error</Button>
                <Button size="sm" onClick={() => handleToastDemo("warning")}>Warning</Button>
                <Button size="sm" onClick={() => handleToastDemo("info")}>Info</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Alerts Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Alerts</h2>
        
        <div className="space-y-4">
          <Alert
            variant="success"
            title="Success!"
            description="Your post has been published successfully."
          />
          
          <Alert
            variant="warning"
            title="Warning"
            description="Please review your privacy settings."
          />
          
          <Alert
            variant="error"
            title="Error"
            description="Failed to upload image. Please try again."
          />
          
          <Alert
            variant="info"
            title="Information"
            description="New features are now available in your dashboard."
          />
        </div>
      </section>

      {/* Modal & Dropdown Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Modal & Dropdown</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Modal Demo">
            <div className="space-y-4">
              <Button onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
              
              <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Create New Post"
                size="lg"
              >
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    rows={3}
                  />
                  
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" icon={Image}>Photo</Button>
                      <Button variant="ghost" size="sm" icon={Video}>Video</Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary">Post</Button>
                    </div>
                  </div>
                </div>
              </Modal>
            </div>
          </Card>

          <Card title="Dropdown Menu">
            <div className="space-y-4">
              <DropdownMenu
                trigger={<Button variant="outline" icon={Settings}>Options</Button>}
              >
                <DropdownMenuItem icon={Edit}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem icon={Settings}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive icon={Trash}>
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </Card>
        </div>
      </section>

      {/* Global Loading System Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Global Loading System</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Loading System Demo">
            <LoadingSystemDemo />
          </Card>

          <Card title="Manual Loading Control">
            <ManualLoadingDemo />
          </Card>
        </div>

        <Card title="Loading UI Components">
          <LoadingUIDemo />
        </Card>
      </section>

      {/* Skeleton Loading Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Skeleton Loading</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Basic Skeletons">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SkeletonAvatar size="lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              
              <SkeletonText lines={3} />
              
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </Card>

          <Card title="Complex Layouts">
            <div className="space-y-4">
              <SkeletonMessage own={false} />
              <SkeletonMessage own={true} />
              <SkeletonMessage own={false} showAvatar={false} />
            </div>
          </Card>
        </div>

        <SkeletonPost />
      </section>

      {/* Card Examples Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Card Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Basic Card"
            description="Simple card with title and description"
            hoverable
          >
            <p className="text-sm text-muted-foreground">
              This is the card content area where you can put any components.
            </p>
          </Card>

          <Card
            title="Interactive Card"
            description="Clickable card with hover effects"
            clickable
            hoverable
            onClick={() => addToast({ type: "info", message: "Card clicked!" })}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" />
              <span className="text-sm">Click me!</span>
            </div>
          </Card>

          <Card
            title="Card with Footer"
            description="Card with action buttons in footer"
            footer={
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Confirm</Button>
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">
              Card content with footer actions.
            </p>
          </Card>
        </div>
      </section>

      {/* Live Form Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Live Form Example</h2>
        
        <Card title="Create Post Form">
          <div className="space-y-4">
            <RadioGroupWithLabel
              items={[
                { value: "public", label: "Public", description: "Anyone can see this post" },
                { value: "friends", label: "Friends", description: "Only your friends can see" },
                { value: "private", label: "Only Me", description: "Only you can see this post" }
              ]}
              value={privacy}
              onValueChange={setPrivacy}
              variant="card"
            />

            <Textarea
              label="What's on your mind?"
              placeholder="Share your thoughts..."
              variant="default"
              rows={4}
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={Image}>Photo</Button>
                <Button variant="ghost" size="sm" icon={Video}>Video</Button>
                <Badge variant="info" size="sm">{privacy}</Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button variant="primary" icon={Share}>Post</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <Card className="text-center">
        <ResponsiveText variant="body" className="text-muted-foreground">
          🚀 All components are production-ready with responsive design, dark mode support, and accessibility features.
        </ResponsiveText>
        <ResponsiveText variant="caption" className="text-muted-foreground mt-2">
          Built with Next.js 15.3.1, TypeScript, and TailwindCSS 4.1.7
        </ResponsiveText>
      </Card>
      </div>
    </ResponsiveContainer>
  );
};

const UserGuide: React.FC = () => {
  return (
    <ToastProvider position="top-right">
      <div className="min-h-screen bg-background">
        <UserGuideContent />
      </div>
    </ToastProvider>
  );
};

export default UserGuide;