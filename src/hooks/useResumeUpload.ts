
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function useResumeUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [bucketExists, setBucketExists] = useState(false);

  // Check if the resumes bucket exists when the hook is initialized
  useEffect(() => {
    const checkBucketExists = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
          console.error("Error checking buckets:", error);
          return;
        }

        const resumeBucket = buckets?.find(bucket => bucket.name === 'resumes');
        if (resumeBucket) {
          console.log("Resumes bucket exists");
          setBucketExists(true);
        } else {
          console.warn("Resumes bucket does not exist. Creating it...");
          try {
            const { data, error } = await supabase.storage.createBucket('resumes', {
              public: true,
              fileSizeLimit: 5 * 1024 * 1024 // 5MB
            });
            
            if (error) {
              console.error("Error creating bucket:", error);
            } else {
              console.log("Bucket created successfully:", data);
              setBucketExists(true);
            }
          } catch (error) {
            console.error("Error creating bucket:", error);
          }
        }
      } catch (error) {
        console.error("Error checking buckets:", error);
      }
    };

    if (user) {
      checkBucketExists();
    }
  }, [user]);

  const resumeUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!bucketExists) throw new Error('Storage bucket not available');

      setFileError(null);
      // Check file type
      if (file.type !== 'application/pdf') {
        setFileError('Please upload a PDF file');
        throw new Error('Please upload a PDF file');
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setFileError('File size must be less than 5MB');
        throw new Error('File size must be less than 5MB');
      }
      
      const fileName = `${user.id}-${Date.now()}.pdf`;
      
      try {
        console.log('Uploading resume...', fileName);
        
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

        console.log('Resume uploaded successfully, public URL:', publicUrl);

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
    resumeUploadMutation,
    fileError,
    setFileError,
    bucketExists
  };
}
