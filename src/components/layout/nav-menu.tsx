"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Server, Box, Users, Network, Settings } from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, tooltip: "Overview" },
  { href: "/nodes", label: "Nodes", icon: Server, tooltip: "Nodes" },
  { href: "/containers", label: "Containers", icon: Box, tooltip: "Containers" },
  { href: "/users", label: "Users", icon: Users, tooltip: "Users" },
  { href: "/network", label: "Network", icon: Network, tooltip: "Network" },
  { href: "/settings", label: "Settings", icon: Settings, tooltip: "Settings" },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item, index) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            variant={index === 0 ? "default" : "ghost"}
            className={`${index === 0 ? 'bg-primary/20 text-primary-foreground hover:bg-primary/30' : 'text-muted-foreground hover:bg-transparent hover:text-foreground' }`}
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
