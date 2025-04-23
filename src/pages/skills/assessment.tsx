
import { useState, useEffect } from 'react';
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
      
      console.log("Fetching profile data for skills assessment...");
      const { data, error } = await supabase
        .from('profiles')
        .select('skills, skill_proficiency, skill_analysis')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile data:", error);
        throw error;
      }
      
      console.log("Profile data fetched:", data);
      return data;
    },
    enabled: !!user?.id
  });
  
  // Initialize skills from profile data when it loads
  useEffect(() => {
    if (profile) {
      console.log("Setting up initial skills from profile:", profile);
      
      if (profile.skills && Array.isArray(profile.skills)) {
        const initialSkills = profile.skills.map(name => ({
          name,
          proficiency: profile.skill_proficiency?.[name] || 5
        }));
        
        console.log("Initial skills set:", initialSkills);
        setSkills(initialSkills);
      } else {
        console.log("No skills found in profile data");
        setSkills([]);
      }
      
      // Set analysis results if available
      if (profile.skill_analysis) {
        console.log("Setting analysis from profile:", profile.skill_analysis);
        setAnalysisResult(
          typeof profile.skill_analysis === 'string' 
            ? JSON.parse(profile.skill_analysis) 
            : profile.skill_analysis
        );
      }
    }
  }, [profile]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log("Updating profile with data:", data);
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

      console.log("Saving assessment with data:", data);

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

      if (error) {
        console.error("Database update error:", error);
        throw error;
      }
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
    console.log("Adding skill:", skill);
    setSkills(prev => [...prev, skill]);
  };
  
  const handleRemoveSkill = (skillName: string) => {
    console.log("Removing skill:", skillName);
    setSkills(skills.filter(s => s.name !== skillName));
  };
  
  const handleProficiencyChange = (skillName: string, value: number[]) => {
    console.log("Updating proficiency for", skillName, "to", value[0]);
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
      console.log("Running assessment for skills:", skills);
      const proficiencyMap: Record<string, number> = {};
      skills.forEach(s => {
        proficiencyMap[s.name.toLowerCase()] = s.proficiency;
      });
      
      const result = analyzeSkillSet(
        skills.map(s => s.name.toLowerCase()), 
        proficiencyMap
      );
      
      console.log("Assessment result:", result);
      setAnalysisResult(result);
      
      // Automatically save the assessment result
      handleSaveAssessment(result, proficiencyMap, skills.map(s => s.name.toLowerCase()));
    } catch (error) {
      console.error('Assessment error:', error);
      toast.error('Failed to run skill assessment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAssessment = (analysisData = analysisResult, proficiencyMap?: Record<string, number>, skillNames?: string[]) => {
    if (!analysisData || skills.length === 0) {
      toast.error('Please add skills and run the assessment first');
      return;
    }

    const profMap = proficiencyMap || {};
    if (!proficiencyMap) {
      skills.forEach(s => {
        profMap[s.name.toLowerCase()] = s.proficiency;
      });
    }

    const skillList = skillNames || skills.map(s => s.name.toLowerCase());

    console.log("Saving assessment with data:", {
      analysis: analysisData,
      proficiencyMap: profMap,
      skillNames: skillList,
    });

    updateAssessmentMutation.mutate({
      analysis: analysisData,
      proficiencyMap: profMap,
      skillNames: skillList,
      score: analysisData.score
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
                  onSave={() => handleSaveAssessment()}
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
