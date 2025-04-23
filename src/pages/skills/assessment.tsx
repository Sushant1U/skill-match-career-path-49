import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Award } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { analyzeSkillSet } from '@/utils/skill-analysis';
import { SkillInput } from '@/components/skills/SkillInput';
import { AnalysisResults } from '@/components/skills/AnalysisResults';

export default function SkillsAssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<Array<{ name: string, proficiency: number }>>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
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
    if (profile?.skills && Array.isArray(profile.skills)) {
      const initialSkills = profile.skills.map(name => ({
        name,
        proficiency: profile.skill_proficiency?.[name] || 5
      }));
      setSkills(initialSkills);
      
      if (profile.skill_analysis) {
        setAnalysisResult(profile.skill_analysis);
      }
    }
  }, [profile]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Skills and assessment saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save skills and assessment');
      console.error('Update error:', error);
    }
  });
  
  const updateAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          skill_analysis: data.analysis,
          skill_proficiency: data.proficiencyMap,
          skills: data.skillNames,
          skill_score: data.analysis.score,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Skills assessment saved successfully');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save skills assessment');
    }
  });
  
  const handleAddSkill = (skill: { name: string, proficiency: number }) => {
    setSkills(prev => [...prev, skill]);
  };
  
  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };
  
  const handleProficiencyChange = (skillName: string, value: number[]) => {
    setSkills(skills.map(skill => 
      skill.name === skillName 
        ? { ...skill, proficiency: value[0] } 
        : skill
    ));
  };
  
  const handleRunAssessment = () => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill before running the assessment');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const proficiencyMap: Record<string, number> = {};
      skills.forEach(s => {
        proficiencyMap[s.name.toLowerCase()] = s.proficiency;
      });
      
      const result = analyzeSkillSet(
        skills.map(s => s.name.toLowerCase()), 
        proficiencyMap
      );
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('Assessment error:', error);
      toast.error('Failed to run skill assessment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAssessment = () => {
    if (skills.length === 0 || !analysisResult) {
      toast.error('Please add skills and run the assessment first');
      return;
    }

    const proficiencyMap: Record<string, number> = {};
    skills.forEach(s => {
      proficiencyMap[s.name.toLowerCase()] = s.proficiency;
    });

    updateAssessmentMutation.mutate({
      analysis: analysisResult,
      proficiencyMap,
      skillNames: skills.map(s => s.name)
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Assessment</h1>
            <p className="text-gray-600">
              Rate your proficiency in each skill to get a personalized analysis and career recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    My Skills
                  </CardTitle>
                  <CardDescription>
                    Add skills and rate your proficiency level from 1 (beginner) to 10 (expert)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillInput
                    skills={skills}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                    onProficiencyChange={handleProficiencyChange}
                  />
                </CardContent>
                <div className="px-6 pb-6">
                  <Button 
                    className="w-full" 
                    onClick={handleRunAssessment} 
                    disabled={isLoading || skills.length === 0}
                  >
                    {isLoading ? 'Analyzing...' : 'Run Skill Assessment'}
                  </Button>
                </div>
              </Card>
            </div>
            
            <div>
              {analysisResult ? (
                <AnalysisResults 
                  result={analysisResult}
                  onSave={handleSaveAssessment}
                  isSaving={updateAssessmentMutation.isPending}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Assessment</CardTitle>
                    <CardDescription>
                      Add your skills and run the assessment to see your results here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-12 text-gray-500">
                    <Award className="h-12 w-12 mb-4 mx-auto opacity-30" />
                    <p>Your assessment results will appear here</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/student-dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
