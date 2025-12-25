import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const nodes = [
  { name: 'US-East-1', uptime: '14d 2h', status: 'Healthy' },
  { name: 'EU-Central', uptime: '4d 12h', status: 'Healthy' },
  { name: 'Asia-Pac-2', description: 'High Latency', status: 'Warning' },
  { name: 'US-West-Test', description: 'Connection Lost', status: 'Offline' },
];

const statusStyles: Record<string, { badge: string, dot: string, shadow: string }> = {
    Healthy: { badge: 'text-success bg-success/10', dot: 'bg-success', shadow: 'shadow-[0_0_8px_rgba(11,218,87,0.5)]' },
    Warning: { badge: 'text-warning bg-warning/10', dot: 'bg-warning', shadow: 'shadow-[0_0_8px_rgba(234,179,8,0.5)]' },
    Offline: { badge: 'text-destructive bg-destructive/10', dot: 'bg-destructive', shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
}

export function NodeHealth() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="mb-4">Node Health</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 overflow-y-auto pr-2 flex-1">
        {nodes.map((node) => (
          <div key={node.name} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/5">
            <div className="flex items-center gap-3">
              <div className={cn("size-2.5 rounded-full", statusStyles[node.status].dot, statusStyles[node.status].shadow)} />
              <div>
                <p className="text-sm font-semibold text-white">{node.name}</p>
                <p className="text-xs text-muted-foreground">{node.uptime || node.description}</p>
              </div>
            </div>
            <span className={cn("text-xs font-mono px-2 py-1 rounded", statusStyles[node.status].badge)}>{node.status}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
