import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateSkillScore } from '@/utils/skill-rating';

export function SkillsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
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

  useEffect(() => {
    const updateSkillScore = async () => {
      if (profile?.skills && profile.skills.length > 0) {
        try {
          const result = await calculateSkillScore(profile.skills);
          
          const { error } = await supabase
            .from('profiles')
            .update({
              skill_score: result.score,
              skill_analysis: result
            })
            .eq('id', user?.id);
            
          if (error) throw error;
          
          queryClient.invalidateQueries(['profile', user?.id]);
        } catch (error) {
          console.error('Error updating skill score:', error);
        }
      }
    };

    updateSkillScore();
  }, [profile?.skills, user?.id]);

  return (
    <DashboardCard 
      title="Skills" 
      icon={<GraduationCap size={20} />}
      linkText="Take Assessment"
      linkUrl="/skills/assessment"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Skills</h3>
          <span className="text-sm text-gray-500">
            {profile?.skill_score !== null ? `Score: ${profile?.skill_score}` : 'Calculating...'}
          </span>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading skills...</div>
        ) : profile?.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <Button key={index} variant="outline" size="sm">{skill}</Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No skills added yet.</div>
        )}
      </div>
    </DashboardCard>
  );
}
