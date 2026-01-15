import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  Database,
  AlertTriangle,
  Play,
  Image
} from "lucide-react";

interface SyncLog {
  id: string;
  sync_type: string;
  started_at: string;
  completed_at: string | null;
  records_processed: number;
  records_created: number;
  records_updated: number;
  errors: unknown[] | null;
  status: string;
}

interface ConnectionTestResult {
  success: boolean;
  message?: string;
  error?: string;
  sampleCount?: number;
  sampleData?: Array<{
    ListingId: string;
    ListPrice: number;
    City: string;
    StateOrProvince: string;
    StandardStatus: string;
  }>;
}

export default function MLSSyncPanel() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingMedia, setIsSyncingMedia] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [mlsListingCount, setMlsListingCount] = useState(0);
  const [syncLimit, setSyncLimit] = useState(100);
  const [mediaStats, setMediaStats] = useState<{ propertiesWithImages: number; totalImages: number } | null>(null);

  useEffect(() => {
    fetchSyncLogs();
    fetchMlsListingCount();
    fetchMediaStats();
  }, []);

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('mls_sync_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncLogs((data || []) as SyncLog[]);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchMlsListingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_mls_listing', true);

      if (error) throw error;
      setMlsListingCount(count || 0);
    } catch (error) {
      console.error('Error fetching MLS listing count:', error);
    }
  };

  const fetchMediaStats = async () => {
    try {
      // Get count of MLS properties that have images
      const { data, error } = await supabase
        .from('property_images')
        .select('property_id, properties!inner(is_mls_listing)')
        .eq('properties.is_mls_listing', true);

      if (error) throw error;
      
      const uniqueProperties = new Set(data?.map(d => d.property_id) || []);
      setMediaStats({
        propertiesWithImages: uniqueProperties.size,
        totalImages: data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching media stats:', error);
    }
  };

  const runMediaSync = async () => {
    setIsSyncingMedia(true);

    try {
      toast.info('Starting media sync for all MLS properties...');

      const { data, error } = await supabase.functions.invoke('sync-mls-media');

      if (error) throw error;

      if (data.success) {
        toast.success(
          `Media sync complete: ${data.totalMediaSynced} images for ${data.propertiesWithMedia} properties`
        );
        fetchMediaStats();
      } else {
        toast.error(data.error || 'Media sync failed');
      }
    } catch (error: any) {
      console.error('Media sync error:', error);
      toast.error('Failed to sync media: ' + error.message);
    } finally {
      setIsSyncingMedia(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-mls-connection');

      if (error) throw error;
      setConnectionResult(data);

      if (data.success) {
        toast.success('MLS Grid connection successful!');
      } else {
        toast.error(data.error || 'Connection failed');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setConnectionResult({ success: false, error: error.message });
      toast.error('Failed to test connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const runSync = async (syncType: 'full' | 'incremental') => {
    setIsSyncing(true);

    try {
      toast.info(`Starting ${syncType} sync with limit of ${syncLimit} properties...`);

      const { data, error } = await supabase.functions.invoke('sync-mls-properties', {
        body: { syncType, limit: syncLimit }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(
          `Sync complete: ${data.recordsCreated} created, ${data.recordsUpdated} updated`
        );
        fetchSyncLogs();
        fetchMlsListingCount();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Failed to run sync: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500"><Clock className="w-3 h-3 mr-1" /> Running</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'completed_with_errors':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" /> With Errors</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            MLS Grid Connection
          </CardTitle>
          <CardDescription>
            Test your connection to the MLS Grid API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={testConnection} 
              disabled={isTestingConnection}
              variant="outline"
            >
              {isTestingConnection ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>

            {connectionResult && (
              <div className="flex items-center gap-2">
                {connectionResult.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-600">Connected - {connectionResult.sampleCount} sample properties fetched</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <span className="text-red-600">{connectionResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {connectionResult?.success && connectionResult.sampleData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Sample Data Preview:</h4>
              <div className="text-sm space-y-1">
                {connectionResult.sampleData.slice(0, 3).map((prop) => (
                  <div key={prop.ListingId} className="flex justify-between">
                    <span>{prop.ListingId}</span>
                    <span>{prop.City}, {prop.StateOrProvince}</span>
                    <span>${prop.ListPrice?.toLocaleString()}</span>
                    <Badge variant="secondary">{prop.StandardStatus}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Property Sync
          </CardTitle>
          <CardDescription>
            Sync properties from MLS Grid to your database. Current MLS listings: <strong>{mlsListingCount}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="syncLimit">Records to sync</Label>
              <Input
                id="syncLimit"
                type="number"
                value={syncLimit}
                onChange={(e) => setSyncLimit(parseInt(e.target.value) || 100)}
                className="w-32"
                min={1}
                max={5000}
              />
            </div>

            <Button 
              onClick={() => runSync('full')} 
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Full Sync
                </>
              )}
            </Button>

            <Button 
              onClick={() => runSync('incremental')} 
              disabled={isSyncing}
              variant="outline"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Incremental Sync
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Full sync fetches all properties. Incremental sync only fetches properties modified since the last sync.
          </p>
        </CardContent>
      </Card>

      {/* Media Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Media Sync
          </CardTitle>
          <CardDescription>
            Sync property photos from MLS Grid. 
            {mediaStats && (
              <> Currently: <strong>{mediaStats.totalImages}</strong> images for <strong>{mediaStats.propertiesWithImages}</strong> of <strong>{mlsListingCount}</strong> MLS properties</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runMediaSync} 
              disabled={isSyncingMedia || mlsListingCount === 0}
            >
              {isSyncingMedia ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing Media...
                </>
              ) : (
                <>
                  <Image className="mr-2 h-4 w-4" />
                  Sync All Media
                </>
              )}
            </Button>

            {mlsListingCount === 0 && (
              <p className="text-sm text-muted-foreground">
                Sync properties first before syncing media.
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Fetches and syncs all photos for MLS properties from the MLS Grid Media API.
          </p>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent sync operations</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : syncLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No sync history yet. Run your first sync above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="capitalize">{log.sync_type}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{formatDate(log.started_at)}</TableCell>
                    <TableCell>{log.records_processed}</TableCell>
                    <TableCell className="text-green-600">+{log.records_created}</TableCell>
                    <TableCell className="text-blue-600">{log.records_updated}</TableCell>
                    <TableCell>
                      {log.errors && log.errors.length > 0 ? (
                        <Badge variant="destructive">{log.errors.length}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
