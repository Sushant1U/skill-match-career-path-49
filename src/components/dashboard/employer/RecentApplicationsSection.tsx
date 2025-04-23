
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ApplicationCard } from "@/components/cards/ApplicationCard";
import { Spinner } from "@/components/ui/spinner";
import { Application, Student } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function RecentApplicationsSection() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch applications with real-time updates
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['employer-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(title, company),
          student:profiles(id, name, email, skills, location, resume_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return (data || []).map(app => ({
        id: app.id,
        jobId: app.job_id,
        studentId: app.student_id,
        status: app.status,
        createdAt: app.created_at,
        resumeUrl: app.resume_url || app.student?.resume_url,
        jobTitle: app.job?.title,
        jobCompany: app.job?.company,
        student: app.student ? {
          id: app.student.id,
          name: app.student.name || 'Anonymous',
          email: app.student.email,
          skills: app.student.skills || [],
          location: app.student.location || 'Location not specified',
          resumeUrl: app.student.resume_url
        } : null
      })) as (Application & { 
        student: Student | null, 
        jobTitle?: string, 
        jobCompany?: string 
      })[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const handleContactStudent = (studentId: string) => {
    const application = applications.find(app => app.studentId === studentId);
    const student = application?.student;
    
    if (student) {
      setSelectedStudentId(studentId);
      
      // In a real app, this would open a contact modal or form
      // For now, we'll just show a toast notification
      toast.success(`Contact initiated with ${student.name} (${student.email})`);
      
      // Update the application status to "contacted" in the database
      supabase
        .from('applications')
        .update({ status: 'contacted' })
        .eq('student_id', studentId)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating application status:', error);
            toast.error('Failed to update contact status');
          }
        });
    } else {
      toast.error('Unable to contact student. Student information not available.');
    }
  };

  return (
    <DashboardCard 
      title="Recent Applicants" 
      icon={<Users size={20} />}
      linkText="View All Candidates"
      linkUrl="/employer/applicants"
    >
      {isLoadingApplications ? (
        <div className="py-6 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          No applications received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(application => (
            <ApplicationCard
              key={application.id}
              application={{
                id: application.id,
                jobId: application.jobId,
                studentId: application.studentId,
                status: application.status,
                createdAt: application.createdAt,
                resumeUrl: application.resumeUrl,
              }}
              student={application.student}
              onContact={handleContactStudent}
              jobTitle={application.jobTitle}
              jobCompany={application.jobCompany}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
