import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Kbd,
  KbdGroup,
  Label,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  NativeSelect,
  NativeSelectOption,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@owly/ui";
import { Bar, BarChart, XAxis } from "recharts";
import {
  CalendarIcon,
  ChevronDown,
  ChevronsUpDown,
  Home,
  Inbox,
  Mail,
  MessageSquare,
  Search,
  Settings,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { CatalogSection } from "./catalog-data.js";
import { CatalogDemoShell, CatalogDesignButtons } from "./catalog-ui.js";

const chartData = [
  { month: "Jan", sessions: 186 },
  { month: "Feb", sessions: 305 },
  { month: "Mar", sessions: 237 },
  { month: "Apr", sessions: 412 },
];

const chartConfig = {
  sessions: { label: "Sessions", color: "var(--chart-1)" },
};

function ButtonDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section} leading={<CatalogDesignButtons />}>
      <p className="sx-label-cap sx-label-cap-light">@owly/ui shadcn variants</p>
      <div className="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Settings">
          <Settings className="size-4" />
        </Button>
      </div>
    </CatalogDemoShell>
  );
}

function InputDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="grid max-w-md gap-4">
        <Input placeholder="Email address" type="email" />
        <Textarea placeholder="Write a message..." rows={3} />
      </div>
    </CatalogDemoShell>
  );
}

function CheckboxSwitchDemo({ section }: { section: CatalogSection }) {
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(false);
  return (
    <CatalogDemoShell section={section}>
      <div className="flex flex-wrap items-center gap-8">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
          Accept terms
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          Enable notifications
        </label>
      </div>
    </CatalogDemoShell>
  );
}

function RadioSelectDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="grid gap-6 md:grid-cols-2">
        <RadioGroup defaultValue="random">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="random" id="random" />
            <Label htmlFor="random">Random match</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="interests" id="interests" />
            <Label htmlFor="interests">Interest match</Label>
          </div>
        </RadioGroup>
        <div className="space-y-3">
          <Select defaultValue="moderate">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Moderation level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strict">Strict</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="relaxed">Relaxed</SelectItem>
            </SelectContent>
          </Select>
          <NativeSelect defaultValue="en">
            <NativeSelectOption value="en">English</NativeSelectOption>
            <NativeSelectOption value="fr">French</NativeSelectOption>
            <NativeSelectOption value="es">Spanish</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>
    </CatalogDemoShell>
  );
}

function SliderToggleDemo({ section }: { section: CatalogSection }) {
  const [volume, setVolume] = useState([60]);
  return (
    <CatalogDemoShell section={section}>
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label>Volume</Label>
          <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
        </div>
        <Toggle aria-label="Toggle italic">Bold</Toggle>
        <ToggleGroup type="multiple" defaultValue={["chat"]}>
          <ToggleGroupItem value="chat">Chat</ToggleGroupItem>
          <ToggleGroupItem value="video">Video</ToggleGroupItem>
          <ToggleGroupItem value="audio">Audio</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </CatalogDemoShell>
  );
}

function FieldFormDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
          <Input id="nickname" placeholder="Anonymous owl" />
          <FieldDescription>Shown only during your session.</FieldDescription>
        </Field>
      </FieldGroup>
    </CatalogDemoShell>
  );
}

function InputOtpDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </CatalogDemoShell>
  );
}

function CalendarDemo({ section }: { section: CatalogSection }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <CatalogDemoShell section={section}>
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg border" />
    </CatalogDemoShell>
  );
}

function DialogDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End session?</DialogTitle>
              <DialogDescription>
                This will disconnect you from the current chat room.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive">End Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Alert Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Report submitted</AlertDialogTitle>
              <AlertDialogDescription>
                Our moderation team will review this conversation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CatalogDemoShell>
  );
}

function SheetDrawerDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="flex flex-wrap gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Session settings</SheetTitle>
              <SheetDescription>Adjust your chat preferences.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Quick actions</DrawerTitle>
              <DrawerDescription>Swipe up panel on mobile.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </CatalogDemoShell>
  );
}

function PopoverHoverDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="flex flex-wrap gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <p className="text-sm">Ephemeral chats are never stored on device.</p>
          </PopoverContent>
        </Popover>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Hover Card</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <p className="text-sm font-medium">Safety tip</p>
            <p className="text-sm text-muted-foreground">Never share personal information.</p>
          </HoverCardContent>
        </HoverCard>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>End-to-end ephemeral session</TooltipContent>
        </Tooltip>
      </div>
    </CatalogDemoShell>
  );
}

function MenusDemo({ section }: { section: CatalogSection }) {
  const [open, setOpen] = useState(false);
  return (
    <CatalogDemoShell section={section}>
      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Dropdown</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Report user</DropdownMenuItem>
            <DropdownMenuItem>Block user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-20 w-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Right click
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy message</ContextMenuItem>
            <ContextMenuItem>Report</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Command Palette
        </Button>
        <Command className="max-w-sm rounded-lg border shadow-md">
          <CommandInput placeholder="Search actions..." />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem>
                <Home className="mr-2 size-4" /> Home
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 size-4" /> Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        {open && (
          <p className="w-full text-xs text-muted-foreground">
            Command dialog uses the inline command list above for this catalog preview.
          </p>
        )}
      </div>
    </CatalogDemoShell>
  );
}

function AlertBadgeDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="space-y-4">
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Chats are anonymous and ephemeral.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Violation detected</AlertTitle>
          <AlertDescription>This message may violate community guidelines.</AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </div>
    </CatalogDemoShell>
  );
}

function ProgressSkeletonDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="space-y-6 max-w-md">
        <Progress value={66} />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading match...
        </div>
      </div>
    </CatalogDemoShell>
  );
}

function SonnerEmptyDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => toast.success("Connected to a new stranger!")}
          >
            Show Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Connection lost. Retrying...")}
          >
            Error Toast
          </Button>
        </div>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>Start chatting to see messages here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Find a match</Button>
          </EmptyContent>
        </Empty>
      </div>
    </CatalogDemoShell>
  );
}

function CardTableDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Session</CardTitle>
            <CardDescription>Anonymous · Ephemeral</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Matched 2 minutes ago</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Leave chat</Button>
          </CardFooter>
        </Card>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="success">Online</Badge>
                </TableCell>
                <TableCell>1,284</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="warning">Matching</Badge>
                </TableCell>
                <TableCell>342</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </CatalogDemoShell>
  );
}

function AvatarAccordionDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt="User" />
            <AvatarFallback>OW</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
        </div>
        <Accordion type="single" collapsible defaultValue="safety">
          <AccordionItem value="safety">
            <AccordionTrigger>Safety guidelines</AccordionTrigger>
            <AccordionContent>Be respectful. No harassment or hate speech.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="privacy">
            <AccordionTrigger>Privacy</AccordionTrigger>
            <AccordionContent>Sessions are not stored after disconnect.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </CatalogDemoShell>
  );
}

function TabsCarouselDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="space-y-8">
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="text-sm text-muted-foreground">
            Live message stream preview.
          </TabsContent>
          <TabsContent value="settings" className="text-sm text-muted-foreground">
            Session preference controls.
          </TabsContent>
        </Tabs>
        <Carousel className="mx-auto w-full max-w-xs">
          <CarouselContent>
            {["Safe", "Fast", "Anonymous"].map((label) => (
              <CarouselItem key={label}>
                <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted/30 p-6 text-lg font-semibold">
                  {label}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </CatalogDemoShell>
  );
}

function ChartItemDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
          <BarChart data={chartData}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
          </BarChart>
        </ChartContainer>
        <div className="space-y-4">
          <ItemGroup>
            <Item variant="outline">
              <ItemMedia variant="icon">
                <MessageSquare />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Messages today</ItemTitle>
                <ItemDescription>12,480 ephemeral messages</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge>Live</Badge>
              </ItemActions>
            </Item>
          </ItemGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <span className="text-muted-foreground">+</span>
            <Kbd>K</Kbd>
            <span className="text-xs text-muted-foreground ml-2">Open command</span>
          </KbdGroup>
        </div>
      </div>
    </CatalogDemoShell>
  );
}

function BreadcrumbPaginationDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Components</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </CatalogDemoShell>
  );
}

function NavigationMenubarDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="space-y-6">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-2 p-4 md:w-[240px]">
                  <NavigationMenuLink className="block rounded-md p-2 hover:bg-accent">
                    Random chat
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block rounded-md p-2 hover:bg-accent">
                    Interest matching
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="px-4 py-2 text-sm">Guidelines</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New session</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Toggle sidebar</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </CatalogDemoShell>
  );
}

function SidebarDemo({ section }: { section: CatalogSection }) {
  return (
    <CatalogDemoShell section={section}>
      <div className="overflow-hidden rounded-xl border">
        <SidebarProvider defaultOpen>
          <div className="flex min-h-[280px] w-full">
            <Sidebar collapsible="none" className="border-r">
              <SidebarHeader className="p-4 text-sm font-semibold">Owly Panel</SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Home />
                          <span>Home</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Mail />
                          <span>Messages</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <User />
                          <span>Profile</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
              Main content area
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </CatalogDemoShell>
  );
}

function LayoutDemo({ section }: { section: CatalogSection }) {
  const [open, setOpen] = useState(false);
  return (
    <CatalogDemoShell section={section}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span>Left</span>
          <Separator orientation="vertical" className="h-6" />
          <span>Right</span>
        </div>
        <ScrollArea className="h-24 w-full rounded-md border p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              Scrollable line {i + 1}
            </p>
          ))}
        </ScrollArea>
        <ResizablePanelGroup orientation="horizontal" className="min-h-[120px] rounded-lg border">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-4 text-sm">Panel A</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-4 text-sm">Panel B</div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-muted">
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            16:9 aspect ratio
          </div>
        </AspectRatio>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              Advanced options
              <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 rounded-lg border p-4 text-sm text-muted-foreground">
            Additional session configuration options.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </CatalogDemoShell>
  );
}

const DEMO_MAP: Record<string, React.ComponentType<{ section: CatalogSection }>> = {
  button: ButtonDemo,
  input: InputDemo,
  "checkbox-switch": CheckboxSwitchDemo,
  "radio-select": RadioSelectDemo,
  "slider-toggle": SliderToggleDemo,
  "field-form": FieldFormDemo,
  "input-otp": InputOtpDemo,
  calendar: CalendarDemo,
  dialog: DialogDemo,
  "sheet-drawer": SheetDrawerDemo,
  "popover-hover": PopoverHoverDemo,
  menus: MenusDemo,
  "alert-badge": AlertBadgeDemo,
  "progress-skeleton": ProgressSkeletonDemo,
  "sonner-empty": SonnerEmptyDemo,
  "card-table": CardTableDemo,
  "avatar-accordion": AvatarAccordionDemo,
  "tabs-carousel": TabsCarouselDemo,
  "chart-item": ChartItemDemo,
  "breadcrumb-pagination": BreadcrumbPaginationDemo,
  "navigation-menubar": NavigationMenubarDemo,
  sidebar: SidebarDemo,
  layout: LayoutDemo,
};

export function CatalogDemo({ section }: { section: CatalogSection }) {
  const Demo = DEMO_MAP[section.id];
  if (!Demo) return null;
  return <Demo section={section} />;
}
