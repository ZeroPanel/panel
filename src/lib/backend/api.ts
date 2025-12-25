import type { Server, FileNode } from '@/lib/types';

export interface DataProvider {
  getServers(): Promise<Server[]>;
  getFiles(path: string): Promise<FileNode[]>;
}
