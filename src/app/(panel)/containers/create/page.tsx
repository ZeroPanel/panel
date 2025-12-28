
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Box,
  Cpu,
  HardDrive,
  MemoryStick,
  Plus,
  Server,
  Network,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useAppState } from '@/components/app-state-provider';

type Node = { id: string, name: string, ip: string };
type User = { id: string, name: string };

export default function CreateContainerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isFirebaseEnabled } = useAppState();
  const firestore = isFirebaseEnabled ? useFirestore() : null;

  const [containerName, setContainerName] = useState('');
  const [dockerImage, setDockerImage] = useState('');
  const [node, setNode] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [publicPort, setPublicPort] = useState('');
  const [privatePort, setPrivatePort] = useState('');
  const [description, setDescription] = useState('');
  
  const [cpuLimit, setCpuLimit] = useState('');
  const [memoryLimit, setMemoryLimit] = useState('');
  const [diskLimit, setDiskLimit] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const nodesCollection = firestore ? collection(firestore, 'nodes') : null;
  const [nodesSnapshot] = useCollection(nodesCollection);
  const [nodes, setNodes] = useState<Node[]>([]);

  const usersCollection = firestore ? collection(firestore, 'users') : null;
  const [usersSnapshot] = useCollection(usersCollection);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (nodesSnapshot) {
      const fetchedNodes = nodesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        ip: doc.data().ip,
      }));
      setNodes(fetchedNodes);
      if (fetchedNodes.length > 0 && !node) {
        setNode(fetchedNodes[0].id);
      }
    }
  }, [nodesSnapshot, node]);

  useEffect(() => {
    if (usersSnapshot) {
      const fetchedUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setUsers(fetchedUsers);
      if (fetchedUsers.length > 0 && !assignedUser) {
        setAssignedUser(fetchedUsers[0].id);
      }
    }
  }, [usersSnapshot, assignedUser]);


  const handleCreateContainer = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Database Not Connected",
        description: "Cannot create a container because the connection to Firestore is not enabled.",
      });
      return;
    }
    if (!containerName || !dockerImage || !node || !assignedUser) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a Name, Docker Image, select a Node and assign a User.",
      });
      return;
    }

    setIsSubmitting(true);
    
    const selectedNode = nodes.find(n => n.id === node);

    const newContainer = {
        name: containerName,
        image: dockerImage,
        node: node,
        nodeName: selectedNode?.name || '',
        status: 'Starting',
        cpuUsage: 0,
        ramUsage: 0,
        userId: assignedUser,
        ports: publicPort && privatePort ? [{ public: Number(publicPort), private: Number(privatePort) }] : [],
        createdAt: serverTimestamp(),
    };

    // WebSocket communication to the node
    if (selectedNode?.ip) {
        const ws = new WebSocket(`wss://${selectedNode.ip}/create`);
        ws.onopen = () => {
            const payload = {
                type: 'create_container',
                name: containerName,
                image: dockerImage,
                ports: publicPort && privatePort ? [{ public: Number(publicPort), private: Number(privatePort) }] : [],
                resources: {
                    cpuLimit: cpuLimit ? Number(cpuLimit) : null,
                    memoryLimit: memoryLimit ? Number(memoryLimit) : null,
                    diskLimit: diskLimit ? Number(diskLimit) : null,
                },
                user: assignedUser,
                description,
            };
            ws.send(JSON.stringify(payload));
            console.log('Container creation request sent to node:', payload);
        };
        ws.onmessage = (event) => {
            console.log('Message from node:', event.data);
            // You can add logic here to handle responses from the node, e.g., deployment status
        };
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            toast({
                variant: 'destructive',
                title: 'Node Connection Failed',
                description: `Could not connect to the deployment node ${selectedNode.name}. The container record was saved, but deployment may not have started.`
            });
        };
        ws.onclose = () => {
            console.log(`Connection to node ${selectedNode.name} closed.`);
        };
    } else {
        toast({
            variant: 'warning',
            title: 'Node IP Missing',
            description: 'The selected node does not have an IP address configured. Cannot initiate deployment.'
        });
    }

    try {
      const containersCollection = collection(firestore, 'containers');
      addDoc(containersCollection, newContainer)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
            path: containersCollection.path,
            operation: 'create',
            requestResourceData: newContainer,
            } satisfies SecurityRuleContext);

            errorEmitter.emit('permission-error', permissionError);
        });

      toast({
        title: "Container Deployment Started",
        description: `The container "${containerName}" is being deployed.`,
      });
      router.push('/containers');

    } catch (e) {
      console.error("Error adding document: ", e);
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: "An unexpected error occurred while creating the container.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-24 p-4 md:p-0">
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
                <BreadcrumbLink asChild>
                  <Link href="/containers">Containers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Deploy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-white">Deploy New Container</h1>
            <p className="text-text-secondary mt-1">
              Configure and deploy a new Docker container to your infrastructure.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Box className="text-primary size-6" />
            <CardTitle>Container Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="container-name">Container Name</Label>
                <Input id="container-name" placeholder="e.g. my-app-prod" value={containerName} onChange={(e) => setContainerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docker-image">Docker Image</Label>
                <Input id="docker-image" placeholder="e.g. nginx:latest" value={dockerImage} onChange={(e) => setDockerImage(e.target.value)} />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="node">Deployment Node</Label>
                    <Select value={node} onValueChange={setNode}>
                        <SelectTrigger id="node" className="[&>span]:flex [&>span]:items-center [&>span]:gap-2">
                        <SelectValue placeholder="Select a node to deploy to" />
                        </SelectTrigger>
                        <SelectContent>
                        {nodes.map((n) => (
                            <SelectItem key={n.id} value={n.id} className="flex items-center gap-2">
                            <Server size={16} className="mr-2"/> {n.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="user">Assign to User</Label>
                    <Select value={assignedUser} onValueChange={setAssignedUser}>
                        <SelectTrigger id="user" className="[&>span]:flex [&>span]:items-center [&>span]:gap-2">
                        <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                        {users.map((u) => (
                            <SelectItem key={u.id} value={u.id} className="flex items-center gap-2">
                            <User size={16} className="mr-2"/> {u.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe the purpose of this container."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
         <Card>
            <CardHeader className="flex flex-row items-center gap-3">
                <Network className="text-primary size-6" />
                <CardTitle>Port Mapping</CardTitle>
                 <CardDescription>Forward ports from the host to the container.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="public-port">Public Port</Label>
                    <Input id="public-port" placeholder="e.g. 8080" value={publicPort} onChange={e => setPublicPort(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="private-port">Private Port</Label>
                    <Input id="private-port" placeholder="e.g. 80" value={privatePort} onChange={e => setPrivatePort(e.target.value)} />
                  </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center gap-3">
                <Cpu className="text-primary size-6" />
                <CardTitle>Resource Limits</CardTitle>
                 <CardDescription>Set CPU, Memory, and Storage limits for this container.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="cpu-limit">CPU Limit (%)</Label>
                    <Input id="cpu-limit" placeholder="100" value={cpuLimit} onChange={e => setCpuLimit(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="memory-limit">Memory Limit (MB)</Label>
                    <Input id="memory-limit" placeholder="512" value={memoryLimit} onChange={e => setMemoryLimit(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="disk-limit">Storage Limit (MB)</Label>
                    <Input id="disk-limit" placeholder="1024" value={diskLimit} onChange={e => setDiskLimit(e.target.value)} />
                  </div>
            </CardContent>
        </Card>

      </div>
      <div className="py-4 border-t border-border-dark flex items-center justify-between sticky bottom-0 bg-background z-20 px-8 -mx-8">
        <p className="text-sm text-text-secondary">Changes are not saved until you click deploy.</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/containers">Cancel</Link>
          </Button>
          <Button onClick={handleCreateContainer} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Plus className="mr-2" />
                Deploy Container
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
