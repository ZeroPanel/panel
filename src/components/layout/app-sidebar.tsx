import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Rocket } from "lucide-react";
import { NavMenu } from "./nav-menu";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
             <Rocket className="size-5" />
          </div>
          <span className="text-lg font-semibold">Nebula Panel</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMenu />
      </SidebarContent>
      <SidebarFooter>
        {/* Can add user profile or other items here later */}
      </SidebarFooter>
    </Sidebar>
  );
}
