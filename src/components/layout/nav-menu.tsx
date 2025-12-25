"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Terminal, Files, Settings, Shield } from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tooltip: "Dashboard" },
  { href: "/console", label: "Console", icon: Terminal, tooltip: "Server Console" },
  { href: "/files", label: "Files", icon: Files, tooltip: "File Manager" },
  { href: "/settings", label: "Settings", icon: Settings, tooltip: "Server Settings" },
  { href: "/admin", label: "Admin", icon: Shield, tooltip: "Admin Panel" },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            tooltip={{ children: item.tooltip }}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
