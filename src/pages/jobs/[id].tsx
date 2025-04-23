
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Briefcase, MapPin, Building, Calendar } from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) throw jobError;
        
        // Check if user has already applied
        if (user) {
          const { data: applicationData, error: appError } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', id)
            .eq('student_id', user.id)
            .maybeSingle();
          
          if (!appError && applicationData) {
            setHasApplied(true);
          }
        }
        
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please log in to apply for this job");
      return;
    }
    
    if (hasApplied) {
      toast.info("You've already applied to this job");
      return;
    }
    
    try {
      setIsApplying(true);
      
      // First check if user has a resume
      const { data: profileData } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', user.id)
        .single();
        
      if (!profileData?.resume_url) {
        toast.warning("Please upload your resume before applying for jobs", {
          action: {
            label: "Upload Resume",
            onClick: () => window.location.href = "/profile/edit"
          }
        });
        return;
      }
      
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: id,
          student_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          resume_url: profileData.resume_url
        });
        
      if (error) throw error;
      
      setHasApplied(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Job Not Found</h1>
            <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs" className="mt-4 inline-block text-platformBlue hover:underline">
              Back to Jobs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Link to="/jobs" className="text-platformBlue hover:underline font-medium">
              &larr; Back to Jobs
            </Link>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status === 'active' ? 'Active' : 'Closed'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-gray-600 mb-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.job_type || 'Full-time'}</span>
                    </div>
                  </div>
                </div>
                
                {job.status === 'active' && (
                  <Button 
                    size="lg" 
                    onClick={handleApply} 
                    disabled={isApplying || hasApplied || !user}
                  >
                    {isApplying ? (
                      <><Spinner size="sm" className="mr-2" /> Applying...</>
                    ) : hasApplied ? (
                      'Application Submitted'
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                )}
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-base">{job.description}</pre>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-gray-50 text-gray-800">
                      {skill}
                    </Badge>
                  )) || <span className="text-gray-500">No specific skills listed</span>}
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Qualifications</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {job.qualifications?.map((qualification: string, index: number) => (
                    <li key={index} className="text-gray-700">{qualification}</li>
                  )) || <span className="text-gray-500">No specific qualifications listed</span>}
                </ul>
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-200">
                {job.status === 'active' ? (
                  <Button 
                    className="w-full md:w-auto" 
                    size="lg"
                    onClick={handleApply}
                    disabled={isApplying || hasApplied || !user}
                  >
                    {isApplying ? (
                      <><Spinner size="sm" className="mr-2" /> Applying...</>
                    ) : hasApplied ? (
                      'Application Submitted'
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-md text-center">
                    <p className="text-gray-600 font-medium">This job posting has closed and is no longer accepting applications.</p>
                  </div>
                )}
                
                {!user && (
                  <p className="mt-2 text-center text-gray-600">
                    <Link to="/login" className="text-platformBlue hover:underline">Login</Link> or{' '}
                    <Link to="/signup" className="text-platformBlue hover:underline">Sign up</Link> to apply for this job.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
