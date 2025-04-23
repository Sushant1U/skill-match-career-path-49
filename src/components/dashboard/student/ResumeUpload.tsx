
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, FileDown, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeUpload } from '@/hooks/useResumeUpload';
import { ResumePreviewDialog } from './ResumePreviewDialog';
import { toast } from '@/components/ui/sonner';

export function ResumeUpload() {
  const { user } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const { uploading, setUploading, resumeUploadMutation, fileError } = useResumeUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query to check if user already has a resume
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    try {
      setUploading(true);
      await resumeUploadMutation.mutateAsync(file);
    } catch (error) {
      console.error('Error during upload:', error);
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';  // Reset the input
      }
    }
  };

  const handleViewResume = () => {
    if (!profile?.resume_url) {
      toast.error("No resume uploaded yet");
      return;
    }
    
    setPreviewOpen(true);
  };

  // This function will trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log("File input clicked");
    }
  };

  return (
    <div className="mt-4">
      <Button 
        className="w-full" 
        variant="outline" 
        disabled={uploading}
        onClick={triggerFileInput}
        type="button"
      >
        {uploading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Uploading...
          </>
        ) : (
          <>
            <FileUp className="mr-2 h-4 w-4" />
            Upload Resume (PDF, Max 5MB)
          </>
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      
      {profile?.resume_url && (
        <Button 
          className="w-full mt-2" 
          variant="secondary"
          onClick={handleViewResume}
        >
          <FileDown className="mr-2 h-4 w-4" />
          View Resume
        </Button>
      )}
      
      {fileError && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {fileError}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Only PDF format accepted. Maximum file size: 5MB
      </p>
      
      <ResumePreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resumeUrl={profile?.resume_url}
      />
    </div>
  );
}
