
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
  Send,
  Terminal,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';
import { cn } from '@/lib/utils';

type LogEntry = {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'SERVER' | 'INPUT';
  message: string;
};

type ContainerStatus = 'Running' | 'Stopped' | 'Starting' | 'Building';

type Container = {
  id: string;
  name: string;
  node: string;
  nodeName: string;
  containerId: string;
  status: ContainerStatus;
};

const levelStyles = {
  INFO: 'text-blue-400',
  WARN: 'text-yellow-400',
  ERROR: 'text-red-400',
  SUCCESS: 'text-green-400',
  SERVER: 'text-purple-400',
  INPUT: 'text-gray-400',
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


const ConsolePage = ({ params }: { params: { id: string } }) => {
  const { isFirebaseEnabled } = useAppState();
  const firestore = isFirebaseEnabled ? useFirestore() : null;
  
  const containerRef = firestore ? doc(firestore, 'containers', params.id) : null;
  const [containerSnapshot, containerLoading, containerError] = useDoc(containerRef);
  
  const [container, setContainer] = useState<Container | null>(null);

  const nodeRef = useMemo(() => {
    if (firestore && container?.node) {
      return doc(firestore, 'nodes', container.node);
    }
    return null;
  }, [firestore, container?.node]);
  const [nodeSnapshot, nodeLoading, nodeError] = useDoc(nodeRef);
  const [nodeIp, setNodeIp] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState('');
  const [filter, setFilter] = useState('All');
  const [cpuLoad, setCpuLoad] = useState(0);
  const [ramUsage, setRamUsage] = useState({ current: 0, max: 0 });
  const [uptime, setUptime] = useState('0h 0m');

  const shellWsRef = useRef<WebSocket | null>(null);
  const healthWsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (containerSnapshot?.exists()) {
      const data = containerSnapshot.data() as DocumentData;
      setContainer({
        id: containerSnapshot.id,
        name: data.name,
        node: data.node,
        nodeName: data.nodeName,
        containerId: data.containerId,
        status: data.status,
      });
    }
  }, [containerSnapshot]);

  useEffect(() => {
    if (nodeSnapshot?.exists()) {
      setNodeIp(nodeSnapshot.data().ip);
    }
  }, [nodeSnapshot]);

  // WebSocket for health/stats
  useEffect(() => {
    if (!nodeIp || !container?.containerId) return;

    const connectHealth = () => {
      healthWsRef.current = new WebSocket(`wss://${nodeIp}/health`);

      healthWsRef.current.onopen = () => {
        console.log(`Health WS connected to ${nodeIp}`);
        healthWsRef.current?.send(JSON.stringify({ type: 'container_health', containerId: container.containerId }));
      };

      healthWsRef.current.onmessage = (event) => {
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
        }
      };

      healthWsRef.current.onclose = () => {
        console.log('Health WS disconnected');
        setTimeout(connectHealth, 5000);
      };

      healthWsRef.current.onerror = (err) => {
        console.error('Health WS error:', err);
        healthWsRef.current?.close();
      };
    };

    connectHealth();

    return () => healthWsRef.current?.close();
  }, [nodeIp, container?.containerId]);

  // WebSocket for shell/logs
  useEffect(() => {
    if (!nodeIp || !container?.containerId) return;

    const connectShell = () => {
      shellWsRef.current = new WebSocket(`wss://${nodeIp}/shell`);
      
      shellWsRef.current.onopen = () => {
        console.log(`Shell WS connected to ${nodeIp}`);
        shellWsRef.current?.send(JSON.stringify({ type: 'attach', containerId: container.containerId }));
        setLogs([{ time: new Date().toLocaleTimeString('en-GB'), level: 'SUCCESS', message: `Connected to container ${container.name}` }]);
      };

      shellWsRef.current.onmessage = (event) => {
        setLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString('en-GB'),
          level: 'INFO', // Or parse level from message
          message: event.data,
        }]);
      };

      shellWsRef.current.onclose = () => {
        console.log('Shell WS disconnected');
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString('en-GB'), level: 'ERROR', message: 'Disconnected from container.' }]);
        setTimeout(connectShell, 5000);
      };

      shellWsRef.current.onerror = (err) => {
        console.error('Shell WS error:', err);
        shellWsRef.current?.close();
      };
    };

    connectShell();

    return () => shellWsRef.current?.close();
  }, [nodeIp, container?.containerId, container?.name]);


  const handleSendCommand = () => {
    if (command.trim() && shellWsRef.current?.readyState === WebSocket.OPEN) {
      shellWsRef.current.send(JSON.stringify({ type: 'command', command: command + '\n' }));
      setLogs([...logs, {
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        level: 'INPUT',
        message: command,
      }]);
      setCommand('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  };

  const filteredLogs = logs.filter(
    (log) => filter === 'All' || log.level === filter.toUpperCase()
  );

  if (containerLoading || nodeLoading) {
    return <div className="text-center text-text-secondary">Loading console...</div>;
  }
  
  if (containerError || nodeError) {
    return <div className="text-center text-rose-400">Error loading data: {containerError?.message || nodeError?.message}</div>;
  }

  if (!container) {
    return <div className="text-center text-text-secondary">Container not found.</div>;
  }

  const statusConfig = statusStyles[container.status];


  return (
    <div className="flex flex-col gap-6">
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
                {container.status}
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
      <Card className="bg-card-dark border-border-dark flex flex-col flex-grow">
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-primary" />
            <CardTitle>Server Console</CardTitle>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-background-dark p-1">
            {['All', 'Info', 'Warn', 'Error'].map((level) => (
              <Button
                key={level}
                variant={filter === level ? 'default' : 'ghost'}
                size="sm"
                className="px-3 text-xs"
                onClick={() => setFilter(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-4 bg-background-dark/50 rounded-b-lg">
          <pre className="font-code text-sm whitespace-pre-wrap">
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex gap-4">
                <span className="text-text-secondary">[{log.time}]</span>
                <span className={cn('font-bold', levelStyles[log.level])}>
                  {log.level === 'INPUT' ? '>' : `[${log.level}]`}
                </span>
                <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
              </div>
            ))}
          </pre>
        </CardContent>
        <div className="flex items-center gap-2 p-4 border-t border-border-dark bg-card-dark rounded-b-lg">
          <span className="text-green-400 font-code">root@server:~#</span>
          <Input
            placeholder="Type a command..."
            className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-code"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button size="icon" className="bg-primary hover:bg-primary/90" onClick={handleSendCommand}>
            <Send className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConsolePage;

