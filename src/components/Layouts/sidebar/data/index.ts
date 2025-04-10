// In your data.ts file:
import * as Icons from "../icons";

// Define the types
type SubMenuItem = {
  title: string;
  url: string;
};

type MenuItem = {
  title: string;
  icon: React.ComponentType<any>;
  url?: string;
  items: SubMenuItem[];
};

type NavSection = {
  label: string;
  items: MenuItem[];
};

// Then use those types for your data
export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        url: "/",
        items: []
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: []
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        url: "/charts/basic-chart",
        icon: Icons.PieChart,
        items: []
      },
      {
        title: "Logs",
        url: "/admin/logs",
        icon: Icons.HomeIcon,
        items: []
      },
      {
        title: "Contact",
        url: "/contact",
        icon: Icons.ChevronUp,
        items: []
      },
    ],
  },
];