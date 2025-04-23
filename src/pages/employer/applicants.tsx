
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApplicationCard } from '@/components/cards/ApplicationCard';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Application, Student } from '@/types';
import { useResumeStorage } from '@/hooks/useResumeStorage';

export default function ApplicantsPage() {
  const { user } = useAuth();
  const { bucketExists, isChecking } = useResumeStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<(Application & { 
    student: Student | null, 
    jobTitle?: string, 
    jobCompany?: string 
  })[]>([]);

  useEffect(() => {
    async function fetchApplications() {
      if (!user?.id) return;
      
      if (isChecking) {
        return; // Wait for bucket check to complete
      }
      
      try {
        console.log("Fetching applications for employer:", user.id);
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
        
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            student:profiles(id, name, email, skills, location, resume_url, qualifications)
          `)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching applications:", error);
          throw error;
        }
        
        console.log("Applications data:", data);
        
        const formattedApplications = (data || []).map(app => ({
          id: app.id,
          jobId: app.job_id,
          studentId: app.student_id,
          status: app.status,
          createdAt: app.created_at,
          resumeUrl: app.resume_url || app.student?.resume_url,
          jobTitle: jobDetailsMap[app.job_id]?.title,
          jobCompany: jobDetailsMap[app.job_id]?.company,
          student: app.student ? {
            id: app.student.id,
            name: app.student.name || 'Anonymous',
            email: app.student.email || '',
            skills: app.student.skills || [],
            location: app.student.location || 'Location not specified',
            resumeUrl: app.student.resume_url || '',
            qualifications: app.student.qualifications || []
          } : null
        }));
        
        console.log("Formatted applications:", formattedApplications);
        setApplications(formattedApplications);
      } catch (error: any) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    }

    // Wait until we've checked the bucket before fetching applications
    if (!isChecking) {
      fetchApplications();
    }
  }, [user?.id, isChecking, bucketExists]);

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">All Applicants</h1>

        {isLoading || isChecking ? (
          <div className="flex justify-center items-center py-16">
            <Spinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">You don't have any applicants yet.</p>
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
