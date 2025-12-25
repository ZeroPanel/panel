import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Filter, Plus, Terminal, RefreshCw, StopCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const instances = [
  {
    initials: 'MC',
    name: 'Minecraft Survival',
    type: 'Survival',
    id: '#8291',
    status: 'Online',
    ip: '192.168.1.10:25565',
    cpu: 45,
    ram: 60,
  },
  {
    initials: 'RS',
    name: 'Rust PVP Node',
    type: 'Node',
    id: '#2931',
    status: 'Offline',
    ip: '192.168.1.12:28015',
    cpu: 0,
    ram: 0,
  },
  {
    initials: 'CS',
    name: 'CS2 Competitive',
    type: 'Competitive',
    id: '#9921',
    status: 'Online',
    ip: '192.168.1.15:27015',
    cpu: 82,
    ram: 25,
  },
];

const statusStyles: Record<string, { text: string, dot: string, border: string, bg:string }> = {
    Online: { text: 'text-success', dot: 'bg-success', border: 'border-success/20', bg: 'bg-success/10' },
    Offline: { text: 'text-destructive', dot: 'bg-destructive', border: 'border-destructive/20', bg: 'bg-destructive/10' },
}

export function ServerInstances() {
  return (
    <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-white text-xl font-bold leading-tight">Server Instances</h3>
            <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-[#2c4e5e] text-white text-sm font-medium rounded-lg transition-colors border-white/5">
                    <Filter className="text-[18px]" /> Filter
                </Button>
                <Button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-primary/20">
                    <Plus className="text-[20px]" /> New Instance
                </Button>
            </div>
        </div>
        <div className="bg-secondary border border-white/5 rounded-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow className="bg-background/50 border-b-white/5">
                            <TableHead className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Instance Name</TableHead>
                            <TableHead className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Status</TableHead>
                            <TableHead className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">IP Address</TableHead>
                            <TableHead className="px-6 py-4 w-48 text-xs uppercase tracking-wider font-semibold">CPU Usage</TableHead>
                            <TableHead className="px-6 py-4 w-48 text-xs uppercase tracking-wider font-semibold">RAM Usage</TableHead>
                            <TableHead className="px-6 py-4 text-right text-xs uppercase tracking-wider font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                        {instances.map((instance) => (
                        <TableRow key={instance.id} className="group hover:bg-white/5 transition-colors border-none">
                            <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded bg-background flex items-center justify-center text-white font-bold border border-white/10">
                                        {instance.initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{instance.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {instance.id}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", statusStyles[instance.status].bg, statusStyles[instance.status].text, statusStyles[instance.status].border)}>
                                    <span className={cn("size-1.5 rounded-full", statusStyles[instance.status].dot)}></span>
                                    {instance.status}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-muted-foreground font-mono">{instance.ip}</TableCell>
                            <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", instance.cpu > 75 ? 'bg-warning' : 'bg-primary')} style={{ width: `${instance.cpu}%` }}></div>
                                    </div>
                                    <span className={cn("text-xs w-8 text-right", instance.cpu > 75 ? 'text-warning font-bold' : 'text-white')}>{instance.cpu}%</span>
                                </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: `${instance.ram}%` }}></div>
                                    </div>
                                    <span className="text-xs text-white w-8 text-right">{instance.ram}%</span>
                                </div>
                            </TableCell>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    {instance.status === 'Online' ? (
                                        <>
                                            <Button variant="ghost" size="icon" className="size-8 flex items-center justify-center rounded bg-background hover:bg-white/10 text-white transition-colors" title="Console">
                                                <Terminal className="text-[18px]" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8 flex items-center justify-center rounded bg-background hover:bg-white/10 text-white transition-colors" title="Restart">
                                                <RefreshCw className="text-[18px]" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8 flex items-center justify-center rounded bg-destructive/10 hover:bg-destructive text-destructive hover:text-white transition-colors" title="Stop">
                                                <StopCircle className="text-[18px]" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button size="sm" className="px-3 h-8 flex items-center gap-1 text-xs font-bold uppercase tracking-wide rounded bg-success hover:bg-success/80 text-white transition-colors" title="Start Server">
                                            <Play className="text-[16px]" /> Start
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="px-6 py-4 border-t border-white/5 bg-background/30 flex items-center justify-between text-xs text-muted-foreground">
                <p>Showing 3 of 12 instances</p>
                <div className="flex gap-2">
                    <Button variant="ghost" className="px-2 py-1 rounded hover:bg-white/5 h-auto" disabled>Previous</Button>
                    <Button variant="ghost" className="px-2 py-1 rounded hover:bg-white/5 text-white h-auto">Next</Button>
                </div>
            </div>
        </div>
    </section>
  );
}
