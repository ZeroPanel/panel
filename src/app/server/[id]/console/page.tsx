

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
import '../../globals.css'
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
    
    if (wsRef.current) {
        return;
    }

    const wsUrl = `wss://${nodeIp}/containers/${container.containerId}`;
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setLogs(prev => [...prev, { type: 'system', content: 'WebSocket connection established.' }]);
        
        const healthPayload = JSON.stringify({ type: 'container_info' });
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
        setLogs(prev => [...prev, { type