"use client";

import React, { useState } from "react";

// Import all UI components
import Button from "@/components/ui/Button";
import Input, { SearchInput, PasswordInput, NumberInput } from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/CheckBox";
import { Switch } from "@/components/ui/Switch";
import Card from "@/components/ui/Card";
import { Badge, NotificationBadge } from "@/components/ui/Badge";
import {
  Progress,
  CircularProgress,
  StepProgress,
  MiniProgress,
  BatteryProgress,
  SegmentedProgress,
  LoadingProgress,
} from "@/components/ui/Progress";
import Modal from "@/components/ui/Modal";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, SelectDropdown } from "@/components/ui/DropdownMenu";
import { RadioGroup, RadioGroupItem, RadioGroupWithLabel, RadioButtonGroup } from "@/components/ui/RadioGroup";
import { Skeleton, SkeletonAvatar, SkeletonText, SkeletonPost, SkeletonMessage } from "@/components/ui/Skeleton";
import Alert from "@/components/ui/Alert";
import { LoadingSpinner, LoadingDots, LoadingBar } from "@/components/ui/Loading";
import { InlineLoading } from "@/components/ui/GlobalLoading";
import { loading } from "@/lib/utils/loading";
import { Tooltip } from "@/components/ui/Tooltip";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import { DatePicker, DateRangePicker, CompactDatePicker } from "@/components/ui/DatePicker";
import { Pagination, SimplePagination, CompactPagination } from "@/components/ui/Pagination";
import { Popover } from "@/components/ui/Popover";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Sheet } from "@/components/ui/Sheet";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tab";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Carousel } from "@/components/ui/Carousel";
import { Combobox } from "@/components/ui/Combobox";

