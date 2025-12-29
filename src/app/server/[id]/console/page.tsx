

'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Play,
  RefreshCw,
  StopCircle,
  Cpu,
  Clock,
  MemoryStick,
  Terminal,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';
import { cn } from '@/lib/utils';
import 'xterm/css/xterm.css';
import type { Terminal as XtermTerminal } from 'xterm';
import '../../../globals.css'
import { CustomTerminalView, type Log } from '@/components/console/custom-terminal-view';

type ContainerStatus = 'Running' | 'Stopped' | 'Starting' | 'Building';

type Container = {
  id: string;
  name: string;
  node: string;
  nodeName: string;
  containerId: string;
  status: ContainerStatus;
};

const statusStyles: Record<ContainerStatus, {
    dot: string;
    text: string;
}> = {
    Running: { dot: "bg-emerald-500", text: "text-emerald-400" },
    Stopped: { dot: "bg-rose-500", text: "text-rose-400" },
    Starting: { dot: "bg-amber-500", text: "text-amber-400" },
    Building: { dot: "bg-amber-500", text: "text-amber-400" },
};

const ConsolePage = ({ params: { id } }: { params: { id: string } }) => {
  const { isFirebaseEnabled } = useAppState();
  const firestore = useFirestore();
  const containerId = id;
  
  const containerRef = useMemo(() => 
    firestore && containerId ? doc(firestore, 'containers', containerId) : null, 
    [firestore, containerId]
  );
  const [containerSnapshot, containerLoading, containerError] = useDoc(containerRef);
  
  const [container, setContainer] = useState<Container | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ContainerStatus>('Starting');


  const nodeRef = useMemo(() => {
    if (firestore && container?.node) {
      return doc(firestore, 'nodes', container.node);
    }
    return null;
  }, [firestore, container?.node]);
  const [nodeSnapshot, nodeLoading, nodeError] = useDoc(nodeRef);
  const [nodeIp, setNodeIp] = useState<string | null>(null);

  const [cpuLoad, setCpuLoad] = useState(0);
  const [ramUsage, setRamUsage] = useState({ current: 0, max: 0 });
  const [uptime, setUptime] = useState('0h 0m');
  const [logs, setLogs] = useState<Log[]>([{type: 'system', content: 'Attempting to connect to container...'}]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const healthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (containerSnapshot?.exists()) {
      const data = containerSnapshot.data() as DocumentData;
      const initialStatus = data.status || 'Starting';
      setContainer({
        id: containerSnapshot.id,
        name: data.name,
        node: data.node,
        nodeName: data.nodeName,
        containerId: data.containerId,
        status: initialStatus,
      });
      setCurrentStatus(initialStatus);
    }
  }, [containerSnapshot]);

  useEffect(() => {
    if (nodeSnapshot?.exists()) {
      setNodeIp(nodeSnapshot.data().ip);
    }
  }, [nodeSnapshot]);

  // WebSocket for health/stats and logs
  useEffect(() => {
    if (!nodeIp || !container?.containerId) {
        return;
    };

    const wsUrl = `wss://${nodeIp}/container/${container.containerId}`;
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setLogs(prev => [...prev, { type: 'system', content: 'WebSocket connection established.' }]);
        
        const healthPayload = JSON.stringify({ type: 'container_health' });
        wsRef.current?.send(healthPayload);
        healthIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current?.send(healthPayload);
          }
        }, 5000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'container_health_response') {
            setCpuLoad(Math.round(data.cpu.usage));
            const ramCurrent = data.memory.usage / (1024 * 1024); // MB
            const ramMax = data.memory.limit / (1024 * 1024); // MB
            setRamUsage({ current: ramCurrent, max: ramMax });
            
            const uptimeSeconds = data.uptime;
            const d = Math.floor(uptimeSeconds / (3600*24));
            const h = Math.floor(uptimeSeconds % (3600*24) / 3600);
            const m = Math.floor(uptimeSeconds % 3600 / 60);
            setUptime(`${d > 0 ? `${d}d ` : ''}${h}h ${m}m`);

            const newStatus = data.status === 'running' ? 'Running' : 'Stopped';
            if (newStatus !== currentStatus) {
              setCurrentStatus(newStatus);
            }
          } else if (data.type === 'container_exec_output') {
              setLogs(prev => [...prev, { type: 'output', content: data.data }]);
          } else if (data.log) {
              setLogs(prev => [...prev, { type: 'log', content: data.log }]);
          } else if (data.type === 'container_status') {
            const newStatus = data.status === 'online' ? 'Running' : 'Stopped';
            if (newStatus !== currentStatus) {
                setCurrentStatus(newStatus);
            }
          }
        } catch(e) {
          if(typeof event.data === 'string') {
              setLogs(prev => [...prev, { type: 'log', content: event.data }]);
          }
        }
      };

      wsRef.current.onclose = () => {
        setLogs(prev => [...prev, { type: 'system', content: 'WebSocket disconnected. Attempting to reconnect in 5 seconds...', error: true }]);
        if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
        setCurrentStatus('Stopped');
        setTimeout(connect, 5000);
      };

      wsRef.current.onerror = (err) => {
        console.error('WS error:', err);
        setLogs(prev => [...prev, { type: 'system', content: 'WebSocket connection error.', error: true }]);
        setCurrentStatus('Stopped');
        wsRef.current?.close();
      };
    };

    connect();

    return () => {
        if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
        if (wsRef.current) {
          wsRef.current.close();
        }
    }
  }, [nodeIp, container?.containerId, currentStatus]);
  
  const handleSendCommand = (command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && command) {
        const payload = {
            type: 'container_exec',
            command: command + '\n'
        };
        setLogs(prev => [...prev, { type: 'input', content: command }]);
        wsRef.current.send(JSON.stringify(payload));
    } else {
        console.warn("WebSocket not open or command is empty.");
        setLogs(prev => [...prev, { type: 'system', content: 'Cannot send command. WebSocket not connected.', error: true }]);
    }
  };

  if (containerLoading || nodeLoading) {
    return <div className="text-center text-text-secondary">Loading console...</div>;
  }
  
  if (containerError || nodeError) {
    return <div className="text-center text-rose-400">Error loading data: {containerError?.message || nodeError?.message}</div>;
  }

  if (!container) {
    return <div className="text-center text-text-secondary">Container not found.</div>;
  }

  const statusConfig = statusStyles[currentStatus];


  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/my-servers">Servers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{container.name}</BreadcrumbPage>
              </BreadcrumbItem>
               <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Console</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2 mt-2">
            <h1 className="text-2xl font-bold text-white">{container.name}</h1>
             <div className={cn("px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5", statusConfig.text)}>
                <span className={cn("size-1.5 rounded-full", statusConfig.dot)}></span>
                {currentStatus}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400">
            <Play className="size-4 mr-2" />
            Start
          </Button>
          <Button variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-400">
            <RefreshCw className="size-4 mr-2" />
            Restart
          </Button>
          <Button variant="outline" className="bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-400">
            <StopCircle className="size-4 mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card-dark border-border-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">CPU Load</CardTitle>
            <Cpu className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cpuLoad}%</div>
          </CardContent>
        </Card>
        <Card className="bg-card-dark border-border-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">RAM Usage</CardTitle>
            <MemoryStick className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ramUsage.current.toFixed(0)} MB <span className="text-sm text-text-secondary">/ {ramUsage.max.toFixed(0)} MB</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card-dark border-border-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Uptime</CardTitle>
            <Clock className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptime}</div>
          </CardContent>
        </Card>
      </div>

      {/* Server Console */}
      <div className="flex flex-col flex-grow h-full bg-card-dark border-border-dark rounded-lg">
        <CardHeader className="flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-primary" />
            <CardTitle>Server Console</CardTitle>
          </div>
        </CardHeader>
        <CustomTerminalView 
          logs={logs}
          onCommand={handleSendCommand}
        />
      </div>
    </div>
  );
};

export default ConsolePage;
