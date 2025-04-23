
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResumePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl?: string | null;
}

export function ResumePreviewDialog({ isOpen, onClose, resumeUrl }: ResumePreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogDescription>
            Your uploaded resume
          </DialogDescription>
        </DialogHeader>
        {resumeUrl && (
          <iframe 
            src={resumeUrl} 
            className="w-full h-full border-0" 
            title="Resume Preview"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
