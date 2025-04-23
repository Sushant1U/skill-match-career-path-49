
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Calendar, Clock, Building } from 'lucide-react';

interface ApplicationWithJob {
  id: string;
  jobId: string;
  status: 'pending' | 'shortlisted' | 'rejected';
  createdAt: string;
  job: {
    title: string;
    company: string;
    location: string;
  };
}

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          status,
          created_at,
          jobs:job_id (
            title,
            company,
            location
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(app => ({
        id: app.id,
        jobId: app.job_id,
        status: app.status as 'pending' | 'shortlisted' | 'rejected',
        createdAt: app.created_at,
        job: {
          title: app.jobs.title,
          company: app.jobs.company,
          location: app.jobs.location
        }
      })) as ApplicationWithJob[];
    },
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-10 text-center">
              <h2 className="text-xl font-medium mb-2">No applications yet</h2>
              <p className="text-gray-500 mb-6">
                You haven't applied to any jobs yet. Browse available jobs to get started.
              </p>
              <Button onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div 
                  key={app.id}
                  className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{app.job.title}</h3>
                      <div className="flex items-center mt-1">
                        <Building className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-platformBlue">{app.job.company}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {app.status === 'pending' 
                          ? 'Awaiting review' 
                          : app.status === 'shortlisted'
                            ? 'You\'ve been shortlisted!'
                            : 'Not selected for this role'}
                      </span>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/jobs/${app.jobId}`)}
                    >
                      View Job
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
