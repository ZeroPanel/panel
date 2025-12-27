'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  MoreVertical,
  Search,
  Plus,
  MapPin,
  ListFilter,
  Wrench,
  Power,
  PowerOff,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useCollection } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';

type NodeStatus = 'Online' | 'Offline' | 'Maint.' | 'Connecting';

type Node = {
  id: string;
  name: string;
  ip: string;
  location: {
    city: string;
    flag: string;
  };
  status: NodeStatus;
  cpu: number | null;
  ram: {
    current: number;
    max: number;
  } | null;
  disk: {
    current: number | string;
    max?: number;
    unit: 'GB' | 'TB';
    isUsage?: boolean;
  } | null;
};

const mockNodes: Node[] = [
  {
    id: 'mock-1',
    name: 'Node-Alpha-01',
    ip: '192.168.1.101',
    location: { city: 'New York', flag: '🇺🇸' },
    status: 'Online',
    cpu: 45,
    ram: { current: 12, max: 32 },
    disk: { current: '240', unit: 'GB' },
  },
  {
    id: 'mock-2',
    name: 'Node-Beta-02',
    ip: '10.0.0.45',
    location: { city: 'Frankfurt', flag: '🇩🇪' },
    status: 'Online',
    cpu: 88,
    ram: { current: 28, max: 32 },
    disk: { current: '120', unit: 'GB' },
  },
  {
    id: 'mock-3',
    name: 'Node-Gamma-03',
    ip: '192.168.1.55',
    location: { city: 'Tokyo', flag: '🇯🇵' },
    status: 'Offline',
    cpu: null,
    ram: null,
    disk: null,
  },
  {
    id: 'mock-4',
    name: 'Node-Delta-04',
    ip: '172.16.0.22',
    location: { city: 'Singapore', flag: '🇸🇬' },
    status: 'Maint.',
    cpu: 2,
    ram: { current: 4, max: 64 },
    disk: { current: '500', unit: 'GB' },
  },
  {
    id: 'mock-5',
    name: 'Node-Epsilon-05',
    ip: '192.168.2.200',
    location: { city: 'London', flag: '🇬🇧' },
    status: 'Online',
    cpu: 12,
    ram: { current: 16, max: 32 },
    disk: { current: 98, isUsage: true, unit: 'GB' },
  },
];

const statusStyles: Record<
  NodeStatus,
  { icon: React.ReactNode; text: string; bg: string; dot: string }
> = {
  Online: {
    icon: <Power size={14} />,
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  Offline: {
    icon: <PowerOff size={14} />,
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    dot: 'bg-rose-500',
  },
  'Maint.': {
    icon: <Wrench size={14} />,
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-500',
  },
  Connecting: {
    icon: <Power size={14} />,
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-500 animate-pulse',
  },
};

const filterPills = [
  { label: 'All', active: true },
  { label: 'Online', count: 12, status: 'Online' as NodeStatus },
  { label: 'Offline', count: 2, status: 'Offline' as NodeStatus },
  { label: 'Maintenance', count: 1, status: 'Maint.' as NodeStatus },
];

function transformFirestoreData(doc: DocumentData): Node {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name || '',
        ip: data.ip || '',
        location: {
            city: data.location?.city || '',
            flag: data.location?.flag || '',
        },
        status: data.status || 'Offline',
        cpu: data.cpu,
        ram: data.ram,
        disk: data.disk,
    };
}

