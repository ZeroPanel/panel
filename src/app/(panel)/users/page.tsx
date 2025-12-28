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
  ListFilter,
  UserPlus,
  Trash2,
  Pencil,
  EyeOff,
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
import { useFirestore, useCollection } from '@/firebase';
import { useAppState } from '@/components/app-state-provider';
import { collection, DocumentData } from 'firebase/firestore';
import { AddUserDialog } from '@/components/users/add-user-dialog';

type UserStatus = 'Active' | 'Suspended' | 'Invited';
type UserRole = 'Admin' | 'User' | 'Viewer';

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
};

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

function transformFirestoreData(doc: DocumentData): User {
  const data = doc.data();
  // Format lastLogin if it exists
  const lastLogin = data.lastLogin?.toDate 
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(data.lastLogin.toDate()) 
    : 'Never';

  return {
    id: doc.id,
    name: data.name || 'No Name',
    email: data.email || 'No Email',
    avatar: data.avatar || '',
    role: data.role || 'Viewer',
    status: data.status || 'Invited',
    lastLogin,
  };
}

export default function UsersPage() {
  const { isFirebaseEnabled } = useAppState();
  const firestore = isFirebaseEnabled ? useFirestore() : null;
  const usersCollection = firestore ? collection(firestore, 'users') : null;
  const [snapshot, loading, error] = useCollection(usersCollection);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const usersPerPage = 10;
  
  const allUsers = useMemo(() => {
    if (!isFirebaseEnabled || !snapshot) return [];
    return snapshot.docs.map(transformFirestoreData);
  }, [isFirebaseEnabled, snapshot]);


  const filteredAndSortedUsers = useMemo(() => {
    return allUsers
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
  }, [allUsers, searchTerm, roleFilter, statusFilter, sortOption]);
  
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const uniqueRoles = ['All', ...Array.from(new Set(allUsers.map(u => u.role)))];
  const uniqueStatuses = ['All', ...Array.from(new Set(allUsers.map(u => u.status)))];

  return (
    <>
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
              <Button onClick={() => setAddUserDialogOpen(true)}>
                <UserPlus size={20} className="mr-2" /> Add User
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
              {loading && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-text-secondary">Loading users...</TableCell>
                </TableRow>
              )}
              {error && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-rose-400">Error: {error.message}</TableCell>
                </TableRow>
              )}
              {!loading && !error && paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
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
              )) : !loading && !error && (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center text-text-secondary h-24">
                          No users found. <button onClick={() => setAddUserDialogOpen(true)} className="text-primary hover:underline">Add a user</button> to get started.
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
      <AddUserDialog isOpen={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen} />
    </>
  );
}
