import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface ExtractedData {
  title?: string;
  tagline?: string;
  location?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  description?: string;
  unit_features?: string[];
  amenities?: string[];
  lifestyle_events?: string[];
  agent_name?: string;
  agent_title?: string;
  agent_phone?: string;
  agent_email?: string;
}

interface DossierUploadProps {
  propertyId?: string;
  onPropertyCreated?: (property: any) => void;
  onPropertyUpdated?: (property: any) => void;
}

const DossierUpload: React.FC<DossierUploadProps> = ({ 
  propertyId, 
  onPropertyCreated, 
  onPropertyUpdated 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Accept PDF, PNG, JPG, JPEG files
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setExtractedData(null);
        setProcessingComplete(false);
        setProgress(0);
      } else {
        toast.error('Please select a PDF or image file (PNG, JPG, JPEG)');
      }
    }
  };

  const processDossier = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', propertyId || 'new');

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('process-dossier', {
        body: formData,
      });

      setProgress(70);

      if (error) {
        console.error('Error processing dossier:', error);
        toast.error('Failed to process dossier');
        return;
      }

      setProgress(90);

      if (data?.success) {
        setExtractedData(data.extractedData);
        setProcessingComplete(true);
        setProgress(100);
        
        toast.success(
          propertyId && propertyId !== 'new' 
            ? 'Property updated successfully!' 
            : 'Property created successfully!'
        );

        // Call the appropriate callback
        if (propertyId && propertyId !== 'new' && onPropertyUpdated) {
          onPropertyUpdated(data.property);
        } else if (onPropertyCreated) {
          onPropertyCreated(data.property);
        }
      } else {
        toast.error('Failed to extract property data');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while processing the dossier');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setExtractedData(null);
    setProcessingComplete(false);
    setProgress(0);
    setUploading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Dossier Processor
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a property dossier (PDF or image) and let AI extract all the property information automatically
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!processingComplete && (
          <>
            {/* File Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  id="dossier-upload"
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <label
                  htmlFor="dossier-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF, PNG, JPG or JPEG files supported
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Processing dossier with AI...</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Process Button */}
            <Button
              onClick={processDossier}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Process Dossier with AI
                </>
              )}
            </Button>
          </>
        )}

        {/* Results */}
        {processingComplete && extractedData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Dossier processed successfully!
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Extracted Information:</h4>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  {extractedData.title && (
                    <div><strong>Title:</strong> {extractedData.title}</div>
                  )}
                  {extractedData.location && (
                    <div><strong>Location:</strong> {extractedData.location}</div>
                  )}
                  {extractedData.price && (
                    <div><strong>Price:</strong> ${extractedData.price.toLocaleString()}</div>
                  )}
                  {extractedData.bedrooms && (
                    <div><strong>Bedrooms:</strong> {extractedData.bedrooms}</div>
                  )}
                  {extractedData.bathrooms && (
                    <div><strong>Bathrooms:</strong> {extractedData.bathrooms}</div>
                  )}
                  {extractedData.sqft && (
                    <div><strong>Square Feet:</strong> {extractedData.sqft.toLocaleString()}</div>
                  )}
                  {extractedData.unit_features && extractedData.unit_features.length > 0 && (
                    <div>
                      <strong>Features:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extractedData.unit_features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {extractedData.unit_features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{extractedData.unit_features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {extractedData.agent_name && (
                    <div><strong>Agent:</strong> {extractedData.agent_name}</div>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={resetUpload} variant="outline" className="w-full">
              Process Another Dossier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DossierUpload;