const NodeDataRow = ({ node }: { node: Node }) => {
  const [currentNode, setCurrentNode] = useState<Node>(node);
  const [status, setStatus] = useState<NodeStatus>('Connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      // Prevent further events from firing
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!node.ip || wsRef.current) return;
    
    cleanup();
    setStatus('Connecting');

    const ws = new WebSocket(`wss://${node.ip}/health`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected to ${node.ip}`);
      retryCountRef.current = 0; // Reset retry count on successful connection
      
      const sendHealthCheck = () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'health' }));
        }
      };

      sendHealthCheck(); // Initial health check
      healthCheckIntervalRef.current = setInterval(sendHealthCheck, 30000);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'health_response') {
                if (data.status === 'healthy') {
                    setStatus('Online');
                } else if (data.status === 'maintenance') {
                    setStatus('Maint.');
                } else {
                    setStatus('Offline');
                }
                setCurrentNode(prev => ({
                    ...prev,
                    cpu: data.cpu?.usage ?? data.memory?.usage,
                    ram: data.memory ? {
                        current: parseFloat(((data.memory.total - data.memory.free) / (1024 ** 3)).toFixed(1)),
                        max: parseFloat((data.memory.total / (1024 ** 3)).toFixed(1))
                    } : prev.ram,
                }));
            }
        } catch (e) {
            console.error("Failed to parse health check response", e);
        }
    };

    const handleCloseOrError = () => {
      // Only proceed if this WebSocket is still the current one
      if (wsRef.current !== ws) {
        return;
      }
      console.log(`WebSocket disconnected from ${node.ip}`);
      cleanup();
      setStatus('Offline');

      retryCountRef.current += 1;
      const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000); // Exponential backoff up to 30s
      
      console.log(`Retrying connection to ${node.ip} in ${delay}ms...`);
      retryTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onclose = handleCloseOrError;
    ws.onerror = handleCloseOrError;
  }, [node.ip, cleanup]);
  
  useEffect(() => {
    if (!node.ip) {
      setStatus('Offline');
      return;
    }
    connect();
    // This return function is the cleanup function for the useEffect hook.
    // It's called when the component unmounts.
    return () => {
      cleanup();
    };
  }, [node.ip, connect, cleanup]);

  const statusConfig = statusStyles[status];
  const isOnline = status === 'Online' || status === 'Maint.';

  const ramCurrent = (isOnline && currentNode.ram) ? currentNode.ram.current : 0;
  const ramMax = (isOnline && currentNode.ram) ? currentNode.ram.max : 0;
  const ramUsage = ramMax > 0 ? (ramCurrent / ramMax) * 100 : 0;
  
  const cpuUsage = (isOnline && currentNode.cpu !== null) ? currentNode.cpu : null;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-white">{currentNode.name}</div>
        <div className="text-sm text-text-secondary font-mono">
          {currentNode.ip}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentNode.location.flag}</span>
          <span className="text-text-secondary">
            {currentNode.location.city}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div
            className={cn(
            'flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium w-fit',
            statusConfig.bg,
            statusConfig.text
            )}
        >
            <span
            className={cn('size-2 rounded-full', statusConfig.dot)}
            />
            {status}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {cpuUsage !== null ? (
            <>
              <span
                className={cn(
                  'w-8 text-right font-medium',
                  cpuUsage > 80
                    ? 'text-amber-400'
                    : 'text-white'
                )}
              >
                {cpuUsage}%
              </span>
              <Progress
                value={cpuUsage}
                className={cn(
                  'h-1.5 w-24 bg-background-dark [&>div]:bg-primary',
                  cpuUsage > 80 && '[&>div]:bg-amber-500'
                )}
              />
            </>
          ) : (
            <span className="text-text-secondary">{isOnline ? '-' : '0'}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {isOnline && currentNode.ram ? (
            <>
              <span className="text-white font-medium w-24">
                {ramCurrent.toFixed(1)}GB / {ramMax.toFixed(1)}GB
              </span>
              <Progress
                value={ramUsage}
                className="h-1.5 w-24 bg-background-dark [&>div]:bg-purple-500"
              />
            </>
          ) : (
             <span className="text-text-secondary">{isOnline ? '-' : '0'}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isOnline && currentNode.disk ? (
          currentNode.disk.isUsage ? (
             <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-8 text-right font-medium',
                    currentNode.disk.current > 90
                      ? 'text-rose-400'
                      : 'text-white'
                  )}
                >
                  {currentNode.disk.current}%
                </span>
                <Progress
                  value={currentNode.disk.current as number}
                  className={cn(
                    'h-1.5 w-24 bg-background-dark [&>div]:bg-primary',
                    (currentNode.disk.current as number) > 90 && '[&>div]:bg-rose-500'
                  )}
                />
             </div>
          ) : (
            <span className="text-white font-medium">
              {currentNode.disk.current}
              {currentNode.disk.unit}
            </span>
          )
        ) : (
           <span className="text-text-secondary">{isOnline ? '-' : '0'}</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-text-secondary" />
        </Button>
      </TableCell>
    </TableRow>
  );
};


export default function NodesPage() {
  const { isFirebaseEnabled } = useAppState();
  const firestore = isFirebaseEnabled ? useFirestore() : null;
  const nodesCollection = firestore ? collection(firestore, 'nodes') : null;
  const [snapshot, loading, error] = useCollection(nodesCollection);
  const [currentPage, setCurrentPage] = useState(1);
  const nodesPerPage = 10;
  
  const allNodes = isFirebaseEnabled 
    ? snapshot?.docs.map(transformFirestoreData) || []
    : mockNodes;

  const totalPages = Math.ceil(allNodes.length / nodesPerPage);
  const paginatedNodes = allNodes.slice(
      (currentPage - 1) * nodesPerPage,
      currentPage * nodesPerPage
  );
    
  if (isFirebaseEnabled && error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nodes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Nodes</h1>
            <p className="text-text-secondary mt-1">
              Manage and monitor your server fleet
            </p>
          </div>
          <Button asChild>
            <Link href="/nodes/create">
              <Plus size={20} className="mr-2" /> Create New Node
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={20}
          />
          <Input
            placeholder="Search nodes by name, IP, or tag..."
            className="pl-10 bg-card-dark border-border-dark h-12"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            variant="outline"
            className="w-full md:w-auto justify-center h-12 bg-card-dark border-border-dark"
          >
            <MapPin size={18} className="mr-2" />
            Filter by location
          </Button>
          <Button
            variant="outline"
            className="w-full md:w-auto justify-center h-12 bg-card-dark border-border-dark"
          >
            <ListFilter size={18} className="mr-2" />
            Sort
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filterPills.map((pill) => (
          <Button
            key={pill.label}
            variant={pill.active ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full h-auto px-4 py-2 text-sm',
              !pill.active && 'bg-card-dark border-border-dark'
            )}
          >
            {pill.status && (
              <span className="flex items-center gap-2 mr-2">
                <span
                  className={cn(
                    'size-2 rounded-full',
                    statusStyles[pill.status].dot
                  )}
                />
              </span>
            )}
            {pill.label}
            {pill.count && (
              <span className="ml-2 text-text-secondary">{pill.count}</span>
            )}
          </Button>
        ))}
      </div>

      {/* Nodes Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>RAM</TableHead>
              <TableHead>Disk</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { (isFirebaseEnabled && loading) && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-text-secondary">Loading nodes from Firestore...</TableCell>
                </TableRow>
            )}
            { !loading && paginatedNodes.length > 0 && paginatedNodes.map((node) => (
                <NodeDataRow key={node.id} node={node} />
            ))}
             { !loading && paginatedNodes.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-text-secondary h-24">
                        No nodes found. <Link href="/nodes/create" className="text-primary hover:underline">Add nodes</Link> by creating new ones.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
            <div>Showing {paginatedNodes.length} of {allNodes.length} nodes</div>
            <Pagination>
            <PaginationContent>
                <PaginationItem>
                <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                    }}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink 
                            href="#" 
                            isActive={currentPage === i + 1}
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(i + 1)
                            }}
                        >
                        {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                    }}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                />
                </PaginationItem>
            </PaginationContent>
            </Pagination>
        </div>
      )}
    </div>
  );
}
