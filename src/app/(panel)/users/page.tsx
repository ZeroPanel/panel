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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  Plus,
  ListFilter,
  UserPlus,
  Trash2,
  Pencil,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';


type UserStatus = 'Active' | 'Suspended' | 'Invited';
type UserRole = 'Admin' | 'User' | 'Viewer';

type User = {
  id: string;
  name:string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
};

const mockUsers: User[] = [
    { id: '1', name: 'Jane Admin', email: 'jane@admin.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFqs8x02h4bqjqFITqvQ6oe95Wc64U0tP8JdAhfpBlMLqPFsM7lHKNkKZsTnlDhQYo0rc5fgPL6juqwJI43y5Ym0n_l9aOsUvWRin9EzsYe3KQ7hTyl_GUCWxvzWHUPcgp9p4NpAaDWVJ0eA3lkZfsh-VmTrYO9azJs140aEo5EPoMfxUS0QUyVbem5z-zUENIQCQb8v9eL28NRrmbBx5b0NeaSCHvlLVxZwcwFJo7rqodG7jmoRcvBUBOr_O03tBB7on1U8uKteQ', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: '2', name: 'Alex Developer', email: 'alex@dev.co', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxQRnu5_uN8hohVObCkEAgX_GjB_DJhytHhSQpor2CNPmqrrAe6eITu9qEoeYuk1pa21apZYc-3Nd2_UqOGCo8t5nPbi2A_ABT2N9GtsNxaluR4xRtyhRZHpZ_w1BcttDu-97uJzyoyFMVIOvwtnjQLXDXWsD5JcJcmHk223CCazwauOSw-i9D-WMwp3ct4yAaikamnGwNiP05-eN1i95HhZmbxMTR-Mp73xGYe1HWUAWI5K4V1yhtycw2oA65NUYFbUMOntC-ryc', role: 'User', status: 'Active', lastLogin: '1 day ago' },
    { id: '3', name: 'Sam Viewer', email: 'sam@viewer.co', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSDZo22eSlq3jSAsVwd0q2G38V3UDf3152HnHFj98nKzSVTf42i0E1r7vWQAy3FqQJb1Lq7Jxt_40t2o0VzXnF9g_L3vY4Z0p_M_T8B_hF-v9A2Qk8iA-bM_N-N_N-N_N-N_N-N_N-N_N-N-w=s512-c-rp-mo-br100', role: 'Viewer', status: 'Suspended', lastLogin: '1 week ago' },
    { id: '4', name: 'New Member', email: 'new@member.co', avatar: '', role: 'User', status: 'Invited', lastLogin: 'Never' },
];

const statusStyles: Record<UserStatus, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Invited: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const roleStyles: Record<UserRole, string> = {
  Admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  User: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Viewer: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};


export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortOption, setSortOption] = useState('name-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    
    const filteredAndSortedUsers = useMemo(() => {
        return mockUsers
            .filter(user => {
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = user.name.toLowerCase().includes(searchLower);
                const emailMatch = user.email.toLowerCase().includes(searchLower);
                const roleMatch = roleFilter === 'All' || user.role === roleFilter;
                const statusMatch = statusFilter === 'All' || user.status === statusFilter;
                return (nameMatch || emailMatch) && roleMatch && statusMatch;
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
    }, [searchTerm, roleFilter, statusFilter, sortOption]);
    
    const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
    const paginatedUsers = filteredAndSortedUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const uniqueRoles = ['All', ...Array.from(new Set(mockUsers.map(u => u.role)))];
    const uniqueStatuses = ['All', ...Array.from(new Set(mockUsers.map(u => u.status)))];

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
              <BreadcrumbPage>Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-text-secondary mt-1">
              Manage all users, roles, and permissions in your organization.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button asChild>
              <Link href="#">
                <UserPlus size={20} className="mr-2" /> Invite User
              </Link>
            </Button>
          </div>
        </div>
      </div>

       <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={20}
          />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10 bg-card-dark border-border-dark h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-center h-12 bg-card-dark border-border-dark">
                      Filter by role
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                      {uniqueRoles.map(role => (
                          <DropdownMenuRadioItem key={role} value={role}>{role}</DropdownMenuRadioItem>
                      ))}
                  </DropdownMenuRadioGroup>
              </DropdownMenuContent>
          </DropdownMenu>

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
                      {uniqueStatuses.map(status => (
                          <DropdownMenuRadioItem key={status} value={status}>{status}</DropdownMenuRadioItem>
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
                      <DropdownMenuRadioItem value="lastLogin-asc">Last Login</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

       <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-sm text-text-secondary">{user.email}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                         <Badge variant="outline" className={cn('font-medium', roleStyles[user.role])}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn('font-medium', statusStyles[user.status])}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-5 w-5 text-text-secondary" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><Pencil className="mr-2" /> Edit User</DropdownMenuItem>
                                <DropdownMenuItem><EyeOff className="mr-2" /> Suspend</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10">
                                    <Trash2 className="mr-2" /> Delete User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-text-secondary h-24">
                        No users found. <Link href="#" className="text-primary hover:underline">Invite a user</Link> to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

        {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
            <div>Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users</div>
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
