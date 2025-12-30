
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
  Unplug,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';
import { cn } from '@/lib/utils';
import { CustomTerminalView, type Log } from '@/components/console/custom-terminal-view';

type ContainerStatus = 'Running' | 'Stopped' | 'Starting' | 'Building';
type ConnectionStatus = 'Connecting' | 'Connected' | 'Disconnected' | 'Error';


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

const ConsolePage = ({ params }: { params: { id: string } }) => {
  const { isFirebaseEnabled } = useAppState();
  const firestore = useFirestore();
  const containerId = params.id;
  
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

  const [nodeSnapshot] = useDoc(nodeRef);
  const [nodeIp, setNodeIp] = useState<string | null>(null);

  const [cpuLoad, setCpuLoad] = useState(0);
  const [ramUsage, setRamUsage] = useState({ current: 0, max: 0 });
  const [uptime, setUptime] = useState('0h 0m');
  const [logs, setLogs] = useState<Log[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionStatus>('Connecting');
  
  const wsRef = useRef<WebSocket | null>(null);
  
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

  const connect = useCallback(() => {
    if (!nodeIp || !container?.containerId || (wsRef.current && wsRef.current.readyState < 2)) {
        return;
    }
    
    setLogs([{ type: 'system', content: 'Attempting to connect to container...' }]);
    setConnectionState('Connecting');
    
    const wsUrl = `wss://${nodeIp}/containers/${container.containerId}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setConnectionState('Connected');
      setLogs(prev => [...prev, { type: 'system', content: 'WebSocket connection established.' }]);
      
      const healthPayload = JSON.stringify({ type: 'container_info' });
      wsRef.current?.send(healthPayload);
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
              setLogs(prev => [...prev, { type: 'system', content: `Container status changed to ${newStatus}` }]);
          }
        }
      } catch(e) {
        if(typeof event.data === 'string') {
            setLogs(prev => [...prev, { type: 'log', content: event.data }]);
        }
      }
    };

    wsRef.current.onclose = (event) => {
      setConnectionState('Disconnected');
      let reason = `Code: ${event.code}.`;
      if (event.code === 1005) {
        reason += ' No status code was provided. This indicates an abnormal closure. Check server logs or network status.';
      } else if (event.code === 1006) {
        reason += ' The connection was closed abnormally (e.g., server process killed or network issue).';
      }
      setLogs(prev => [...prev, { type: 'system', content: `WebSocket disconnected. ${reason}`, error: true }]);
      wsRef.current = null;
    };

    wsRef.current.onerror = (err) => {
      setConnectionState('Error');
      console.error('WS error:', err);
      setLogs(prev => [...prev, { type: 'system', content: 'WebSocket connection error. Check the browser console and network tab for details.', error: true }]);
      wsRef.current = null;
    };

  }, [nodeIp, container?.containerId]);

  useEffect(() => {
    // Ensure we only connect when we have the necessary info and are not already connected/connecting.
    if (nodeIp && container?.containerId && (!wsRef.current || wsRef.current.readyState > 1)) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [nodeIp, container, connect]);


  const handleSendCommand = (command: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'container_exec', command: command + '\n' }));
      setLogs(prev => [...prev, { type: 'input', content: command }]);
    } else {
      setLogs(prev => [...prev, { type: 'system', content: 'Cannot send command. WebSocket not connected.', error: true }]);
    }
  };

  const handleControlClick = (action: 'start' | 'stop' | 'restart') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: action }));
        if (action === 'start' || action === 'restart') {
            setCurrentStatus('Starting');
        }
    } else {
        setLogs(prev => [...prev, { type: 'system', content: 'Cannot send control action. WebSocket not connected.', error: true }]);
    }
  };

  const statusConfig = statusStyles[currentStatus];

  if(containerLoading) {
      return <div>Loading...</div>
  }
  
  if(containerError) {
      return <div>Error: {containerError.message}</div>
  }

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Header */}
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/my-servers">My Servers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{container?.name || 'Console'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
            <div className={cn('size-3 rounded-full', statusConfig.dot)}></div>
            <h1 className={cn('text-2xl font-bold text-white', statusConfig.text)}>{currentStatus}</h1>
            <div className="hidden sm:flex items-center gap-6 text-sm text-text-secondary pl-6 border-l border-border-dark ml-3">
              <div className="flex items-center gap-2"><Cpu size={16}/> {cpuLoad.toFixed(0)}%</div>
              <div className="flex items-center gap-2"><MemoryStick size={16}/> {ramUsage.current.toFixed(0)} / {ramUsage.max.toFixed(0)} MB</div>
              <div className="flex items-center gap-2"><Clock size={16}/> Uptime: {uptime}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(connectionState === 'Disconnected' || connectionState === 'Error') && (
              <Button variant="outline" onClick={connect}>
                <Unplug className="mr-2" size={18} />
                Reconnect
              </Button>
            )}
            <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => handleControlClick('start')} disabled={currentStatus === 'Running' || currentStatus === 'Starting'}>
              <Play size={18} /> Start
            </Button>
            <Button variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" onClick={() => handleControlClick('restart')} disabled={currentStatus !== 'Running'}>
              <RefreshCw size={18} /> Restart
            </Button>
            <Button variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => handleControlClick('stop')} disabled={currentStatus !== 'Running'}>
              <StopCircle size={18} /> Stop
            </Button>
          </div>
        </div>
      </div>

      {/* Terminal View */}
      <div className='bg-card-dark border border-border-dark rounded-xl flex-grow flex flex-col'>
         <div className='flex items-center p-3 border-b border-border-dark'>
            <Terminal className='text-primary size-5 mr-3'/>
            <p className='font-bold text-white'>Console</p>
         </div>
         <CustomTerminalView logs={logs} onCommand={handleSendCommand} />
      </div>
    </div>
  );
};

export default ConsolePage;
