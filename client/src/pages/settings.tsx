import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings as SettingsType } from "@shared/schema";
import GlassCard from "@/components/glass-card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const { toast } = useToast();
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");

  const { data: settings, isLoading } = useQuery<SettingsType>({
    queryKey: ['/api/settings'],
    onSuccess: (data) => {
      if (data?.googleSheetsUrl) {
        setGoogleSheetsUrl(data.googleSheetsUrl);
      }
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SettingsType>) => {
      const response = await apiRequest('PUT', '/api/settings', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/entries?limit=1000');
      return response.json();
    },
    onSuccess: (data) => {
      // Convert to CSV and download
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof SettingsType) => (checked: boolean) => {
    updateSettingsMutation.mutate({ [key]: checked });
  };

  const handleGoogleSheetsUpdate = () => {
    updateSettingsMutation.mutate({ googleSheetsUrl });
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-8">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8">
      <div className="space-y-4">
        {/* Google Sheets Integration */}
        <GlassCard className="rounded-2xl p-5">
          <h3 className="font-medium mb-4 text-lg">Google Sheets Integration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Connected</span>
              <div 
                className={`w-5 h-3 rounded-full relative transition-colors ${
                  settings?.googleSheetsUrl ? 'bg-success' : 'bg-white/20'
                }`}
              >
                <div 
                  className={`w-3 h-3 bg-white rounded-full absolute top-0 shadow-sm transition-transform ${
                    settings?.googleSheetsUrl ? 'right-0' : 'left-0'
                  }`}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sheets-url">Google Sheets URL</Label>
              <Input
                id="sheets-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetsUrl}
                onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                className="bg-white/10 border-white/20"
              />
            </div>
            <Button 
              onClick={handleGoogleSheetsUpdate}
              className="w-full glass-strong rounded-xl text-sm border-0 hover:bg-white/20"
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? "Updating..." : "Update Google Sheets Connection"}
            </Button>
          </div>
        </GlassCard>

        {/* Daily Goals */}
        <GlassCard className="rounded-2xl p-5">
          <h3 className="font-medium mb-4 text-lg">Daily Goals</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Study</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-white/70">3 hours</span>
                <Button 
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <i className="fas fa-edit text-xs"></i>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Exercise</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-white/70">1 hour</span>
                <Button 
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <i className="fas fa-edit text-xs"></i>
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Preferences */}
        <GlassCard className="rounded-2xl p-5">
          <h3 className="font-medium mb-4 text-lg">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Check-out Mode</span>
              <Switch
                checked={settings?.checkoutMode ?? true}
                onCheckedChange={handleToggle('checkoutMode')}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Idle Reminders</span>
              <Switch
                checked={settings?.idleReminders ?? false}
                onCheckedChange={handleToggle('idleReminders')}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Sync</span>
              <Switch
                checked={settings?.autoSync ?? true}
                onCheckedChange={handleToggle('autoSync')}
              />
            </div>
          </div>
        </GlassCard>

        {/* Data Export */}
        <GlassCard className="rounded-2xl p-5">
          <h3 className="font-medium mb-4 text-lg">Data Export</h3>
          <Button 
            onClick={() => exportDataMutation.mutate()}
            className="w-full glass-strong rounded-xl text-sm border-0 hover:bg-white/20"
            disabled={exportDataMutation.isPending}
          >
            <i className="fas fa-download mr-2"></i>
            {exportDataMutation.isPending ? "Exporting..." : "Export to CSV"}
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";
  
  const headers = ["Date", "Time", "Card ID", "Habit Name", "Action", "Duration", "Device", "Notes"];
  const csvData = [
    headers.join(","),
    ...data.map(row => [
      row.date,
      row.time,
      row.cardId,
      row.habitName,
      row.action,
      row.duration || "",
      row.device || "",
      row.notes || ""
    ].map(field => `"${field}"`).join(","))
  ];
  
  return csvData.join("\n");
}
