import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Gauge, LogOut } from "lucide-react";
import { NavMenu } from "./nav-menu";
import { Button } from "../ui/button";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
             <Gauge className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Admin Panel</p>
            <p className="text-xs text-muted-foreground">v2.4.0</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMenu />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 size-4" />
            Log Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
