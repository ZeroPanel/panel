import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 bg-background">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
