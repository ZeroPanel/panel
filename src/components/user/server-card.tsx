
'use client'

import { Button } from "@/components/ui/button";
import { Play, RefreshCw, StopCircle, Terminal } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

type ServerStatus = "Running" | "Stopped" | "Building";

interface Server {
    id: string;
    name: string;
    ip: string;
    status: ServerStatus;
    image: string;
    cpuLoad: number;
    ramUsage: number;
    diskUsage: number;
    ramMax: number;
    ramCurrent: number;
    diskMax: number;
    diskCurrent: number;
}

const statusStyles: Record<ServerStatus, {
    dot: string;
    text: string;
    bg: string;
    border: string;
}> = {
    Running: {
        dot: "bg-emerald-500",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    Stopped: {
        dot: "bg-rose-500",
        text: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
    },
    Building: {
        dot: "bg-amber-500 animate-pulse",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
};

export function UserServerCard({ server }: { server: Server }) {
    const statusConfig = statusStyles[server.status];
    const ramUsagePercentage = server.ramMax > 0 ? (server.ramCurrent / server.ramMax) * 100 : 0;
    const diskUsagePercentage = server.diskMax > 0 ? (server.diskCurrent / server.diskMax) * 100 : 0;

    return (
        <div className="group flex flex-col bg-card-dark border border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg">
            <div className="p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`relative size-12 rounded-lg bg-cover bg-center shrink-0 shadow-inner ${server.status === 'Stopped' ? 'grayscale opacity-70' : ''}`}>
                             <Image src={server.image} alt={`${server.name} icon`} fill sizes="100vw" className="rounded-lg" />
                            <div className={`absolute -bottom-1 -right-1 size-3.5 ${statusConfig.dot} rounded-full border-2 border-card-dark`}></div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{server.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs font-mono text-text-secondary bg-background-dark/50 px-1.5 py-0.5 rounded">{server.ip}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md ${statusConfig.bg} border ${statusConfig.border} text-xs font-bold uppercase tracking-wide ${statusConfig.text}`}>
                        {server.status}
                    </div>
                </div>
                {/* Resources */}
                <div className="space-y-3 mt-1">
                    {/* CPU */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-text-secondary font-medium">
                            <span>CPU</span>
                            <span className={server.cpuLoad > 80 ? 'text-amber-400 font-bold' : 'text-white'}>{server.cpuLoad}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
                            <div className={`h-full ${server.cpuLoad > 80 ? 'bg-amber-500' : 'bg-emerald-500'} w-[${server.cpuLoad}%] rounded-full`}></div>
                        </div>
                    </div>
                    {/* RAM */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-text-secondary font-medium">
                            <span>RAM</span>
                            <span className="text-white">{server.ramCurrent.toFixed(1)} / {server.ramMax} GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
                            <div className={`h-full bg-primary w-[${ramUsagePercentage}%] rounded-full`}></div>
                        </div>
                    </div>
                    {/* Disk */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-text-secondary font-medium">
                            <span>Disk</span>
                            <span className="text-white">{server.diskCurrent} / {server.diskMax} GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
                            <div className={`h-full bg-purple-500 w-[${diskUsagePercentage}%] rounded-full`}></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Actions Footer */}
            <div className="mt-auto p-3 bg-background-dark/30 border-t border-border-dark flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Start" disabled={server.status !== 'Stopped'}>
                        <Play size={20} className="fill-current"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Stop" disabled={server.status === 'Stopped'}>
                        <StopCircle size={20} className="fill-current"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Restart" disabled={server.status === 'Stopped'}>
                        <RefreshCw size={20} />
                    </Button>
                </div>
                <Button asChild variant="outline" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-dark border border-border-dark hover:bg-primary hover:border-primary text-text-secondary hover:text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={server.status === 'Stopped'}>
                    <Link href={`/server/${server.id}/console`}>
                      <Terminal size={16} />
                      Console
                    </Link>
                </Button>
            </div>
        </div>
    );
}
