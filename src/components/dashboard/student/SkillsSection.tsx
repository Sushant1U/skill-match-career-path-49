import React, { useState, useEffect } from 'react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SkillsList } from '@/components/dashboard/SkillsList';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';

export function SkillsSection() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);

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

  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

  const addSkill = async (skill: string) => {
    if (!user) return;
    if (!skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      
      const { error } = await supabase
        .from('profiles')
        .update({ skills: newSkills })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update skills');
        setSkills(skills);
      }
    }
  };

  const removeSkill = async (skill: string) => {
    if (!user) return;
    const newSkills = skills.filter(s => s !== skill);
    setSkills(newSkills);
    
    const { error } = await supabase
      .from('profiles')
      .update({ skills: newSkills })
      .eq('id', user.id);
    
    if (error) {
      toast.error('Failed to update skills');
      setSkills(skills);
    }
  };

  return (
    <DashboardCard 
      title="My Skills" 
      icon={<GraduationCap size={20} />} 
      linkText="Skill Assessment"
      linkUrl="/skills/assessment"
    >
      {profileLoading ? (
        <div className="py-6 text-center">Loading skills...</div>
      ) : (
        <SkillsList 
          skills={skills} 
          onAddSkill={addSkill} 
          onRemoveSkill={removeSkill} 
          editable={true} 
        />
      )}
    </DashboardCard>
  );
}
