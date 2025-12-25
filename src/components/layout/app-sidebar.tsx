import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { NavMenu } from "./nav-menu";
import { Button } from "../ui/button";
import Image from 'next/image';

export function AppSidebar() {
  return (
    <Sidebar className="p-4">
        <div className="flex flex-col gap-6 h-full">
            <SidebarHeader className="p-0">
                <div className="flex items-center gap-3 px-2">
                    <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeIP1OfuYynZuIG2U534iJLst-SjEEU54wdJs_rLhkbijdmhaDzE8fZ5INnEPBmPA4kVQNEKoA2BGAMRnFVGScuduF1azC5dPFse_PCZg_V3xXc8gbp92x8CivvAdxKDVGzgsXGeDiW7249N8b8RmUCYFgF6s9ChdGHORuZj5G0TexqN1RnGYDu7RBdQI2lSvAMkcz65R-52CGnC-iXjOXIBDHwr4W68XuUOae6Eb-J0uOoyC38KCZC3JMlNiqXvwRlJXluxJvfmg"
                        alt="Admin Panel Logo"
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-surface-dark"
                        data-ai-hint="logo"
                    />
                    <div>
                        <p className="text-base font-bold leading-tight">Admin Panel</p>
                        <p className="text-xs text-text-secondary font-normal">v2.4.0</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-0 flex-1">
                <NavMenu />
            </SidebarContent>
            <SidebarFooter className="p-0">
                <Button variant="ghost" className="w-full justify-start text-text-secondary hover:text-danger">
                    <LogOut className="mr-3" />
                    Log Out
                </Button>
            </SidebarFooter>
        </div>
    </Sidebar>
  );
}
