
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  HardDrive,
  MemoryStick,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useCollection } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddLocationDialog } from '@/components/nodes/add-location-dialog';

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
    icon: <Power size={14} className="animate-pulse" />,
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-500 animate-pulse',
  },
};

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

const NodeDataRow = React.memo(({ node }: { node: Node }) => {
  const [currentNode, setCurrentNode] = useState<Node>(node);
  const [status, setStatus] = useState<NodeStatus>('Connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!node.ip) {
      setStatus('Offline');
      return;
    }
  
    if (wsRef.current) {
        return;
    }

    const connect = () => {
        try {
            const ws = new WebSocket(`wss://${node.ip}/health`);
            wsRef.current = ws;

            setStatus('Connecting');

            ws.onopen = () => {
                console.log(`WebSocket connected to ${node.ip}`);
                const healthPayload = JSON.stringify({ type: 'health' });
                ws.send(healthPayload);

                if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(healthPayload);
                    }
                }, 30000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'health_response') {
                        let newStatus: NodeStatus = 'Offline';
                        if(data.maintenance?.enabled) {
                            newStatus = 'Maint.';
                        } else if (data.status === 'healthy') {
                            newStatus = 'Online';
                        }
                        
                        setStatus(newStatus);
                        
                        setCurrentNode(prev => ({
                            ...prev,
                            cpu: data.memory?.usage,
                            ram: data.memory ? {
                                current: parseFloat(((data.memory.total - data.memory.free) / (1024 ** 3)).toFixed(1)),
                                max: parseFloat((data.memory.total / (1024 ** 3)).toFixed(1))
                            } : prev.ram,
                            disk: data.storage ? {
                                current: data.storage.percent,
                                isUsage: true,
                                unit: 'GB',
                            } : prev.disk,
                        }));
                    } else if (data.type === 'maintenance_update') {
                        const newStatus = data.maintenance?.enabled ? 'Maint.' : 'Online';
                        setStatus(newStatus);
                    }
                } catch (e) {
                    console.error("Failed to parse health check response", e);
                }
            };
            
            ws.onclose = () => {
                console.log(`WebSocket disconnected from ${node.ip}.`);
                setStatus('Offline');
                if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
                 // Optional: implement reconnect logic here if desired
            };

            ws.onerror = (error) => {
                console.error(`WebSocket error for ${node.ip}:`, error);
                setStatus('Offline');
                if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
                ws.close();
            };

        } catch (e) {
            console.error("Failed to create WebSocket:", e);
            setStatus('Offline');
        }
    }
    
    connect();

    return () => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };
  }, [node.ip, node.id]);

  const statusConfig = statusStyles[status];
  const isOnline = status === 'Online' || status === 'Maint.';

  const ramCurrent = (isOnline && currentNode.ram) ? currentNode.ram.current : 0;
  const ramMax = (isOnline && currentNode.ram) ? currentNode.ram.max : 0;
  const ramUsage = ramMax > 0 ? (ramCurrent / ramMax) * 100 : 0;
  
  const diskUsage = (isOnline && currentNode.disk && currentNode.disk.isUsage) ? (currentNode.disk.current as number) : null;


  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-white">{currentNode.name}</div>
        <div className="text-sm text-text-secondary font-mono">
          {currentNode.ip}
        </div>
      </TableCell>
      <TableCell className='hidden md:table-cell'>
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
          {isOnline && currentNode.ram ? (
            <>
              <div className="hidden lg:flex items-center gap-3 w-[120px]">
                <MemoryStick size={16} className='text-purple-400' />
                <Progress
                  value={ramUsage}
                  className="h-1.5 w-full bg-background-dark [&>div]:bg-purple-500"
                />
              </div>
              <span className="text-white font-medium text-xs w-[80px]">
                {ramCurrent.toFixed(1)}GB / {ramMax.toFixed(1)}GB
              </span>
            </>
          ) : (
             <span className="text-text-secondary">{isOnline ? '-' : '0'}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {diskUsage !== null ? (
             <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-3 w-[120px]">
                    <HardDrive size={16} className='text-blue-400' />
                    <Progress
                        value={diskUsage}
                        className={cn(
                            'h-1.5 w-full bg-background-dark [&>div]:bg-blue-500',
                            diskUsage > 90 && '[&>div]:bg-rose-500'
                        )}
                    />
                </div>
                <span
                  className={cn(
                    'w-8 text-right font-medium text-xs',
                    diskUsage > 90
                      ? 'text-rose-400'
                      : 'text-white'
                  )}
                >
                  {diskUsage}%
                </span>
             </div>
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
});

NodeDataRow.displayName = 'NodeDataRow';


export default function NodesPage() {
  const { isFirebaseEnabled } = useAppState();
  const firestore = isFirebaseEnabled ? useFirestore() : null;
  const nodesCollection = firestore ? collection(firestore, 'nodes') : null;
  const [snapshot, loading, error] = useCollection(nodesCollection);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');
  
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  const nodesPerPage = 10;
  
  const allNodes = useMemo(() => isFirebaseEnabled 
    ? snapshot?.docs.map(transformFirestoreData) || []
    : mockNodes, [isFirebaseEnabled, snapshot]);

  const filteredAndSortedNodes = useMemo(() => {
    return allNodes
      .filter(node => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = node.name.toLowerCase().includes(searchLower);
        const ipMatch = node.ip.toLowerCase().includes(searchLower);
        const statusMatch = statusFilter === 'All' || node.status === statusFilter;
        const locationMatch = locationFilter === 'All' || node.location.city === locationFilter;
        return (nameMatch || ipMatch) && statusMatch && locationMatch;
      })
      .sort((a, b) => {
        const [key, direction] = sortOption.split('-');
        let comparison = 0;
        const valA = (a as any)[key];
        const valB = (b as any)[key];

        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        
        return direction === 'desc' ? comparison * -1 : comparison;
      });
  }, [allNodes, searchTerm, statusFilter, locationFilter, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedNodes.length / nodesPerPage);
  const paginatedNodes = filteredAndSortedNodes.slice(
      (currentPage - 1) * nodesPerPage,
      currentPage * nodesPerPage
  );

  const filterPills = useMemo(() => {
    const onlineCount = allNodes.filter(n => n.status === 'Online').length;
    const offlineCount = allNodes.filter(n => n.status === 'Offline').length;
    const maintCount = allNodes.filter(n => n.status === 'Maint.').length;
    
    return [
      { label: 'All', status: 'All' },
      { label: 'Online', count: onlineCount, status: 'Online' },
      { label: 'Offline', count: offlineCount, status: 'Offline' },
      { label: 'Maintenance', count: maintCount, status: 'Maint.' },
    ];
  }, [allNodes]);


  const locations = useMemo(() => ['All', ...new Set(allNodes.map(node => node.location.city))], [allNodes]);
    
  if (isFirebaseEnabled && error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
    <div className="flex flex-col gap-8 max-w-7xl mx-auto overflow-x-hidden p-4 md:p-0">
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
          <div className='flex items-center gap-2'>
            <Button variant="outline" onClick={() => setIsAddLocationOpen(true)}>
                <MapPin size={20} className="mr-2" /> Add New Location
            </Button>
            <Button asChild>
              <Link href="/nodes/create">
                <Plus size={20} className="mr-2" /> Create New Node
              </Link>
            </Button>
          </div>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-center h-12 bg-card-dark border-border-dark">
                      <MapPin size={18} className="mr-2" />
                      Filter by location
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Location</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={locationFilter} onValueChange={setLocationFilter}>
                      {locations.map(loc => (
                          <DropdownMenuRadioItem key={loc} value={loc}>{loc}</DropdownMenuRadioItem>
                      ))}
                  </DropdownMenuRadioGroup>
              </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-center h-12 bg-card-dark border-border-dark">
                      <ListFilter size={18} className="mr-2" />
                      Sort
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                      <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="status-asc">Status</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filterPills.map((pill) => (
          <Button
            key={pill.label}
            variant={statusFilter === pill.status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(pill.status)}
            className={cn(
              'rounded-full h-auto px-4 py-2 text-sm',
              statusFilter !== pill.status && 'bg-card-dark border-border-dark'
            )}
          >
            {pill.status && pill.status !== 'All' && (
              <span className="flex items-center gap-2 mr-2">
                <span
                  className={cn(
                    'size-2 rounded-full',
                    statusStyles[pill.status as NodeStatus]?.dot
                  )}
                />
              </span>
            )}
            {pill.label}
            {pill.count !== undefined && (
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
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>RAM</TableHead>
              <TableHead>Disk</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { (isFirebaseEnabled && loading) && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-secondary">Loading nodes from Firestore...</TableCell>
                </TableRow>
            )}
            { !loading && paginatedNodes.length > 0 && paginatedNodes.map((node) => (
                <NodeDataRow key={node.id} node={node} />
            ))}
             { !loading && paginatedNodes.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-secondary h-24">
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
            <div>Showing {paginatedNodes.length} of {filteredAndSortedNodes.length} nodes</div>
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
    <AddLocationDialog isOpen={isAddLocationOpen} onOpenChange={setIsAddLocationOpen} />
    </>
  );
}
