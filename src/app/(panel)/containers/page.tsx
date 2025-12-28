
'use client';

import React, { useState, useMemo } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, ListFilter } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';
import { ContainerCard } from '@/components/containers/container-card';

type ContainerStatus = 'Running' | 'Stopped' | 'Starting';

export type Container = {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  node: string;
  nodeName?: string;
  cpuUsage: number;
  ramUsage: number;
  containerId?: string;
};

function transformFirestoreData(doc: DocumentData): Container {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    image: data.image || '',
    status: data.status || 'Stopped',
    node: data.node || '',
    nodeName: data.nodeName || '',
    cpuUsage: data.cpuUsage || 0,
    ramUsage: data.ramUsage || 0,
    containerId: data.containerId || '',
  };
}

export default function ContainersPage() {
  const { isFirebaseEnabled } = useAppState();
  const firestore = isFirebaseEnabled ? useFirestore() : null;
  const containersCollection = firestore ? collection(firestore, 'containers') : null;
  const [snapshot, loading, error] = useCollection(containersCollection);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');
  
  const allContainers = useMemo(() => {
    if (!isFirebaseEnabled || !snapshot) return [];
    return snapshot.docs.map(transformFirestoreData);
  }, [isFirebaseEnabled, snapshot]);

  const filteredAndSortedContainers = useMemo(() => {
    return allContainers
      .filter((container) => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = container.name.toLowerCase().includes(searchLower);
        const imageMatch = container.image.toLowerCase().includes(searchLower);
        const statusMatch = statusFilter === 'All' || container.status === statusFilter;
        return (nameMatch || imageMatch) && statusMatch;
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
  }, [allContainers, searchTerm, statusFilter, sortOption]);

  const uniqueStatuses: ('All' | ContainerStatus)[] = ['All', 'Running', 'Stopped', 'Starting'];

  if (isFirebaseEnabled && error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto overflow-x-hidden p-4 md:p-0">
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
              <BreadcrumbPage>Containers</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Containers</h1>
            <p className="text-text-secondary mt-1">Manage your Docker container instances.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/containers/create">
                <Plus size={20} className="mr-2" /> Deploy Container
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <Input
            placeholder="Search by name or image..."
            className="pl-10 bg-card-dark border-border-dark h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-center h-12 bg-card-dark border-border-dark">
                Filter by status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                {uniqueStatuses.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {status}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-center h-12 bg-card-dark border-border-dark">
                <ListFilter size={18} className="mr-2" /> Sort
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

      {loading && <p className="text-center text-text-secondary">Loading containers...</p>}
      
      {!loading && filteredAndSortedContainers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedContainers.map((container) => (
                <ContainerCard key={container.id} container={container} />
            ))}
        </div>
      )}

      {!loading && filteredAndSortedContainers.length === 0 && (
        <div className="text-center text-text-secondary py-16">
          <p>No containers found.</p>
          <Button variant="link" asChild><Link href="/containers/create">Deploy your first container</Link></Button>
        </div>
      )}
    </div>
  );
}
