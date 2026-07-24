import {
  Bookmark,
  Building2,
  Dna,
  DollarSign,
  FileText,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  Newspaper,
  Settings,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/funding", label: "Funding", icon: DollarSign },
  { href: "/program-managers", label: "Program Managers", icon: Users },
  { href: "/agencies", label: "Federal Agencies", icon: Landmark },
  { href: "/labs", label: "National Laboratories", icon: FlaskConical },
  { href: "/biotech", label: "Biotech", icon: Dna },
  { href: "/papers", label: "Scientific Papers", icon: FileText },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/saved", label: "Saved Opportunities", icon: Star },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const AGENCIES = ["DARPA", "DOE", "ARPA-H", "NSF", "NIH", "NIST", "AFWERX", "DIU", "NASA", "BARDA", "ARPA-E"];
