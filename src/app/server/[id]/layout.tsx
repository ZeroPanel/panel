
'use client';

import { ServerSidebar } from "@/components/user/server-sidebar";
import { UserHeader } from "@/components/user/header";
import { usePathname } from "next/navigation";

export default function ServerDetailLayout({ 
    children,
    params,
}: { 
    children: React.ReactNode,
    params: { id: string }
}) {
  const pathname = usePathname();
  const isTerminalPage = pathname.endsWith('/terminal');

  if (isTerminalPage) {
    return (
        <div className="h-screen w-full bg-background-dark">
            {children}
        </div>
    );
  }
  
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
