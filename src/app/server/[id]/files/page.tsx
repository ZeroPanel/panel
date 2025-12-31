
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
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
  CloudUpload,
  File as FileIcon,
  FilePlus,
  Folder as FolderIcon,
  FolderPlus,
  Home,
  List,
  Grid,
  MoreVertical,
  Move,
  Search,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Container = {
  id: string;
  name: string;
  node: string;
  containerId: string;
};

type FileItem = {
  name: string;
  permissions: string;
  owner: string;
  group: string;
  size: number;
  isDirectory: boolean;
  isSymlink: boolean;
  month: string;
  day: string;
  time: string;
  selected?: boolean;
};

const getFileIcon = (file: FileItem) => {
    if (file.isDirectory) {
        return <FolderIcon className="text-primary fill-primary/20" size={24} />;
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jar':
        case 'zip':
        case 'tar':
        case 'gz':
            return <Archive className="text-amber-400" size={24} />;
        case 'json':
        case 'yml':
        case 'properties':
            return <FileIcon className="text-purple-400" size={24} />;
        case 'log':
        case 'txt':
            return <FileIcon className="text-blue-400" size={24} />;
        default:
            return <FileIcon className="text-gray-400" size={24} />;
    }
};

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileManagerPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const containerDocId = params.id;

  const [container, setContainer] = useState<Container | null>(null);
  const [nodeIp, setNodeIp] = useState<string | null>(null);
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/nebula-data');
  const [isLoading, setIsLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);

  const containerRef = useMemo(() => 
    firestore && containerDocId ? doc(firestore, 'containers', containerDocId) : null, 
    [firestore, containerDocId]
  );
  const [containerSnapshot] = useDoc(containerRef);

  const nodeRef = useMemo(() => {
    if (firestore && container?.node) {
      return doc(firestore, 'nodes', container.node);
    }
    return null;
  }, [firestore, container?.node]);
  const [nodeSnapshot] = useDoc(nodeRef);
  
  useEffect(() => {
    if (containerSnapshot?.exists()) {
      const data = containerSnapshot.data() as DocumentData;
      setContainer({
        id: containerSnapshot.id,
        name: data.name,
        node: data.node,
        containerId: data.containerId,
      });
    }
  }, [containerSnapshot]);

  useEffect(() => {
    if (nodeSnapshot?.exists()) {
      setNodeIp(nodeSnapshot.data().ip);
    }
  }, [nodeSnapshot]);

  const listFiles = useCallback((path: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      wsRef.current.send(JSON.stringify({
        type: 'list_files',
        path: path
      }));
    }
  }, []);

  const sendWsMessage = useCallback((message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'WebSocket is not connected.',
      });
    }
  }, [toast]);
  
  useEffect(() => {
    if (!nodeIp || !container?.containerId) return;

    const wsUrl = `wss://${nodeIp}/containers/${container.containerId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
        console.log('File manager WebSocket connected');
        listFiles(currentPath);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'file_list':
            if (data.success) {
                const sortedFiles = data.files.sort((a: FileItem, b: FileItem) => {
                    if (a.isDirectory !== b.isDirectory) {
                        return a.isDirectory ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                });
                setFiles(sortedFiles);
                setCurrentPath(data.path);
            } else {
                toast({ variant: 'destructive', title: 'Error Listing Files', description: data.error });
            }
            setIsLoading(false);
            break;
          case 'file_create_result':
          case 'folder_create_result':
          case 'delete_result':
              if (data.success) {
                  toast({ title: 'Success', description: `Operation on ${data.filePath || data.folderPath || data.itemPath} was successful.`});
                  listFiles(currentPath); // Refresh file list
              } else {
                  toast({ variant: 'destructive', title: 'Operation Failed', description: data.error });
              }
              break;
        }
    };

    ws.onclose = () => {
        console.log('File manager WebSocket disconnected');
        setIsLoading(false);
    };

    ws.onerror = (error) => {
        console.error('File manager WebSocket error:', error);
        toast({ variant: 'destructive', title: 'WebSocket Error', description: 'Connection to the file manager failed.'});
        setIsLoading(false);
    };

    return () => {
        ws.close();
    };
  }, [nodeIp, container?.containerId, currentPath, listFiles, toast]);

  const handleSelectAll = (checked: boolean) => {
    setFiles(files.map((file) => ({ ...file, selected: checked })));
  };

  const handleSelect = (name: string, checked: boolean) => {
    setFiles(files.map((file) => (file.name === name ? { ...file, selected: checked } : file)));
  };
  
  const handlePathChange = (path: string) => {
    setCurrentPath(path);
  }

  const handleFolderClick = (folderName: string) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    handlePathChange(newPath);
  };
  
  const handleBreadcrumbClick = (index: number) => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const newPath = '/' + pathSegments.slice(0, index + 1).join('/');
    handlePathChange(newPath);
  };

  const handleCreateFile = () => {
    const fileName = prompt('Enter new file name:');
    if (fileName) {
      sendWsMessage({
        type: 'create_file',
        filePath: `${currentPath}/${fileName}`
      });
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter new folder name:');
    if (folderName) {
      sendWsMessage({
        type: 'create_folder',
        folderPath: `${currentPath}/${folderName}`
      });
    }
  };

  const handleDeleteSelected = () => {
    const selected = files.filter(f => f.selected);
    if (selected.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selected.length} item(s)?`)) {
      selected.forEach(item => {
        sendWsMessage({
          type: 'delete_item',
          itemPath: `${currentPath}/${item.name}`,
          isFolder: item.isDirectory
        });
      });
      // After sending all delete requests, unselect all
      handleSelectAll(false);
    }
  };

  const selectedFiles = files.filter((file) => file.selected);
  const isAllSelected = files.length > 0 && selectedFiles.length === files.length;
  
  const pathSegments = currentPath.split('/').filter(Boolean);


  return (
    <div className="flex h-full">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col border-b border-border-dark bg-background-dark z-10 shrink-0">
          <div className="flex items-center px-4 md:px-6 py-3 gap-2 text-sm overflow-x-auto no-scrollbar">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => handlePathChange('/')} className="flex items-center gap-1 cursor-pointer"><Home size={16}/> Root</BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments.map((segment, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                           {index === pathSegments.length - 1 ? (
                             <BreadcrumbPage className="flex items-center gap-1">
                               <FolderIcon className="text-primary fill-primary/20" size={16}/>
                               {segment}
                             </BreadcrumbPage>
                           ) : (
                            <BreadcrumbLink onClick={() => handleBreadcrumbClick(index)} className="cursor-pointer">{segment}</BreadcrumbLink>
                           )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
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
              <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-card-dark" onClick={handleCreateFolder}><FolderPlus size={22} /></Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-card-dark" onClick={handleCreateFile}><FilePlus size={22} /></Button>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  className="w-full bg-card-dark border border-border-dark rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-primary placeholder-gray-500"
                  placeholder={`Search in /${pathSegments[pathSegments.length-1] || 'root'}...`}
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
                    disabled={isLoading}
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
              {isLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-96 text-center">
                        <div className="flex items-center justify-center gap-2 text-text-secondary">
                           <Loader2 className="animate-spin" size={20}/>
                           <span>Loading files...</span>
                        </div>
                    </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-96 text-center text-text-secondary">
                        This directory is empty.
                    </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.name} data-state={file.selected ? 'selected' : ''}>
                    <TableCell className="text-center">
                      <Checkbox 
                          checked={file.selected}
                          onCheckedChange={(checked) => handleSelect(file.name, Boolean(checked))}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div className="flex flex-col">
                          <span 
                            className={`font-medium text-white ${file.isDirectory ? 'cursor-pointer hover:underline' : ''}`}
                            onClick={file.isDirectory ? () => handleFolderClick(file.name) : undefined}
                          >
                            {file.name}
                          </span>
                          <span className="sm:hidden text-xs text-text-secondary">{formatSize(file.size)} • {`${file.day} ${file.month}`}</span>
                        </div>
                      </div>
                    </TableCell>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{file.isDirectory ? '—' : formatSize(file.size)}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden md:table-cell">{file.permissions}</td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{`${file.day} ${file.month} ${file.time}`}</td>
                    <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-primary/20">
                          <MoreVertical size={20} />
                        </Button>
                    </td>
                  </TableRow>
                ))
              )}
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
                    <button className="flex flex-col items-center gap-1 group" onClick={handleDeleteSelected}>
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
