'use client';

import React, { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  Archive,
  ChevronRight,
  Clock,
  CloudUpload,
  Copy,
  Database,
  File as FileIcon,
  FilePlus,
  FileText,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  Grid,
  HardDrive,
  Home,
  List,
  MoreVertical,
  Move,
  Network,
  Pencil,
  Power,
  Search,
  Server,
  Settings,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';

type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'archive' | 'config' | 'log' | 'world';
  size: string;
  permissions: string;
  modified: string;
  icon: React.ReactNode;
  selected?: boolean;
};

const initialFiles: FileItem[] = [
  {
    id: '1',
    name: 'jei-1.18.2.jar',
    type: 'archive',
    size: '2.1 MB',
    permissions: '-rw-r--r--',
    modified: 'Just now',
    icon: <Archive className="text-amber-400" size={24} />,
  },
  {
    id: '2',
    name: 'mod-config.json',
    type: 'config',
    size: '12 KB',
    permissions: '-rw-rw-r--',
    modified: '2 hours ago',
    icon: <FileIcon className="text-purple-400" size={24} />,
  },
  {
    id: '3',
    name: 'readme.txt',
    type: 'file',
    size: '1 KB',
    permissions: '-rw-r--r--',
    modified: '1 day ago',
    icon: <FileText className="text-blue-400" size={24} />,
  },
  {
    id: '4',
    name: 'optifine_HD_U_G8.jar',
    type: 'archive',
    size: '5.8 MB',
    permissions: '-rwxr-xr-x',
    modified: '3 days ago',
    icon: <Archive className="text-emerald-400" size={24} />,
  },
  {
    id: '5',
    name: 'crash-report-2023-10-27.txt',
    type: 'log',
    size: '45 KB',
    permissions: '-rw-r--r--',
    modified: '1 week ago',
    icon: <FileText className="text-rose-400" size={24} />,
  },
  {
    id: '6',
    name: 'old-config.bak',
    type: 'file',
    size: '12 KB',
    permissions: '-rw-r--r--',
    modified: '2 months ago',
    icon: <FileIcon className="text-gray-500" size={24} />,
    selected: true,
  },
];

const directoryFolders = [
    { name: 'mods', icon: <FolderIcon className="text-primary fill-primary/20" /> },
    { name: 'config', icon: <FolderIcon className="text-amber-400 fill-amber-400/20" /> },
    { name: 'logs', icon: <FolderIcon className="text-gray-500 fill-gray-500/20" /> },
    { name: 'world', icon: <FolderIcon className="text-emerald-400 fill-emerald-400/20" /> },
    { name: 'libraries', icon: <FolderIcon className="text-gray-500 fill-gray-500/20" /> },
]

