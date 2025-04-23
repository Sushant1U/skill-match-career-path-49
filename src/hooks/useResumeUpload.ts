
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function useResumeUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

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

      const fileName = `${user.id}-${Date.now()}.pdf`;
      
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

        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

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

  return {
    uploading,
    setUploading,
    resumeUploadMutation
  };
}
