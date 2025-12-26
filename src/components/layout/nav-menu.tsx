"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Server,
  Package,
  Users,
  Network,
  Settings,
  Terminal,
  File,
  Shield,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/nodes", label: "Nodes", icon: Server },
  { href: "/containers", label: "Containers", icon: Package },
  { href: "/users", label: "Users", icon: Users },
  { href: "/network", label: "Network", icon: Network },
  { href: "/admin-console", label: "Console", icon: Terminal },
  { href: "/files", label: "Files", icon: File },
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              isActive
                ? "bg-surface-dark text-white"
                : "text-text-secondary hover:bg-surface-dark/50 hover:text-white"
            )}
          >
            <item.icon className={cn("size-5", isActive && "text-primary")} />
            <p className="text-sm font-medium leading-normal">{item.label}</p>
          </Link>
        );
      })}
    </nav>
  );
}
