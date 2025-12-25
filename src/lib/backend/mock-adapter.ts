import type { DataProvider } from './api';
import type { Server, FileNode } from '@/lib/types';
import { mockServers, mockFiles } from '@/lib/mock-data';

class MockAdapter implements DataProvider {
  async getServers(): Promise<Server[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockServers;
  }

  async getFiles(path: string): Promise<FileNode[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    // In a real scenario, `path` would be used to fetch directory contents
    console.log(`Fetching files for path: ${path} (mock)`);
    return mockFiles;
  }
}

export const mockAdapter = new MockAdapter();
