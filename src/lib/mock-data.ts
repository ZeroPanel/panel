import type { Server, FileNode } from './types';

export const mockServers: Server[] = [
  {
    id: 'srv-1',
    name: 'Web Server (Primary)',
    status: 'Running',
    cpuUsage: 75,
    ramUsage: 60,
    diskUsage: 85,
    memory: '1.2 GB / 2 GB',
    cpu: '1.4 GHz / 2 GHz',
    disk: '42.5 GB / 50 GB',
  },
  {
    id: 'srv-2',
    name: 'Database Server',
    status: 'Running',
    cpuUsage: 45,
    ramUsage: 80,
    diskUsage: 70,
    memory: '6.4 GB / 8 GB',
    cpu: '0.9 GHz / 2 GHz',
    disk: '140 GB / 200 GB',
  },
  {
    id: 'srv-3',
    name: 'Worker-01',
    status: 'Stopped',
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 20,
    memory: '0 GB / 4 GB',
    cpu: '0 GHz / 1 GHz',
    disk: '20 GB / 100 GB',
  },
  {
    id: 'srv-4',
    name: 'Staging Environment',
    status: 'Error',
    cpuUsage: 100,
    ramUsage: 95,
    diskUsage: 98,
    memory: '1.9 GB / 2 GB',
    cpu: '2.0 GHz / 2 GHz',
    disk: '49 GB / 50 GB',
  },
];

export const mockFiles: FileNode[] = [
    { id: '1', name: 'public', type: 'folder', modified: '2023-10-26 10:00' },
    { id: '2', name: 'index.html', type: 'file', size: '1.5 KB', modified: '2023-10-26 09:45' },
    { id: '3', name: 'styles.css', type: 'file', size: '3.2 KB', modified: '2023-10-26 09:50' },
    { id: '4', name: 'src', type: 'folder', modified: '2023-10-25 14:20' },
    { id: '5', name: 'app.js', type: 'file', size: '12.7 KB', modified: '2023-10-26 10:05' },
    { id: '6', name: 'package.json', type: 'file', size: '1.1 KB', modified: '2023-10-24 18:00' },
    { id: '7', name: '.env.example', type: 'file', size: '0.2 KB', modified: '2023-10-24 18:00' },
    { id: '8', name: 'README.md', type: 'file', size: '5.8 KB', modified: '2023-10-26 11:30' },
];
