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
        {/* The sidebar is now part of the page content to allow for a file-manager specific layout */}
        <div className="flex flex-1 flex-col h-full overflow-hidden relative">
            <UserHeader />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    </div>
  );
}
