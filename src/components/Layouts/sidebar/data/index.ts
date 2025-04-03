import * as Icons from "../icons";

export const NAV_DATA = [
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
    ],
  },
];
