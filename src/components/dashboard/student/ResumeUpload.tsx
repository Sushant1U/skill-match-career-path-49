
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, FileDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ResumeUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
      console.log('Profile data fetched:', data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30000 // Consider data fresh for 30 seconds to prevent flickering
  });

  const resumeUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check file type
      if (file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file');
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      console.log('Uploading resume for user:', user.id);
      
      const fileName = `${user.id}-${Date.now()}.pdf`;
      console.log('Uploading file:', fileName);
      
      try {
        // Upload the file
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('resumes')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('Upload successful:', uploadData);

        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        console.log('Resume public URL:', publicUrl);

        // Update the user's profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            resume_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw updateError;
        }

        return publicUrl;
      } catch (error: any) {
        console.error('Resume upload failed:', error);
        throw new Error(error.message || 'Failed to upload resume');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Resume uploaded successfully');
    },
    onError: (error: Error) => {
      console.error('Error uploading resume:', error);
      toast.error(error.message || 'Failed to upload resume');
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      await resumeUploadMutation.mutateAsync(file);
    } catch (error) {
      console.error('Error during upload:', error);
      // Error is handled by mutation
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';  // Reset the input
      }
    }
  };

  const handleViewResume = () => {
    if (profile?.resume_url) {
      window.open(profile.resume_url, '_blank');
    } else {
      setPreviewOpen(true);
    }
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  return (
    <div className="mt-4">
      <label htmlFor="resume-upload" className="cursor-pointer block w-full">
        <Button className="w-full" variant="outline" disabled={uploading}>
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
          id="resume-upload"
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </label>
      
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
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Only PDF format accepted. Maximum file size: 5MB
      </p>
      
      <Dialog open={previewOpen} onOpenChange={handlePreviewClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              Your uploaded resume
            </DialogDescription>
          </DialogHeader>
          {profile?.resume_url && (
            <iframe 
              src={profile.resume_url} 
              className="w-full h-full border-0" 
              title="Resume Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
