
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface ResumePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl?: string | null;
}

export function ResumePreviewDialog({ isOpen, onClose, resumeUrl }: ResumePreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  console.log("Resume Preview Dialog - URL:", resumeUrl);
  
  // Reset state when the dialog opens or URL changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setLoadError(false);
    }
  }, [isOpen, resumeUrl]);

  const handleIframeLoad = () => {
    console.log("Resume iframe loaded successfully");
    setIsLoading(false);
  };

  const handleIframeError = () => {
    console.error("Failed to load resume in iframe");
    setLoadError(true);
    setIsLoading(false);
  };
  
  // Handle resume download
  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
      toast.success("Resume opened in a new tab");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Resume document</span>
            {resumeUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="ml-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <Spinner size="lg" />
            </div>
          )}
          
          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 gap-2">
              <AlertCircle className="text-orange-500 h-10 w-10" />
              <p className="text-gray-700">Failed to load the resume. It might be blocked by your browser or unavailable.</p>
              <p className="text-sm text-gray-500 mb-4">Try opening it in a new tab.</p>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
            </div>
          )}

          {resumeUrl && (
            <iframe 
              src={resumeUrl} 
              className="w-full h-full border-0" 
              title="Resume Preview"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