// Import icons
import {
  Heart,
  MessageCircle,
  Share,
  Settings,
  User,
  Image,
  Video,
  Plus,
  Edit,
  Trash,
  Grid,
  List,
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  Bell,
  Check,
  X,
  AlertTriangle,
  Info,
  Upload,
  Download,
  Play,
  Pause,
  SkipForward,
  Star,
  Calendar,
  Home,
  Package,
  FileText,
  Database,
  Shield,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Tag,
  Filter,
  SortAsc,
  Eye,
  EyeOff,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

const UserGuideContent: React.FC = () => {
  // State for demonstrations
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [numberValue, setNumberValue] = useState(0);
  const [textareaValue, setTextareaValue] = useState("");
  const [radioValue, setRadioValue] = useState("option1");
  const [selectValue, setSelectValue] = useState("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [comboboxValue, setComboboxValue] = useState("");
  const [progressValue, setProgressValue] = useState(45);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { addToast } = useToast();

  const handleToastDemo = () => {
    addToast({
      title: "Success!",
      message: "This is a success toast message.",
      type: "success",
    });
  };

  const handleLoadingDemo = async () => {
    setIsLoading(true);
    loading.show("Processing...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      addToast({
        title: "Complete!",
        message: "Loading demo finished successfully.",
        type: "success",
      });
    } finally {
      setIsLoading(false);
      loading.hide();
    }
  };

  const options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"];
  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4" },
    { value: "option5", label: "Option 5" },
  ];
  const comboboxOptions = ["React", "Next.js", "TypeScript", "Tailwind CSS"];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "User Guide", href: "/user-guide" },
  ];

  const carouselImages = [
    "https://picsum.photos/400/200?random=1",
    "https://picsum.photos/400/200?random=2",
    "https://picsum.photos/400/200?random=3",
    "https://picsum.photos/400/200?random=4",
  ];

  const tabData = [
    {
      label: "Overview",
      value: "overview",
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Component Overview</h3>
          <p className="text-muted-foreground">
            This user guide demonstrates all available UI components in our design system. Each component follows our design principles and
            accessibility standards.
          </p>
        </div>
      ),
    },
    {
      label: "Usage",
      value: "usage",
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">How to Use</h3>
          <p className="text-muted-foreground">
            All components are TypeScript-ready and use Floating UI for positioning. They follow our design system tokens for consistent theming.
          </p>
        </div>
      ),
    },
    {
      label: "Examples",
      value: "examples",
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Code Examples</h3>
          <pre className="bg-muted p-3 rounded text-sm">
            {`import Button from "@/components/ui/Button";

<Button variant="primary" size="md">
  Click me
</Button>`}
          </pre>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">UI Components User Guide</h1>
          <p className="text-xl text-muted-foreground mb-6">Comprehensive showcase of all available UI components</p>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Buttons Section */}
        <Card title="🔘 Buttons" className="mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="md">
                  Primary
                </Button>
                <Button variant="default" size="md">
                  Default
                </Button>
                <Button variant="outline" size="md">
                  Outline
                </Button>
                <Button variant="ghost" size="md">
                  Ghost
                </Button>
                <Button variant="link" size="md">
                  Link
                </Button>
                <Button variant="danger" size="md">
                  Danger
                </Button>
                <Button variant="success" size="md">
                  Success
                </Button>
                <Button variant="warning" size="md">
                  Warning
                </Button>
                <Button variant="info" size="md">
                  Info
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
                <Button variant="primary" size="smx">
                  Small Extended
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Button States</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="primary" loading>
                  Loading
                </Button>
                <Button variant="primary" icon={Plus}>
                  With Icon
                </Button>
                <Button variant="outline" iconRight={ChevronRight}>
                  Arrow
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Input Components Section */}
        <Card title="📝 Input Components" className="mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Regular Input</label>
                  <Input placeholder="Enter text..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Search Input</label>
                  <SearchInput placeholder="Search..." onSearch={(value) => console.log("Searching:", value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password Input</label>
                  <PasswordInput placeholder="Enter password..." value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number Input</label>
                  <NumberInput
                    placeholder="Enter number..."
                    value={numberValue.toString()}
                    onChange={(e) => setNumberValue(parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Textarea</label>
                  <Textarea placeholder="Enter long text..." value={textareaValue} onChange={(e) => setTextareaValue(e.target.value)} rows={4} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={checkboxValue} onChange={(e) => setCheckboxValue(e.target.checked)} id="checkbox-demo" />
                    <label htmlFor="checkbox-demo" className="text-sm font-medium">
                      Checkbox Example
                    </label>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Switch Examples</h4>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Switch checked={switchValue} onCheckedChange={setSwitchValue} size="sm" label="Small Switch" />
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch checked={switchValue} onCheckedChange={setSwitchValue} size="md" label="Medium Switch (Default)" />
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch checked={switchValue} onCheckedChange={setSwitchValue} size="lg" label="Large Switch" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground">Variants</h5>
                      <div className="flex flex-wrap gap-4">
                        <Switch checked={switchValue} onCheckedChange={setSwitchValue} variant="default" label="Default" />
                        <Switch checked={switchValue} onCheckedChange={setSwitchValue} variant="success" label="Success" />
                        <Switch checked={switchValue} onCheckedChange={setSwitchValue} variant="warning" label="Warning" />
                        <Switch checked={switchValue} onCheckedChange={setSwitchValue} variant="danger" label="Danger" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Switch checked={false} onCheckedChange={() => {}} disabled label="Disabled Switch" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Selection Components */}
        <Card title="🎯 Selection Components" className="mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Radio Group</label>
                  <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="option1" />
                      <label htmlFor="option1" className="text-sm">
                        Option 1
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="option2" />
                      <label htmlFor="option2" className="text-sm">
                        Option 2
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option3" id="option3" />
                      <label htmlFor="option3" className="text-sm">
                        Option 3
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Dropdown</label>
                  <SelectDropdown options={selectOptions} value={selectValue} onValueChange={setSelectValue} placeholder="Select an option..." />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Multi Combobox</label>
                  <MultiCombobox
                    options={options}
                    value={multiSelectValue}
                    onChange={setMultiSelectValue}
                    placeholder="Search and select..."
                    showTags={true}
                    showClear={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Combobox</label>
                  <Combobox options={comboboxOptions} value={comboboxValue} onChange={setComboboxValue} placeholder="Search options..." />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Date Components */}
        <Card title="📅 Date Components" className="mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Date Picker</label>
                <DatePicker value={selectedDate || undefined} onChange={setSelectedDate} placeholder="Select date..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date Range Picker</label>
                <DateRangePicker
                  onStartDateChange={(date) => console.log("Start date:", date)}
                  onEndDateChange={(date) => console.log("End date:", date)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Compact Date Picker</label>
                <CompactDatePicker value={selectedDate || undefined} onChange={setSelectedDate} />
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Components */}
        <Card title="📊 Progress Components" className="mb-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Progress Bar ({progressValue}%)</label>
                <Progress value={progressValue} className="mb-2" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                    -10%
                  </Button>
                  <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                    +10%
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Circular Progress</label>
                  <CircularProgress value={progressValue} size={64} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mini Progress</label>
                  <MiniProgress value={progressValue} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Battery Progress</label>
                  <BatteryProgress value={progressValue} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Loading Progress</label>
                  <LoadingProgress value={progressValue} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Step Progress</label>
                <StepProgress steps={["Step 1", "Step 2", "Step 3", "Step 4"]} currentStep={currentStep} />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
                    Previous
                  </Button>
                  <Button size="sm" onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}>
                    Next
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Segmented Progress</label>
                <SegmentedProgress segments={5} activeSegments={3} />
              </div>
            </div>
          </div>
        </Card>

        {/* Loading Components */}
        <Card title="⏳ Loading Components" className="mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Loading Spinners</h3>
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

              <div>
                <h3 className="text-lg font-semibold mb-4">Loading Dots</h3>
                <div className="space-y-3">
                  <LoadingDots />
                  <LoadingDots color="foreground" />
                  <LoadingDots color="muted" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Loading Bar</h3>
                <div className="space-y-3">
                  <LoadingBar progress={progressValue} />
                  <LoadingBar animated />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Inline Loading</h3>
              <div className="space-y-3">
                <InlineLoading isLoading={isLoading} text="Processing..." />
                <Button onClick={handleLoadingDemo} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Start Loading Demo"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback Components */}
        <Card title="💬 Feedback Components" className="mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Alerts</h3>
              <div className="space-y-3">
                <Alert variant="default" title="Default Alert" description="This is a default alert message." />
                <Alert variant="info" title="Info Alert" description="This is an informational message." />
                <Alert variant="success" title="Success Alert" description="Operation completed successfully!" />
                <Alert variant="warning" title="Warning Alert" description="Please review this carefully." />
                <Alert variant="error" title="Error Alert" description="Something went wrong." />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Toasts</h3>
              <div className="flex gap-2">
                <Button onClick={handleToastDemo} size="sm">
                  Show Success Toast
                </Button>
                <Button
                  onClick={() =>
                    addToast({
                      title: "Error!",
                      message: "This is an error toast.",
                      type: "error",
                    })
                  }
                  variant="danger"
                  size="sm"
                >
                  Show Error Toast
                </Button>
                <Button
                  onClick={() =>
                    addToast({
                      title: "Warning!",
                      message: "This is a warning toast.",
                      type: "warning",
                    })
                  }
                  variant="warning"
                  size="sm"
                >
                  Show Warning Toast
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Error</Badge>
                <Badge variant="outline">Outline</Badge>
                <NotificationBadge count={5}>
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">🔔</div>
                </NotificationBadge>
                <NotificationBadge count={99}>
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">📧</div>
                </NotificationBadge>
                <NotificationBadge count={1000}>
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">💬</div>
                </NotificationBadge>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Components */}
        <Card title="🧭 Navigation Components" className="mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pagination</h3>
              <div className="space-y-4">
                <Pagination page={currentPage} totalPages={10} onChange={setCurrentPage} />
                <SimplePagination page={currentPage} totalPages={10} onChange={setCurrentPage} />
                <CompactPagination page={currentPage} totalPages={10} onChange={setCurrentPage} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tabs</h3>
              <Tabs tabs={tabData} defaultValue="overview" />
            </div>
          </div>
        </Card>

        {/* Overlay Components */}
        <Card title="🔄 Overlay Components" className="mb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Modal</h3>
                <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal" size="md">
                  <div className="p-6">
                    <p className="text-muted-foreground mb-4">This is a modal dialog example with Floating UI positioning.</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setModalOpen(false)}>Confirm</Button>
                    </div>
                  </div>
                </Modal>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Sheet</h3>
                <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
                <Sheet open={sheetOpen} onOpenChange={(open) => setSheetOpen(open)} title="Example Sheet" side="right">
                  <div className="p-6">
                    <p className="text-muted-foreground">This is a sheet component that slides in from the side.</p>
                  </div>
                </Sheet>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Tooltip</h3>
                <div className="space-y-2">
                  <Tooltip content="This is a default tooltip">
                    <Button variant="outline">Hover me</Button>
                  </Tooltip>
                  <Tooltip content="Success tooltip" variant="success">
                    <Button variant="success">Success tooltip</Button>
                  </Tooltip>
                  <Tooltip content="Error tooltip" variant="error">
                    <Button variant="danger">Error tooltip</Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Dropdown Menu</h3>
              <DropdownMenu
                trigger={
                  <Button variant="outline" iconRight={ChevronDown}>
                    Dropdown Menu
                  </Button>
                }
              >
                <DropdownMenuItem onClick={() => console.log("Edit clicked")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Share clicked")}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Delete clicked")} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Popover</h3>
              <Popover trigger={<Button variant="outline">Open Popover</Button>} open={popoverOpen} onOpenChange={setPopoverOpen}>
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold">Popover Content</h4>
                  <p className="text-sm text-muted-foreground">This is popover content with Floating UI positioning.</p>
                  <Button size="sm" onClick={() => setPopoverOpen(false)}>
                    Close
                  </Button>
                </div>
              </Popover>
            </div>
          </div>
        </Card>

        {/* Media Components */}
        <Card title="🖼️ Media Components" className="mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Avatar</h3>
              <div className="flex items-center gap-4">
                <Avatar src="https://picsum.photos/100/100?random=1" alt="User Avatar" size="sm" />
                <Avatar src="https://picsum.photos/100/100?random=2" alt="User Avatar" size="md" />
                <Avatar src="https://picsum.photos/100/100?random=3" alt="User Avatar" size="lg" />
                <Avatar fallback="JD" size="md" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Carousel</h3>
              <Carousel>
                {carouselImages.map((image, index) => (
                  <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img src={image} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </Card>

        {/* Layout Components */}
        <Card title="📐 Layout Components" className="mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Scroll Area</h3>
              <ScrollArea className="h-32 w-full border rounded-md p-4">
                <div className="space-y-2">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="text-sm">
                      Scrollable item {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Skeleton Loading</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <SkeletonAvatar />
                  <div className="space-y-2 flex-1">
                    <SkeletonText className="w-1/2" />
                    <SkeletonText className="w-3/4" />
                  </div>
                </div>
                <SkeletonPost />
                <SkeletonMessage />
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground">All components use Floating UI for positioning and follow our design system tokens.</p>
          <p className="text-sm text-muted-foreground mt-2">Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
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
