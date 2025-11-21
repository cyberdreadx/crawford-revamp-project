import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, MessageSquare, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  property_type?: string;
  message: string;
  created_at: string;
}

const ContactSubmissionsManagement = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUniqueOnly, setShowUniqueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'email' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch contact submissions: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (column: 'date' | 'email' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getDisplaySubmissions = () => {
    let displayData = [...submissions];

    // Sort data
    displayData.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Filter unique emails if enabled
    if (showUniqueOnly) {
      const uniqueEmails = new Map<string, ContactSubmission>();
      displayData.forEach(sub => {
        if (!uniqueEmails.has(sub.email)) {
          uniqueEmails.set(sub.email, sub);
        }
      });
      displayData = Array.from(uniqueEmails.values());
    }

    return displayData;
  };

  const getSubmissionCountByEmail = (email: string) => {
    return submissions.filter(sub => sub.email === email).length;
  };

  const displaySubmissions = getDisplaySubmissions();

  const exportToCSV = (contactsOnly: boolean = false) => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "No contact submissions to export",
        variant: "destructive"
      });
      return;
    }

    const dataToExport = showUniqueOnly ? displaySubmissions : submissions;

    if (contactsOnly) {
      // Export only contact information
      const headers = ['Name', 'Email', 'Phone'];
      
      const csvRows = dataToExport.map(sub => [
        sub.name,
        sub.email,
        sub.phone || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => 
          row.map(cell => `"${cell}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} contacts to CSV`
      });
    } else {
      // Export full data
      const headers = ['Date', 'Name', 'Email', 'Phone', 'Property Type', 'Message'];
      
      const csvRows = dataToExport.map(sub => [
        formatDate(sub.created_at),
        sub.name,
        sub.email,
        sub.phone || '',
        sub.property_type || '',
        sub.message.replace(/"/g, '""')
      ]);

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => 
          row.map(cell => `"${cell}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Exported ${dataToExport.length} contact submissions to CSV`
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading submissions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contact Submissions</h2>
          <p className="text-muted-foreground">View all contact form submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="unique-emails"
              checked={showUniqueOnly}
              onChange={(e) => setShowUniqueOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="unique-emails" className="text-sm cursor-pointer">
              Show unique emails only
            </label>
          </div>
          <Button 
            onClick={() => exportToCSV(true)} 
            variant="outline"
            className="gap-2"
            disabled={submissions.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Contacts
          </Button>
          <Button 
            onClick={() => exportToCSV(false)} 
            variant="outline"
            className="gap-2"
            disabled={submissions.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Full Data
          </Button>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {displaySubmissions.length} {showUniqueOnly ? 'Unique' : 'Total'}
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {sortBy === 'date' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {sortBy === 'name' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Contact
                    {sortBy === 'email' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Property Type</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No contact submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                displaySubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(submission.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <a href={`mailto:${submission.email}`} className="hover:underline">
                            {submission.email}
                          </a>
                          {showUniqueOnly && getSubmissionCountByEmail(submission.email) > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {getSubmissionCountByEmail(submission.email)}x
                            </Badge>
                          )}
                        </div>
                        {submission.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${submission.phone}`} className="hover:underline">
                              {submission.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.property_type ? (
                        <Badge variant="outline">{submission.property_type}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm line-clamp-2">{submission.message}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSubmissionsManagement;
