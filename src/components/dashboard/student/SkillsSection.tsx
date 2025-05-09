
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SkillsList } from '@/components/dashboard/SkillsList';
import { SkillScore } from '@/components/dashboard/student/SkillScore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SkillAnalysisResult } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export function SkillsSection() {
  const { user } = useAuth();
  
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile data:", error);
        return null;
      }
      
      console.log("Fetched profile data:", data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60000, // Consider data fresh for 60 seconds to prevent flickering
    retry: 2
  });

  // Parse skill_analysis as SkillAnalysisResult or use default values
  const skillAnalysis = profile?.skill_analysis 
    ? (typeof profile.skill_analysis === 'string' 
        ? JSON.parse(profile.skill_analysis) 
        : profile.skill_analysis)
    : {
        score: 0,
        strengths: [],
        weaknesses: [],
        recommendations: []
      };

  const skills = profile?.skills || [];
  const hasSkillData = !!profile?.skill_analysis;
  const skillScore = profile?.skill_score || skillAnalysis?.score || 0;

  console.log("Skills data:", {
    skills,
    hasSkillData,
    skillScore,
    skillAnalysis
  });

  if (profileLoading) {
    return (
      <DashboardCard 
        title="Skills & Assessment" 
        icon={<GraduationCap size={20} />}
        linkText="Update Skills"
        linkUrl="/skills/assessment"
      >
        <div className="h-40 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </DashboardCard>
    );
  }

  if (profileError) {
    return (
      <DashboardCard 
        title="Skills & Assessment" 
        icon={<GraduationCap size={20} />}
        linkText="Update Skills"
        linkUrl="/skills/assessment"
      >
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Unable to load skills data. Please try again later.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title="Skills & Assessment" 
      icon={<GraduationCap size={20} />}
      linkText="Update Skills"
      linkUrl="/skills/assessment"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {skills.length > 0 ? (
            <SkillsList skills={skills} />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">
                You haven't added any skills yet. Add skills to see job matches and recommendations.
              </p>
              <Link to="/skills/assessment">
                <Button size="sm">Add Skills</Button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          {hasSkillData ? (
            <SkillScore 
              score={skillScore}
              strengths={skillAnalysis.strengths}
              weaknesses={skillAnalysis.weaknesses}
              recommendations={skillAnalysis.recommendations}
            />
          ) : (
            <div className="text-center py-6 px-4 space-y-4">
              <TrendingUp size={32} className="mx-auto text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-800">Skill Assessment</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get your skills analyzed and see your market fit score.
                </p>
              </div>
              <Link to="/skills/assessment">
                <Button size="sm" className="w-full">Start Assessment</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {hasSkillData && (
        <>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <Link to="/skills/assessment">
              <Button variant="outline" size="sm">Update Assessment</Button>
            </Link>
          </div>
        </>
      )}
    </DashboardCard>
  );
}
