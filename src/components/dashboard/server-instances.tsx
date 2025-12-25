import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Filter, Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const instances = [
  {
    initials: 'MC',
    name: 'Minecraft',
    type: 'Survival',
    id: '#8291',
    status: 'Online',
    ip: '192.168.1.10:25565',
    cpu: 45,
    ram: 60,
  },
  {
    initials: 'RS',
    name: 'Rust PVP',
    type: 'Node',
    id: '#2931',
    status: 'Offline',
    ip: '192.168.1.12:28015',
    cpu: 0,
    ram: 0,
  },
  {
    initials: 'CS',
    name: 'CS2',
    type: 'Competitive',
    id: '#2531',
    status: 'Online',
    ip: '192.168.1.15:27015',
    cpu: 82,
    ram: 25,
  },
];

const statusStyles: Record<string, { text: string, dot: string }> = {
    Online: { text: 'text-green-400', dot: 'bg-green-500' },
    Offline: { text: 'text-red-400', dot: 'bg-red-500' },
}

export function ServerInstances() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Server Instances</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Instance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instance Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>CPU Usage</TableHead>
              <TableHead>RAM Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.map((instance) => (
              <TableRow key={instance.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted font-bold">
                        {instance.initials}
                    </div>
                    <div>
                        <p className="font-medium">{instance.name}</p>
                        <p className="text-sm text-muted-foreground">{instance.type} <span className="text-xs">{instance.id}</span></p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", statusStyles[instance.status].dot)}></div>
                    <span className={cn(statusStyles[instance.status].text)}>{instance.status}</span>
                  </div>
                </TableCell>
                <TableCell>{instance.ip}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={instance.cpu} className="h-2 [&>*]:bg-yellow-500" />
                        <span>{instance.cpu}%</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={instance.ram} className="h-2" />
                        <span>{instance.ram}%</span>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">...</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
