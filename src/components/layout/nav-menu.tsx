"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutGrid, Server, SquareStack, Users, Network, Settings } from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, tooltip: "Overview" },
  { href: "/nodes", label: "Nodes", icon: Server, tooltip: "Nodes" },
  { href: "/containers", label: "Containers", icon: SquareStack, tooltip: "Containers" },
  { href: "/users", label: "Users", icon: Users, tooltip: "Users" },
  { href: "/network", label: "Network", icon: Network, tooltip: "Network" },
  { href: "/settings", label: "Settings", icon: Settings, tooltip: "Settings" },
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
            variant={pathname.startsWith(item.href) ? "default" : "ghost"}
            className={`${
              pathname.startsWith(item.href)
                ? 'bg-primary/10 text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
            }`}
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
