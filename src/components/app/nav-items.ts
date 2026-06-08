import {
  Home,
  MessageCircleHeart,
  CalendarHeart,
  BellRing,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Show in the compact mobile bottom bar. */
  primary: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/app", label: "Home", icon: Home, primary: true },
  {
    href: "/app/companion",
    label: "Companion",
    icon: MessageCircleHeart,
    primary: true,
  },
  {
    href: "/app/timeline",
    label: "Timeline",
    icon: CalendarHeart,
    primary: true,
  },
  { href: "/app/nudges", label: "Nudges", icon: BellRing, primary: true },
  {
    href: "/app/consult",
    label: "Consult",
    icon: Stethoscope,
    primary: false,
  },
  { href: "/app/profile", label: "Profile", icon: UserRound, primary: false },
];
