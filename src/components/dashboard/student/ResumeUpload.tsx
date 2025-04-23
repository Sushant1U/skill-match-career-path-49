
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';

export function ResumeUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 1MB');
      return;
    }

    try {
      setUploading(true);

      // First check if the bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some(bucket => bucket.name === 'resumes')) {
        await supabase.storage.createBucket('resumes', {
          public: false,
          fileSizeLimit: maxSize
        });
      }

      const fileName = `${user.id}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          resume_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <label htmlFor="resume-upload" className="cursor-pointer block w-full">
        <Button className="w-full" variant="outline" disabled={uploading}>
          <FileUp className="mr-2 h-4 w-4" />
          {uploading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Uploading...
            </>
          ) : 'Upload Resume (PDF, Max 1MB)'}
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
      <p className="text-xs text-gray-500 mt-2 text-center">
        Only PDF format accepted. Maximum file size: 1MB
      </p>
    </div>
  );
}
