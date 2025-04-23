
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { User, FileUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function ProfileSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { resume_url: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    // Check file type (PDF, DOC, DOCX)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }
    
    // Check file size (max 5MB)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    try {
      setUploading(true);
      
      // Upload file to Supabase storage
      const fileName = `${user.id}-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);
      
      // Update profile with resume URL
      await updateProfileMutation.mutateAsync({ 
        resume_url: publicUrlData.publicUrl 
      });
      
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const getProfileCompleteness = () => {
    if (!profile) return 0;
    
    const requiredFields = ['name', 'location', 'skills', 'bio', 'resume_url'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'skills') {
        return profile[field] && Array.isArray(profile[field]) && profile[field].length > 0;
      }
      return profile[field];
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };
  
  const completionPercentage = getProfileCompleteness();

  return (
    <DashboardCard 
      title="Profile" 
      icon={<User size={20} />}
      linkText="Edit"
      linkUrl="/profile/edit"
    >
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-4">
          <User size={36} />
        </div>
        <h3 className="font-medium text-lg">{profile?.name || user?.user_metadata?.name || 'Student'}</h3>
        <p className="text-gray-500">Computer Science Student</p>
        <p className="text-gray-500 text-sm mt-1">{profile?.location || 'No location set'}</p>
      </div>
      <div className="space-y-2 mt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Profile Completion</span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-platformBlue h-2.5 rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4">
        {profile?.resume_url ? (
          <div className="flex justify-between items-center">
            <a 
              href={profile.resume_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-platformBlue hover:text-platformBlue-dark hover:underline"
            >
              View Current Resume
            </a>
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Button variant="outline" disabled={uploading}>
                <FileUp className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Update Resume'}
              </Button>
              <input
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        ) : (
          <label htmlFor="resume-upload" className="cursor-pointer">
            <Button className="w-full" variant="outline" disabled={uploading}>
              <FileUp className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
            <input
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        )}
        <p className="text-xs text-gray-500 mt-2 text-center">
          Accepted formats: PDF, DOC, DOCX. Max size: 5MB.
        </p>
      </div>
    </DashboardCard>
  );
}
