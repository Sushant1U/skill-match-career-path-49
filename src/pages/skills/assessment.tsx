import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { GraduationCap, Award, TrendingUp, AlertTriangle, Check, X, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { analyzeSkillSet } from '@/utils/skill-analysis';

export default function SkillsAssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<Array<{ name: string, proficiency: number }>>([]);
  const [newSkill, setNewSkill] = useState('');
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
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const skillName = newSkill.trim();
    if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      toast.error('This skill is already in your list');
      return;
    }
    
    setSkills(prev => [...prev, { name: skillName, proficiency: 5 }]);
    setNewSkill('');
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s.name !== skillToRemove));
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
      
      const skillNames = skills.map(s => s.name);
      updateProfileMutation.mutate({
        skills: skillNames,
        skill_proficiency: proficiencyMap,
        skill_analysis: result,
        skill_score: result.score
      });
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
  
  const renderProficiencyLabel = (proficiency: number) => {
    if (proficiency <= 3) return 'Beginner';
    if (proficiency <= 6) return 'Intermediate';
    if (proficiency <= 8) return 'Advanced';
    return 'Expert';
  };
  
  const renderScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-green-500';
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
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Add a skill (e.g. JavaScript, React, UX Design)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-platformBlue focus:border-transparent"
                      />
                      <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
                        Add Skill
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {skills.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                          No skills added yet. Add skills above to get started.
                        </p>
                      ) : (
                        skills.map((skill) => (
                          <div key={skill.name} className="border border-gray-200 rounded-md p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium">{skill.name}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {renderProficiencyLabel(skill.proficiency)}
                                </Badge>
                                <button
                                  onClick={() => handleRemoveSkill(skill.name)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500">Beginner</span>
                              <Slider
                                value={[skill.proficiency]}
                                min={1}
                                max={10}
                                step={1}
                                className="flex-1"
                                onValueChange={(value) => handleProficiencyChange(skill.name, value)}
                              />
                              <span className="text-xs text-gray-500">Expert</span>
                              <span className="text-sm font-medium w-6 text-center">{skill.proficiency}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleRunAssessment} 
                    disabled={isLoading || skills.length === 0}
                  >
                    {isLoading ? 'Analyzing...' : 'Run Skill Assessment'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              {analysisResult ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Your Skill Score
                    </CardTitle>
                    <CardDescription>
                      Based on your skills and proficiency levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32">
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="60" 
                            fill="none" 
                            stroke="#e5e7eb" 
                            strokeWidth="8" 
                          />
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="60" 
                            fill="none" 
                            stroke={analysisResult.score < 40 ? '#ef4444' : analysisResult.score < 70 ? '#f59e0b' : '#10b981'} 
                            strokeWidth="8"
                            strokeDasharray="376.8"
                            strokeDashoffset={376.8 - (376.8 * analysisResult.score / 100)}
                            transform="rotate(-90, 64, 64)"
                          />
                        </svg>
                        <div className="absolute">
                          <div className={`text-4xl font-bold ${renderScoreColor(analysisResult.score)}`}>
                            {analysisResult.score}
                          </div>
                          <div className="text-gray-500 text-sm">out of 100</div>
                        </div>
                      </div>
                    </div>
                    
                    {analysisResult.strengths.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" /> Strengths
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.strengths.map((strength: string) => (
                            <Badge key={strength} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.weaknesses.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" /> Areas to Improve
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.weaknesses.map((weakness: string) => (
                            <Badge key={weakness} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 text-platformBlue mr-1" /> Recommended Career Paths
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-gray-600">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
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
              
              <div className="mt-6 space-y-3">
                {analysisResult && (
                  <Button
                    className="w-full"
                    onClick={handleSaveAssessment}
                    disabled={updateAssessmentMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateAssessmentMutation.isPending ? 'Saving...' : 'Save Assessment'}
                  </Button>
                )}
                
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
