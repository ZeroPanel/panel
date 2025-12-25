import { mockServers } from "@/lib/mock-data";
import { ServerCard } from "@/components/dashboard/server-card";

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {mockServers.map((server) => (
        <ServerCard key={server.id} server={server} />
      ))}
    </div>
  );
}
