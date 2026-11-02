import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Settings, Users } from "lucide-react";

export type NavItem = {
  label: string;
  /** Type-checked against the route tree: a typo is a compile error. */
  to: NonNullable<LinkProps["to"]>;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Users", to: "/users", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
];
