import type { Server } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, MemoryStick, Play, RefreshCw, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerCardProps {
  server: Server;
}

const statusVariantMap: Record<Server["status"], "default" | "secondary" | "destructive"> = {
  Running: "default",
  Stopped: "secondary",
  Error: "destructive",
};

const statusColorMap: Record<Server["status"], string> = {
    Running: "bg-green-500",
    Stopped: "bg-yellow-500",
    Error: "bg-red-500",
};


export function ServerCard({ server }: ServerCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="truncate">{server.name}</CardTitle>
            <div className="flex items-center gap-2">
                <div className={cn("size-2 rounded-full", statusColorMap[server.status])}></div>
                <Badge variant={statusVariantMap[server.status]}>{server.status}</Badge>
            </div>
        </div>
        <CardDescription>ID: {server.id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="size-4" />
              <span>CPU</span>
            </div>
            <span>{server.cpu} ({server.cpuUsage}%)</span>
          </div>
          <Progress value={server.cpuUsage} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MemoryStick className="size-4" />
              <span>RAM</span>
            </div>
            <span>{server.memory} ({server.ramUsage}%)</span>
          </div>
          <Progress value={server.ramUsage} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="size-4" />
              <span>Disk</span>
            </div>
            <span>{server.disk} ({server.diskUsage}%)</span>
          </div>
          <Progress value={server.diskUsage} />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" disabled={server.status !== 'Stopped'}>
          <Play /> Start
        </Button>
        <Button variant="outline" size="sm" disabled={server.status !== 'Running'}>
          <StopCircle /> Stop
        </Button>
        <Button variant="outline" size="sm" className="ml-auto" disabled={server.status !== 'Running'}>
          <RefreshCw /> Restart
        </Button>
      </CardFooter>
    </Card>
  );
}
