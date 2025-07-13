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

// Import icons
import { Heart, MessageCircle, Share, Settings, User, Image, Video, Plus, Edit, Trash, Grid, List } from "lucide-react";

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
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">UI Components Guide</h1>
        <p className="text-lg text-muted-foreground">
          Complete component library for Facebook Clone project
        </p>
      </div>

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
    </div>
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