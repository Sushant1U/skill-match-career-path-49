
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { JobCard } from '@/components/cards/JobCard';
import { Button } from '@/components/ui/button';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Plus, ArrowLeft } from 'lucide-react';

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
  
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['employer-jobs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id)
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
    },
    enabled: !!user
  });

  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: 'active' | 'closed' }) => {
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId)
        .eq('employer_id', user?.id);
        
      if (error) throw error;
      return { jobId, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success(`Job ${variables.status === 'active' ? 'activated' : 'closed'} successfully`);
    },
    onError: (error) => {
      toast.error(`Error updating job status: ${error.message}`);
    }
  });

  const filteredJobs = jobs.filter(job => {
    if (filterStatus === 'all') return true;
    return job.status === filterStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="employer" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/employer-dashboard')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">My Job Postings</h1>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('all')}
            >
              All Jobs
            </Button>
            <Button 
              variant={filterStatus === 'active' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button 
              variant={filterStatus === 'closed' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('closed')}
            >
              Closed
            </Button>
          </div>
          <Button onClick={() => navigate('/new-job')}>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">No jobs found</h2>
            <p className="text-gray-500 mb-6">
              {filterStatus !== 'all' 
                ? `You don't have any ${filterStatus} jobs.` 
                : "You haven't posted any jobs yet."}
            </p>
            <Button onClick={() => navigate('/new-job')}>
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} isEmployerView={true} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