export default function FileManagerPage({ params }: { params: { id: string }}) {
  const [files, setFiles] = useState(initialFiles);

  const selectedFiles = files.filter((file) => file.selected);
  const isAllSelected = files.length > 0 && selectedFiles.length === files.length;

  const handleSelectAll = (checked: boolean) => {
    setFiles(files.map((file) => ({ ...file, selected: checked })));
  };

  const handleSelect = (id: string, checked: boolean) => {
    setFiles(files.map((file) => (file.id === id ? { ...file, selected: checked } : file)));
  };

  return (
    <div className="flex h-full">
      <aside className="w-64 bg-background-dark border-r border-border-dark flex-col hidden lg:flex">
        <div className="p-4 border-b border-border-dark">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Directory Tree</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              className="w-full bg-card-dark border-none rounded-lg py-1.5 pl-9 pr-3 text-sm focus:ring-1 focus:ring-primary placeholder-gray-500"
              placeholder="Filter folders..."
              type="text"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-0.5">
            <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 justify-start text-sm w-full">
              <FolderOpen size={20} className="text-gray-500" /> Root
            </Button>
            <div className="pl-4 border-l border-border-dark ml-3 mt-1 space-y-0.5">
                {directoryFolders.map(folder => (
                    <Button key={folder.name} variant={folder.name === 'mods' ? 'secondary' : 'ghost'} className={`w-full justify-start text-sm font-medium ${folder.name === 'mods' && 'text-primary'}`}>
                        <div className='flex gap-2 items-center'>
                           {folder.icon}
                           {folder.name}
                        </div>
                    </Button>
                ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border-dark bg-card-dark/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-text-secondary">Disk Usage</span>
            <span className="text-xs font-bold text-white">45%</span>
          </div>
          <div className="h-1.5 w-full bg-border-dark rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[45%]" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">22.5 GB used</span>
            <span className="text-[10px] text-gray-500">50 GB total</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col border-b border-border-dark bg-background-dark z-10 shrink-0">
          <div className="flex items-center px-4 md:px-6 py-3 gap-2 text-sm overflow-x-auto">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="#" className="flex items-center gap-1"><Home size={16}/> Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/my-servers">server-01</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1">
                    <FolderIcon className="text-primary fill-primary/20" size={16}/>
                    mods
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-6 pb-4 gap-4">
            <div className="flex items-center gap-2">
              <Button>
                <CloudUpload size={20} />
                Upload
              </Button>
              <div className="h-6 w-px bg-border-dark mx-1" />
              <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-card-dark"><FolderPlus size={22} /></Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-card-dark"><FilePlus size={22} /></Button>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  className="w-full bg-card-dark border border-border-dark rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-primary placeholder-gray-500"
                  placeholder="Search in /mods..."
                />
              </div>
              <div className="hidden sm:flex bg-card-dark p-1 rounded-lg border border-border-dark">
                <Button size="icon" variant="secondary" className="h-8 w-8 text-primary"><List size={18}/></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white"><Grid size={18}/></Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto relative">
          <Table>
            <TableHeader className="sticky top-0 bg-background-dark/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Permissions</TableHead>
                <TableHead className="hidden lg:table-cell">Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id} data-state={file.selected ? 'selected' : ''}>
                  <TableCell className="text-center">
                    <Checkbox 
                        checked={file.selected}
                        onCheckedChange={(checked) => handleSelect(file.id, Boolean(checked))}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {file.icon}
                      <div className="flex flex-col">
                        <span className="font-medium text-white cursor-pointer hover:underline">{file.name}</span>
                        <span className="sm:hidden text-xs text-text-secondary">{file.size} • {file.modified}</span>
                      </div>
                    </div>
                  </TableCell>
                  <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{file.size}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden md:table-cell">{file.permissions}</td>
                  <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{file.modified}</td>
                  <td className="px-4 py-3 text-right">
                    {file.selected ? (
                       <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-500/10">
                              <Trash2 size={20}/>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-primary/20">
                              <MoreVertical size={20}/>
                          </Button>
                       </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-primary/20">
                        <MoreVertical size={20} />
                      </Button>
                    )}
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedFiles.length > 0 && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card-dark border border-border-dark text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-20 animate-in slide-in-from-bottom-4 duration-300">
                <span className="text-sm font-medium border-r border-gray-600 pr-6">{selectedFiles.length} item{selectedFiles.length > 1 && 's'} selected</span>
                <div className="flex items-center gap-4">
                    <button className="flex flex-col items-center gap-1 group">
                        <Archive size={20} className="text-text-secondary group-hover:text-white transition-colors" />
                        <span className="text-[10px] text-text-secondary group-hover:text-white transition-colors">Archive</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                        <Move size={20} className="text-text-secondary group-hover:text-white transition-colors" />
                        <span className="text-[10px] text-text-secondary group-hover:text-white transition-colors">Move</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                        <Trash2 size={20} className="text-text-secondary group-hover:text-red-400 transition-colors" />
                        <span className="text-[10px] text-text-secondary group-hover:text-red-400 transition-colors">Delete</span>
                    </button>
                </div>
                 <button className="ml-2 p-1 rounded-full hover:bg-white/10 text-gray-400" onClick={() => handleSelectAll(false)}>
                    <X size={20} />
                </button>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}
