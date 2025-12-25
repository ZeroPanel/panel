import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { NavMenu } from "./nav-menu";
import { Button } from "../ui/button";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/20 font-bold text-2xl text-cyan-400">
             G
          </div>
          <div>
            <p className="text-lg font-semibold">Admin Panel</p>
            <p className="text-xs text-muted-foreground">v2.4.0</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
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
