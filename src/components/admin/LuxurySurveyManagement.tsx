import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, ChevronUp, ChevronDown, Eye, Mail, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LuxurySurvey {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  service_types: string[];
  advisor_qualities: string[];
  property_types: string[];
  lifestyle_preferences: string[];
  value_factors: string[];
  price_range: string | null;
  preferred_locations: string[];
  timeline: string | null;
  contact_preference: string[];
  email_status: string | null;
  email_sent_at: string | null;
  email_error: string | null;
  matched_properties_count: number | null;
}

type SortField = 'created_at' | 'name' | 'email';
type SortOrder = 'asc' | 'desc';

export default function LuxurySurveyManagement() {
  const [surveys, setSurveys] = useState<LuxurySurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUniqueOnly, setShowUniqueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedSurvey, setSelectedSurvey] = useState<LuxurySurvey | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("luxury_surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error: any) {
      console.error("Error fetching surveys:", error);
      toast({
        title: "Error",
        description: "Failed to load luxury surveys",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resendReport = async (surveyId: string) => {
    setResendingId(surveyId);
    try {
      const { error } = await supabase.functions.invoke("generate-and-email-report", {
        body: { surveyId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match report resent successfully",
      });
      
      // Refresh surveys to get updated status
      fetchSurveys();
    } catch (error: any) {
      console.error("Error resending report:", error);
      toast({
        title: "Error",
        description: "Failed to resend report",
        variant: "destructive",
      });
    } finally {
      setResendingId(null);
    }
  };

  const getEmailStatusBadge = (survey: LuxurySurvey) => {
    const status = survey.email_status || 'pending';
    
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-primary text-primary-foreground gap-1">
            <CheckCircle className="h-3 w-3" />
            Sent
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSurveyCountByEmail = (email: string): number => {
    return surveys.filter(s => s.email === email).length;
  };

  const getDisplaySurveys = (): LuxurySurvey[] => {
    let result = [...surveys];

    if (showUniqueOnly) {
      const seenEmails = new Set<string>();
      result = result.filter(survey => {
        if (seenEmails.has(survey.email)) return false;
        seenEmails.add(survey.email);
        return true;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  };

  const displaySurveys = getDisplaySurveys();

  const exportToCSV = (contactsOnly: boolean = false) => {
    if (surveys.length === 0) {
      toast({
        title: "No Data",
        description: "No surveys to export",
        variant: "destructive",
      });
      return;
    }

    const dataToExport = showUniqueOnly ? displaySurveys : surveys;

    if (contactsOnly) {
      const headers = ['Name', 'Email', 'Phone'];
      const csvRows = dataToExport.map(s => [s.name, s.email, s.phone || '']);

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `luxury-survey-contacts-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Success", description: `Exported ${dataToExport.length} contacts` });
    } else {
      const headers = ['Date', 'Name', 'Email', 'Phone', 'Service Types', 'Price Range', 'Timeline', 'Locations'];
      const csvRows = dataToExport.map(s => [
        formatDate(s.created_at),
        s.name,
        s.email,
        s.phone || '',
        (s.service_types || []).join('; '),
        s.price_range || '',
        s.timeline || '',
        (s.preferred_locations || []).join('; '),
      ]);

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `luxury-surveys-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Success", description: `Exported ${dataToExport.length} surveys` });
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return <span className="text-muted-foreground">—</span>;
    return (
      <ul className="list-disc list-inside space-y-1">
        {arr.map((item, i) => <li key={i} className="text-sm">{item}</li>)}
      </ul>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading surveys...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="unique-emails"
            checked={showUniqueOnly}
            onCheckedChange={(checked) => setShowUniqueOnly(checked as boolean)}
          />
          <label htmlFor="unique-emails" className="text-sm cursor-pointer">
            Show unique emails only
          </label>
        </div>
        <Button onClick={() => exportToCSV(true)} variant="outline" className="gap-2" disabled={surveys.length === 0}>
          <Download className="h-4 w-4" /> Export Contacts
        </Button>
        <Button onClick={() => exportToCSV(false)} variant="outline" className="gap-2" disabled={surveys.length === 0}>
          <Download className="h-4 w-4" /> Export Full Data
        </Button>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {displaySurveys.length} {showUniqueOnly ? 'Unique' : 'Total'}
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('created_at')}>
                Date <SortIcon field="created_at" />
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                Name <SortIcon field="name" />
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('email')}>
                Email <SortIcon field="email" />
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email Status</TableHead>
              <TableHead>Matches</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displaySurveys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No luxury surveys yet
                </TableCell>
              </TableRow>
            ) : (
              displaySurveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="text-sm">{formatDate(survey.created_at)}</TableCell>
                  <TableCell className="font-medium">{survey.name}</TableCell>
                  <TableCell>
                    {survey.email}
                    {showUniqueOnly && getSurveyCountByEmail(survey.email) > 1 && (
                      <Badge variant="outline" className="ml-2">{getSurveyCountByEmail(survey.email)}x</Badge>
                    )}
                  </TableCell>
                  <TableCell>{survey.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getEmailStatusBadge(survey)}
                      {survey.email_status === 'sent' && survey.email_sent_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(survey.email_sent_at)}
                        </span>
                      )}
                      {survey.email_status === 'failed' && survey.email_error && (
                        <span className="text-xs text-destructive truncate max-w-[150px]" title={survey.email_error}>
                          {survey.email_error}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {survey.matched_properties_count != null ? (
                      <Badge variant="outline">{survey.matched_properties_count}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSurvey(survey)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendReport(survey.id)}
                        disabled={resendingId === survey.id}
                        title="Resend match report"
                      >
                        {resendingId === survey.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survey Details: {selectedSurvey?.name}</DialogTitle>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Email:</strong> {selectedSurvey.email}</div>
                <div><strong>Phone:</strong> {selectedSurvey.phone || "—"}</div>
                <div><strong>Date:</strong> {formatDate(selectedSurvey.created_at)}</div>
                <div><strong>Price Range:</strong> {selectedSurvey.price_range || "—"}</div>
                <div><strong>Timeline:</strong> {selectedSurvey.timeline || "—"}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <strong>Email Status:</strong> 
                  {getEmailStatusBadge(selectedSurvey)}
                  {selectedSurvey.matched_properties_count != null && (
                    <span className="text-muted-foreground">
                      ({selectedSurvey.matched_properties_count} properties matched)
                    </span>
                  )}
                </div>
                {selectedSurvey.email_status === 'failed' && selectedSurvey.email_error && (
                  <div className="col-span-2 text-destructive text-sm">
                    <strong>Error:</strong> {selectedSurvey.email_error}
                  </div>
                )}
              </div>

              <div>
                <strong className="block mb-2">Service Types:</strong>
                {formatArray(selectedSurvey.service_types)}
              </div>

              <div>
                <strong className="block mb-2">Advisor Qualities:</strong>
                {formatArray(selectedSurvey.advisor_qualities)}
              </div>

              <div>
                <strong className="block mb-2">Property Types:</strong>
                {formatArray(selectedSurvey.property_types)}
              </div>

              <div>
                <strong className="block mb-2">Lifestyle Preferences:</strong>
                {formatArray(selectedSurvey.lifestyle_preferences)}
              </div>

              <div>
                <strong className="block mb-2">Value Factors:</strong>
                {formatArray(selectedSurvey.value_factors)}
              </div>

              <div>
                <strong className="block mb-2">Preferred Locations:</strong>
                {formatArray(selectedSurvey.preferred_locations)}
              </div>

              <div>
                <strong className="block mb-2">Contact Preference:</strong>
                {formatArray(selectedSurvey.contact_preference)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
