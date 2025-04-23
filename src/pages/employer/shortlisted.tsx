
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/cards/ApplicationCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Application, Student } from '@/types';
import { toast } from '@/components/ui/sonner';
import { ChevronLeft } from 'lucide-react';

export default function ShortlistedApplicantsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<(Application & { student: Student, jobTitle?: string, jobCompany?: string })[]>([]);

  useEffect(() => {
    async function fetchShortlistedApplications() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching shortlisted applications for employer:", user.id);
        
        // First get all jobs posted by this employer
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, company')
          .eq('employer_id', user.id);

        if (jobsError) {
          console.error("Error fetching jobs:", jobsError);
          throw jobsError;
        }

        if (!jobs || jobs.length === 0) {
          console.log("No jobs found for employer");
          setIsLoading(false);
          return;
        }

        const jobIds = jobs.map(job => job.id);
        console.log("Job IDs:", jobIds);
        
        const jobDetailsMap = jobs.reduce((acc, job) => {
          acc[job.id] = { title: job.title, company: job.company };
          return acc;
        }, {} as Record<string, { title: string, company: string }>);

        // First fetch all shortlisted applications
        const { data: applications, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('status', 'shortlisted')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });
          
        if (applicationsError) {
          console.error("Error fetching shortlisted applications:", applicationsError);
          throw applicationsError;
        }
        
        if (!applications || applications.length === 0) {
          console.log("No shortlisted applications found");
          setIsLoading(false);
          return;
        }
        
        // Now collect all student IDs to fetch their profiles
        const studentIds = applications
          .map(app => app.student_id)
          .filter(Boolean) as string[];
        
        console.log("Student IDs for shortlisted:", studentIds);
        
        // Fetch all relevant student profiles in one query
        let studentProfiles: Record<string, any> = {};
        
        if (studentIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', studentIds);
            
          if (profilesError) {
            console.error("Error fetching student profiles:", profilesError);
            // Don't throw, just continue with empty profiles
          } else if (profiles && profiles.length > 0) {
            console.log("Fetched student profiles for shortlisted:", profiles);
            
            // Create a map of student ID to profile data
            studentProfiles = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {} as Record<string, any>);
            
            console.log("Fetched student profiles for shortlisted:", profiles.length);
          }
        }

        // Format the data for consumption by the UI
        const formattedApplications = applications.map(app => {
          const studentProfile = studentProfiles[app.student_id || ''];
          console.log("Processing shortlisted application for student:", app.student_id, "Found profile:", !!studentProfile);
          
          return {
            id: app.id,
            jobId: app.job_id,
            studentId: app.student_id,
            status: app.status,
            createdAt: app.created_at,
            resumeUrl: app.resume_url || (studentProfile?.resume_url || ''),
            jobTitle: jobDetailsMap[app.job_id]?.title,
            jobCompany: jobDetailsMap[app.job_id]?.company,
            student: studentProfile ? {
              id: studentProfile.id,
              name: studentProfile.name || 'Anonymous',
              email: studentProfile.email || '',
              skills: studentProfile.skills || [],
              location: studentProfile.location || 'Location not specified',
              resumeUrl: studentProfile.resume_url || '',
              qualifications: studentProfile.qualifications || []
            } : {
              id: app.student_id || '',
              name: 'Anonymous',
              email: '',
              skills: [],
              location: 'Unknown location',
              resumeUrl: '',
              qualifications: []
            }
          };
        });

        console.log("Formatted shortlisted applications:", formattedApplications);
        setApplications(formattedApplications);
      } catch (error) {
        console.error('Error fetching shortlisted applications:', error);
        toast.error('Failed to load shortlisted applications');
      } finally {
        setIsLoading(false);
      }
    }

    fetchShortlistedApplications();
  }, [user?.id]);

  const handleContact = (studentId: string) => {
    const student = applications.find(app => app.student?.id === studentId)?.student;
    console.log("Contacting student:", student);
    if (student?.email) {
      window.location.href = `mailto:${student.email}?subject=Regarding your job application`;
    } else {
      toast.error('Unable to contact student. Email not available.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="employer" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/employer-dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Shortlisted Applicants</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">You haven't shortlisted any applicants yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map(application => (
              <ApplicationCard 
                key={application.id}
                application={application}
                student={application.student}
                onContact={handleContact}
                jobTitle={application.jobTitle}
                jobCompany={application.jobCompany}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
