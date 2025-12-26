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
  PaginationEllipsis,
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
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type NodeStatus = 'Online' | 'Offline' | 'Maint.';

type Node = {
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

const nodes: Node[] = [
  {
    name: 'Node-Alpha-01',
    ip: '192.168.1.101',
    location: { city: 'New York', flag: '🇺🇸' },
    status: 'Online',
    cpu: 45,
    ram: { current: 12, max: 32 },
    disk: { current: '240', unit: 'GB' },
  },
  {
    name: 'Node-Beta-02',
    ip: '10.0.0.45',
    location: { city: 'Frankfurt', flag: '🇩🇪' },
    status: 'Online',
    cpu: 88,
    ram: { current: 28, max: 32 },
    disk: { current: '120', unit: 'GB' },
  },
  {
    name: 'Node-Gamma-03',
    ip: '192.168.1.55',
    location: { city: 'Tokyo', flag: '🇯🇵' },
    status: 'Offline',
    cpu: null,
    ram: null,
    disk: null,
  },
  {
    name: 'Node-Delta-04',
    ip: '172.16.0.22',
    location: { city: 'Singapore', flag: '🇸🇬' },
    status: 'Maint.',
    cpu: 2,
    ram: { current: 4, max: 64 },
    disk: { current: '500', unit: 'GB' },
  },
  {
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
};

const filterPills = [
  { label: 'All', active: true },
  { label: 'Online', count: 12, status: 'Online' as NodeStatus },
  { label: 'Offline', count: 2, status: 'Offline' as NodeStatus },
  { label: 'Maintenance', count: 1, status: 'Maint.' as NodeStatus },
];

export default function NodesPage() {
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
          <Button>
            <Plus size={20} className="mr-2" /> Create New Node
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
            {nodes.map((node, index) => {
              const statusConfig = statusStyles[node.status];
              return (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium text-white">{node.name}</div>
                    <div className="text-sm text-text-secondary font-mono">
                      {node.ip}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{node.location.flag}</span>
                      <span className="text-text-secondary">
                        {node.location.city}
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
                      {node.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {node.cpu !== null ? (
                        <>
                          <span
                            className={cn(
                              'w-8 text-right font-medium',
                              node.cpu > 80
                                ? 'text-amber-400'
                                : 'text-white'
                            )}
                          >
                            {node.cpu}%
                          </span>
                          <Progress
                            value={node.cpu}
                            className={cn(
                              'h-1.5 w-24 bg-background-dark [&>div]:bg-primary',
                              node.cpu > 80 && '[&>div]:bg-amber-500'
                            )}
                          />
                        </>
                      ) : (
                        <span className="text-text-secondary">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {node.ram ? (
                        <>
                          <span className="text-white font-medium w-24">
                            {node.ram.current}GB / {node.ram.max}GB
                          </span>
                          <Progress
                            value={(node.ram.current / node.ram.max) * 100}
                            className="h-1.5 w-24 bg-background-dark [&>div]:bg-purple-500"
                          />
                        </>
                      ) : (
                        <span className="text-text-secondary">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {node.disk ? (
                      node.disk.isUsage ? (
                         <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'w-8 text-right font-medium',
                                node.disk.current > 90
                                  ? 'text-rose-400'
                                  : 'text-white'
                              )}
                            >
                              {node.disk.current}%
                            </span>
                            <Progress
                              value={node.disk.current as number}
                              className={cn(
                                'h-1.5 w-24 bg-background-dark [&>div]:bg-primary',
                                (node.disk.current as number) > 90 && '[&>div]:bg-rose-500'
                              )}
                            />
                         </div>
                      ) : (
                        <span className="text-white font-medium">
                          {node.disk.current}
                          {node.disk.unit}
                        </span>
                      )
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5 text-text-secondary" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <div>Showing 1-5 of 15 nodes</div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
