
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle } from 'lucide-react';

interface ResumePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl?: string | null;
}

export function ResumePreviewDialog({ isOpen, onClose, resumeUrl }: ResumePreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setLoadError(true);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogDescription>
            Your uploaded resume
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
              <p className="text-sm text-gray-500">Try opening it in a new tab.</p>
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
