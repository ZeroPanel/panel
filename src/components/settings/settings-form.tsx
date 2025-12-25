"use client";

import { useForm, Controller } from "react-hook-form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type SettingsFormValues = {
  serverName: string;
  autoRestart: boolean;
  port: number;
  enableUPnP: boolean;
  startupScript: string;
  scheduleBackup: boolean;
  backupTime: string;
};

const defaultValues: SettingsFormValues = {
  serverName: "My Awesome Server",
  autoRestart: true,
  port: 25565,
  enableUPnP: false,
  startupScript: "java -Xmx2G -jar server.jar nogui",
  scheduleBackup: true,
  backupTime: "03:00",
};

export function SettingsForm() {
  const [savedSettings, setSavedSettings] = useLocalStorage<SettingsFormValues>("server-settings", defaultValues);
  const { control, handleSubmit, reset } = useForm<SettingsFormValues>({
    defaultValues: savedSettings,
  });
  const { toast } = useToast();
  
  const onSubmit = (data: SettingsFormValues) => {
    setSavedSettings(data);
    toast({
      title: "Settings Saved",
      description: "Your server settings have been saved locally.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Settings</CardTitle>
        <CardDescription>Manage your server's configuration. Changes are saved locally.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="startup">Startup</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="general">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serverName">Server Name</Label>
                    <Controller name="serverName" control={control} render={({ field }) => <Input id="serverName" {...field} />} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller name="autoRestart" control={control} render={({ field }) => <Switch id="autoRestart" checked={field.value} onCheckedChange={field.onChange} />} />
                    <Label htmlFor="autoRestart">Auto-restart on crash</Label>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="network">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="port">Server Port</Label>
                    <Controller name="port" control={control} render={({ field }) => <Input id="port" type="number" {...field} />} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller name="enableUPnP" control={control} render={({ field }) => <Switch id="enableUPnP" checked={field.value} onCheckedChange={field.onChange} />} />
                    <Label htmlFor="enableUPnP">Enable UPnP (Port Forwarding)</Label>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="startup">
                <div className="space-y-2">
                    <Label htmlFor="startupScript">Startup Script</Label>
                    <Controller name="startupScript" control={control} render={({ field }) => <Textarea id="startupScript" className="font-code" rows={5} {...field} />} />
                </div>
              </TabsContent>
              <TabsContent value="schedules">
                 <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller name="scheduleBackup" control={control} render={({ field }) => <Switch id="scheduleBackup" checked={field.value} onCheckedChange={field.onChange} />} />
                    <Label htmlFor="scheduleBackup">Enable daily backups</Label>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="backupTime">Backup Time (UTC)</Label>
                    <Controller name="backupTime" control={control} render={({ field }) => <Input id="backupTime" type="time" {...field} />} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => reset(savedSettings)}>Reset</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
