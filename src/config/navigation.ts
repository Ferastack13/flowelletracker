import {
  BookOpen,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const appNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your daily overview",
  },
  {
    title: "Cycle Tracker",
    href: "/cycle",
    icon: CalendarDays,
    description: "Track periods and phases",
  },
  {
    title: "Self-care",
    href: "/self-care",
    icon: HeartPulse,
    description: "Habits and rituals",
  },
  {
    title: "Learn",
    href: "/learn",
    icon: BookOpen,
    description: "Guides and insights",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences and privacy",
  },
];
