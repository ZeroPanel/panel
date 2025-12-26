'use client';

import {
  Terminal,
  File,
  Database,
  Archive,
  Network,
  Power,
  Settings,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
    { href: "/console", label: "Console", icon: Terminal },
    { href: "/files", label: "Files", icon: File },
    { href: "/databases", label: "Databases", icon: Database },
    { href: "/backups", label: "Backups", icon: Archive },
    { href: "/network", label: "Network", icon: Network },
    { href: "/startup", label: "Startup", icon: Power },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function ServerSidebar({ serverId }: { serverId: string }) {
    const pathname = usePathname();
    const serverName = serverId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const isFilesPage = pathname.includes('/files');

    // Do not render the sidebar on the files page
    if (isFilesPage) {
        return null;
    }

    return (
        <aside className="hidden lg:flex w-72 flex-col border-r border-border-dark bg-background-dark">
            <div className="flex flex-col h-full p-4">
                {/* Branding & Back button */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex gap-3 px-2 py-4">
                        <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuBogkWIMDrh5eaL38Rww_egDjkcXbBymh-eJclZx1JyY8vDV2nl_BKojR_tqGi0FnzPOK9ZLRncAdCRnKtEhBJoqoe51YNOEyVv9tvvdNKHf7KdbFP_bpVrP5hAu2JprdZQYDUmrOcJa_ZBJ1qVIHdahfPRzWOSJ8B5gYC-MZUNxRtWPc5P6wS5WROaksnw6i6FQhHHiNa1O-FU3XdRNu5mSuUQqvvMKPV3eBzSYt4ofvVVRcxN-1jePdghqzWFyACOWsWSxzveFI0" alt="Minecraft SMP icon" width={40} height={40} className="rounded-lg" />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-white text-base font-bold leading-none">{serverName}</h1>
                            <p className="text-text-secondary text-xs font-normal mt-1">
                                <span className="text-emerald-400">Running</span> - 192.168.1.12:25565
                            </p>
                        </div>
                    </div>
                    <Link href="/my-servers" className="flex items-center gap-2 text-sm text-text-secondary hover:text-white px-2">
                        <ChevronLeft size={18} />
                        Back to all servers
                    </Link>
                </div>

                {/* Nav Items */}
                <nav className="flex flex-col gap-2 flex-1">
                    {menuItems.map((item) => {
                        const fullPath = `/server/${serverId}${item.href}`;
                        const isActive = pathname === fullPath;
                        return (
                            <Link key={item.href} href={fullPath} className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                              isActive
                                ? 'bg-card-dark text-white shadow-sm ring-1 ring-white/5'
                                : 'text-text-secondary hover:bg-card-dark hover:text-white'
                            )}>
                                <item.icon className={cn(
                                    "transition-colors",
                                    isActive ? 'text-primary' : 'text-text-secondary group-hover:text-white'
                                )} size={20} />
                                <p className="text-sm font-medium">{item.label}</p>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </aside>
    );
}
