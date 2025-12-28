
'use client';

import type { Container } from '@/app/(panel)/containers/page';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Box, Cpu, MemoryStick, Play, RefreshCw, StopCircle, Server, Trash2 } from "lucide-react";
import Link from 'next/link';

type ContainerStatus = 'Running' | 'Stopped' | 'Starting';

const statusStyles: Record<ContainerStatus, {
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
    Starting: {
        dot: "bg-amber-500 animate-pulse",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
};

export function ContainerCard({ container }: { container: Container }) {
    const statusConfig = statusStyles[container.status];

    return (
        <div className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg">
            <div className="p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`relative size-12 rounded-lg bg-card-dark flex items-center justify-center shrink-0 shadow-inner`}>
                             <Box size={28} className="text-primary" />
                            <div className={`absolute -bottom-1 -right-1 size-3.5 ${statusConfig.dot} rounded-full border-2 border-card-dark`}></div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{container.name}</h3>
                            <p className="text-xs font-mono text-text-secondary mt-1">{container.image}</p>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md ${statusConfig.bg} border ${statusConfig.border} text-xs font-bold uppercase tracking-wide ${statusConfig.text}`}>
                        {container.status}
                    </div>
                </div>
                {/* Resources */}
                <div className="space-y-3 mt-1">
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                            <Cpu size={16} />
                            <span>CPU</span>
                        </div>
                        <span className={cn(container.cpuUsage > 80 ? 'text-amber-400' : 'text-white', "font-mono")}>{container.cpuUsage}%</span>
                    </div>
                     <div className="flex items-center justify-between text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                            <MemoryStick size={16} />
                            <span>Memory</span>
                        </div>
                        <span className="text-white font-mono">{container.ramUsage} MB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                            <Server size={16} />
                            <span>Node</span>
                        </div>
                        <span className="text-white font-mono">{container.nodeName}</span>
                    </div>
                </div>
            </div>
            {/* Actions Footer */}
            <div className="mt-auto p-3 bg-background/30 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Start" disabled={container.status !== 'Stopped'}>
                        <Play size={20} className="fill-current"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Stop" disabled={container.status === 'Stopped'}>
                        <StopCircle size={20} className="fill-current"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Restart" disabled={container.status === 'Stopped'}>
                        <RefreshCw size={20} />
                    </Button>
                </div>
                <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-rose-500/20 text-text-secondary hover:text-rose-400" title="Delete">
                    <Trash2 size={18} />
                </Button>
            </div>
        </div>
    );
}
