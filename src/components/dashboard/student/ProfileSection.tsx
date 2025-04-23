import React from 'react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { User, FileUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ProfileSection() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
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
          <span className="font-medium">75%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-platformBlue h-2.5 rounded-full w-3/4"></div>
        </div>
      </div>
      <Button className="w-full mt-4" variant="outline">
        <FileUp className="mr-2 h-4 w-4" />
        Upload Resume
      </Button>
    </DashboardCard>
  );
}
