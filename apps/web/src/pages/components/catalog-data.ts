export type CatalogGroup =
  | "Forms"
  | "Overlays"
  | "Feedback"
  | "Data Display"
  | "Navigation"
  | "Layout";

export interface CatalogSection {
  id: string;
  title: string;
  group: CatalogGroup;
  components: string[];
}

export const CATALOG_SECTIONS: CatalogSection[] = [
  {
    id: "button",
    title: "Button",
    group: "Forms",
    components: ["Button"],
  },
  {
    id: "input",
    title: "Input & Textarea",
    group: "Forms",
    components: ["Input", "Textarea"],
  },
  {
    id: "checkbox-switch",
    title: "Checkbox & Switch",
    group: "Forms",
    components: ["Checkbox", "Switch"],
  },
  {
    id: "radio-select",
    title: "Radio & Select",
    group: "Forms",
    components: ["RadioGroup", "Select", "NativeSelect"],
  },
  {
    id: "slider-toggle",
    title: "Slider & Toggle",
    group: "Forms",
    components: ["Slider", "Toggle", "ToggleGroup"],
  },
  {
    id: "field-form",
    title: "Field & Form",
    group: "Forms",
    components: ["Field", "Form", "Label"],
  },
  {
    id: "input-otp",
    title: "Input OTP",
    group: "Forms",
    components: ["InputOTP"],
  },
  {
    id: "calendar",
    title: "Calendar",
    group: "Forms",
    components: ["Calendar"],
  },
  {
    id: "dialog",
    title: "Dialog & Alert Dialog",
    group: "Overlays",
    components: ["Dialog", "AlertDialog"],
  },
  {
    id: "sheet-drawer",
    title: "Sheet & Drawer",
    group: "Overlays",
    components: ["Sheet", "Drawer"],
  },
  {
    id: "popover-hover",
    title: "Popover & Hover Card",
    group: "Overlays",
    components: ["Popover", "HoverCard", "Tooltip"],
  },
  {
    id: "menus",
    title: "Menus & Command",
    group: "Overlays",
    components: ["DropdownMenu", "ContextMenu", "Command"],
  },
  {
    id: "alert-badge",
    title: "Alert & Badge",
    group: "Feedback",
    components: ["Alert", "Badge"],
  },
  {
    id: "progress-skeleton",
    title: "Progress & Skeleton",
    group: "Feedback",
    components: ["Progress", "Skeleton", "Spinner"],
  },
  {
    id: "sonner-empty",
    title: "Sonner & Empty",
    group: "Feedback",
    components: ["Sonner", "Empty"],
  },
  {
    id: "card-table",
    title: "Card & Table",
    group: "Data Display",
    components: ["Card", "Table"],
  },
  {
    id: "avatar-accordion",
    title: "Avatar & Accordion",
    group: "Data Display",
    components: ["Avatar", "Accordion"],
  },
  {
    id: "tabs-carousel",
    title: "Tabs & Carousel",
    group: "Data Display",
    components: ["Tabs", "Carousel"],
  },
  {
    id: "chart-item",
    title: "Chart & Item",
    group: "Data Display",
    components: ["Chart", "Item", "Kbd"],
  },
  {
    id: "breadcrumb-pagination",
    title: "Breadcrumb & Pagination",
    group: "Navigation",
    components: ["Breadcrumb", "Pagination"],
  },
  {
    id: "navigation-menubar",
    title: "Navigation & Menubar",
    group: "Navigation",
    components: ["NavigationMenu", "Menubar"],
  },
  {
    id: "sidebar",
    title: "Sidebar",
    group: "Navigation",
    components: ["Sidebar"],
  },
  {
    id: "layout",
    title: "Layout Utilities",
    group: "Layout",
    components: ["Separator", "ScrollArea", "Resizable", "AspectRatio", "Collapsible"],
  },
];

export const CATALOG_GROUPS: CatalogGroup[] = [
  "Forms",
  "Overlays",
  "Feedback",
  "Data Display",
  "Navigation",
  "Layout",
];
