
'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Container } from '@/app/(panel)/containers/page';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Box, Cpu, MemoryStick, Play, RefreshCw, StopCircle, Server, Trash2, Terminal } from "lucide-react";
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

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
    const [currentStatus, setCurrentStatus] = useState<ContainerStatus>(container.status);
    const healthWsRef = useRef<WebSocket | null>(null);
    const firestore = useFirestore();

    const nodeRef = firestore ? doc(firestore, 'nodes', container.node) : null;
    const [nodeSnapshot] = useDoc(nodeRef);
    const [nodeIp, setNodeIp] = useState<string | null>(null);
    
    useEffect(() => {
        if (nodeSnapshot?.exists()) {
          setNodeIp(nodeSnapshot.data().ip);
        }
    }, [nodeSnapshot]);

    useEffect(() => {
        if (!nodeIp || !container.containerId) return;

        const wsUrl = `wss://${nodeIp}/containers/${container.containerId}`;
        
        // Prevent re-creating the connection if it's already open or connecting
        if (healthWsRef.current && healthWsRef.current.readyState < 2) {
            return;
        }

        const ws = new WebSocket(wsUrl);
        healthWsRef.current = ws;

        ws.onopen = () => {
            console.log(`Status WS connected for ${container.name} at ${wsUrl}`);
            ws.send(JSON.stringify({ type: 'container_info' }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'container_status' && data.status) {
                     const newStatus = data.status === 'running' ? 'Running' : 'Stopped';
                     setCurrentStatus(newStatus);
                }
            } catch (e) {
                 console.error("Failed to parse status message:", e);
            }
        };

        ws.onclose = () => {
            console.log(`Status WS disconnected for ${container.name}`);
            healthWsRef.current = null; // Clear the ref on close
        };

        ws.onerror = (err) => {
            console.error('Status WS error:', err);
        };
        
        return () => {
            if (healthWsRef.current) {
                healthWsRef.current.close();
            }
        };

    }, [nodeIp, container.containerId, container.name]);

    const handleControlClick = (event: 'start' | 'stop' | 'restart') => {
        if (healthWsRef.current && healthWsRef.current.readyState === WebSocket.OPEN) {
            healthWsRef.current.send(JSON.stringify({ event }));
            // Optimistically update status for better UX
            if (event === 'start' || event === 'restart') {
                setCurrentStatus('Starting');
            }
        } else {
            console.warn('WebSocket is not connected. Cannot send command.');
            // Optional: You could add a toast notification here to inform the user.
        }
    };


    const statusConfig = statusStyles[currentStatus];

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
                        {currentStatus}
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
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Start" disabled={currentStatus !== 'Stopped'} onClick={() => handleControlClick('start')}>
                        <Play size={20} className="fill-current"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Stop" disabled={currentStatus === 'Stopped'} onClick={() => handleControlClick('stop')}>
                        <StopCircle size={20} className="fill-current"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors disabled:text-text-secondary disabled:bg-white/5 disabled:cursor-not-allowed" title="Restart" disabled={currentStatus === 'Stopped'} onClick={() => handleControlClick('restart')}>
                        <RefreshCw size={20} />
                    </Button>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-rose-500/20 text-text-secondary hover:text-rose-400" title="Delete">
                        <Trash2 size={18} />
                    </Button>
                     <Button asChild variant="outline" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-dark border border-border-dark hover:bg-primary hover:border-primary text-text-secondary hover:text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentStatus === 'Stopped'}>
                        <Link href={`/server/${container.id}/console`}>
                        <Terminal size={16} />
                        Console
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
