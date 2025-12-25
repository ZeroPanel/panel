import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const nodes = [
  { name: 'US-East-1', uptime: '14d 2h', status: 'Healthy' },
  { name: 'EU-Central', uptime: '4d 12h', status: 'Healthy' },
  { name: 'Asia-Pac-2', description: 'High Latency', status: 'Warning' },
  { name: 'US-West-Test', description: 'Connection Lost', status: 'Offline' },
];

const statusStyles: Record<string, { badge: "default" | "secondary" | "destructive" | "outline", dot: string }> = {
    Healthy: { badge: 'default', dot: 'bg-green-500' },
    Warning: { badge: 'secondary', dot: 'bg-yellow-500' },
    Offline: { badge: 'destructive', dot: 'bg-red-500' },
}

export function NodeHealth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Node Health</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {nodes.map((node) => (
          <div key={node.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("size-3 rounded-full", statusStyles[node.status].dot)} />
              <div>
                <p className="font-medium">{node.name}</p>
                <p className="text-sm text-muted-foreground">{node.uptime || node.description}</p>
              </div>
            </div>
            <Badge variant={statusStyles[node.status].badge}>{node.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
