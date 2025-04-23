
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/cards/JobCard';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Search } from 'lucide-react';
import type { Job } from '@/types';

export default function RecommendedJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['active-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        skills: job.skills,
        qualifications: job.qualifications,
        employerId: job.employer_id,
        status: job.status as 'active' | 'closed',
        createdAt: job.created_at,
        applications: job.applications_count
      })) as Job[];
    }
  });

  const userSkills = profile?.skills || [];
  
  const recommendedJobs = jobs
    .filter(job => {
      // Filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          job.skills.some(skill => skill.toLowerCase().includes(term))
        );
      }
      return true;
    })
    // Filter for jobs that match user skills
    .filter(job => job.skills.some(skill => userSkills.includes(skill)))
    // Sort by skill match (most matches first)
    .sort((a, b) => {
      const aMatchCount = a.skills.filter(skill => userSkills.includes(skill)).length;
      const bMatchCount = b.skills.filter(skill => userSkills.includes(skill)).length;
      return bMatchCount - aMatchCount;
    });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole={user?.role as any} />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/student-dashboard')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Recommended Jobs</h1>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search recommended jobs..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : userSkills.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-10 text-center">
              <h2 className="text-xl font-medium mb-2">Add skills to get recommendations</h2>
              <p className="text-gray-500 mb-6">
                You haven't added any skills to your profile yet. Add skills to get personalized job recommendations.
              </p>
              <Button onClick={() => navigate('/skills/assessment')}>
                Add Skills
              </Button>
            </div>
          ) : recommendedJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-10 text-center">
              <h2 className="text-xl font-medium mb-2">No matching jobs found</h2>
              <p className="text-gray-500 mb-6">
                We couldn't find any jobs matching your skills{searchTerm ? ' and search criteria' : ''}.
              </p>
              <Button onClick={() => navigate('/jobs')}>
                Browse All Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendedJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
