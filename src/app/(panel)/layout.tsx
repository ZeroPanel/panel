import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background">
      <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-1 flex-col h-full overflow-hidden relative">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                  {children}
              </main>
          </div>
      </SidebarProvider>
    </div>
  );
}
