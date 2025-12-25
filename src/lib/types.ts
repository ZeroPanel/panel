export type ServerStatus = "Running" | "Stopped" | "Error";

export interface Server {
  id: string;
  name: string;
  status: ServerStatus;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  memory: string;
  cpu: string;
  disk: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
}

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
};
