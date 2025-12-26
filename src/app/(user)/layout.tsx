import { UserAppSidebar } from "@/components/user/app-sidebar";
import { UserHeader } from "@/components/user/header";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background-dark">
        <UserAppSidebar />
        <div className="flex flex-1 flex-col h-full overflow-hidden relative">
            <UserHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}
