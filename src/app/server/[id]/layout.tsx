
import { ServerSidebar } from "@/components/user/server-sidebar";
import { UserHeader } from "@/components/user/header";

export default function ServerDetailLayout({ 
    children,
    params,
}: { 
    children: React.ReactNode,
    params: { id: string }
}) {
  return (
    <div className="flex h-screen w-full bg-background-dark">
        <ServerSidebar serverId={params.id} />
        <div className="flex flex-1 flex-col h-full overflow-hidden relative">
            <UserHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}
