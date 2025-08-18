import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Key, Check, X, Settings, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface APIKeyStatusProps {
  className?: string;
}

const APIKeyStatus: React.FC<APIKeyStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const checkAPIKeyStatus = async () => {
    try {
      setStatus('checking');
      const { data, error } = await supabase.functions.invoke('test-openai-key');
      
      if (error) {
        console.error('Error checking API key:', error);
        setStatus('error');
        return;
      }

      if (data?.status === 'connected') {
        setStatus('connected');
      } else if (data?.status === 'not-configured') {
        setStatus('not-configured');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
      setStatus('error');
    }
  };

  const testAPIKey = async (apiKey: string) => {
    try {
      setIsTesting(true);
      const { data, error } = await supabase.functions.invoke('test-openai-key', {
        body: { apiKey }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      return data?.valid === true;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const updateAPIKey = async () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!newApiKey.startsWith('sk-')) {
      toast.error('OpenAI API keys should start with "sk-"');
      return;
    }

    setIsUpdating(true);

    try {
      // Test the API key first
      const isValid = await testAPIKey(newApiKey);
      
      if (!isValid) {
        toast.error('Invalid API key. Please check your key and try again.');
        setIsUpdating(false);
        return;
      }

      // If valid, update the secret
      // Note: In a real implementation, you'd need a separate endpoint to update secrets
      // For now, we'll just show success and ask user to update it manually
      toast.success('API key is valid! Please update it in your Supabase secrets.');
      setIsDialogOpen(false);
      setNewApiKey('');
      
      // Recheck status after a short delay
      setTimeout(() => {
        checkAPIKeyStatus();
      }, 2000);

    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Checking...',
          variant: 'secondary' as const,
          color: 'text-muted-foreground'
        };
      case 'connected':
        return {
          icon: <Check className="h-4 w-4" />,
          text: 'Connected',
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'not-configured':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Not Configured',
          variant: 'destructive' as const,
          color: 'text-orange-600'
        };
      case 'error':
        return {
          icon: <X className="h-4 w-4" />,
          text: 'Error',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
    }
  };

  useEffect(() => {
    checkAPIKeyStatus();
  }, []);

  const statusInfo = getStatusInfo();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={statusInfo.color}>
              {statusInfo.icon}
            </div>
            <Badge variant={statusInfo.variant}>
              {statusInfo.text}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkAPIKeyStatus}
              disabled={status === 'checking'}
            >
              {status === 'checking' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Check Status'
              )}
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure OpenAI API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">OpenAI API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-sm text-muted-foreground">
                      Get your API key from{' '}
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={updateAPIKey}
                      disabled={isUpdating || isTesting || !newApiKey.trim()}
                      className="flex-1"
                    >
                      {isUpdating || isTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isTesting ? 'Testing...' : 'Updating...'}
                        </>
                      ) : (
                        'Test & Update'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setNewApiKey('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {status === 'connected' && 'AI dossier processing is ready to use.'}
          {status === 'not-configured' && 'Configure your OpenAI API key to enable AI dossier processing.'}
          {status === 'error' && 'There was an error connecting to OpenAI. Check your API key.'}
          {status === 'checking' && 'Verifying OpenAI API connection...'}
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyStatus;