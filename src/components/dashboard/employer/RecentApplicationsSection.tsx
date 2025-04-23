import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Check, X, Mail } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ApplicationCard } from "@/components/cards/ApplicationCard";
import { Spinner } from "@/components/ui/spinner";
import { Application, Student } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function RecentApplicationsSection() {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
          queryClient.invalidateQueries({ queryKey: ['employer-dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['employer-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log("Fetching applications for employer:", user.id);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(title, company),
          student:profiles(id, name, email, skills, location, resume_url)
        `)
        .eq('jobs.employer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching applications:", error);
        throw error;
      }
      
      console.log("Applications data:", data);
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
    refetchInterval: 30000,
    enabled: !!user?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', applicationId);
      
      if (error) throw error;
      return { applicationId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard-stats'] });
      toast.success(`Application ${data.status === 'shortlisted' ? 'shortlisted' : data.status === 'rejected' ? 'rejected' : 'updated'}`);
    },
    onError: (error) => {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
      
      if (error) throw error;
      return applicationId;
    },
    onSuccess: (applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard-stats'] });
      toast.success('Application rejected and removed');
    },
    onError: (error) => {
      console.error('Error deleting application:', error);
      toast.error('Failed to reject application');
    }
  });

  const handleShortlist = (applicationId: string) => {
    updateStatusMutation.mutate({ applicationId, status: 'shortlisted' });
  };

  const handleReject = (applicationId: string) => {
    deleteApplicationMutation.mutate(applicationId);
  };

  const handleContactStudent = (studentId: string) => {
    const application = applications.find(app => app.studentId === studentId);
    const student = application?.student;
    
    if (student?.email) {
      window.location.href = `mailto:${student.email}?subject=Regarding your job application`;
    } else {
      toast.error('Unable to contact student. Email not available.');
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
            <div key={application.id} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {application.student?.name || "Anonymous Applicant"}
                  </h3>
                  <p className="text-gray-500 mb-3">{application.student?.location || "Unknown location"}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => handleShortlist(application.id)}
                    disabled={application.status === 'shortlisted'}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {application.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(application.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>

              {application.jobTitle && (
                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium">Applied for: {application.jobTitle}</p>
                  <p className="text-sm text-gray-500">at {application.jobCompany}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Applied on: {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {application.student?.skills && application.student.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {application.student.skills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {application.student.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                        +{application.student.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                {application.student?.resumeUrl ? (
                  <a 
                    href={application.student.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Resume
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">No resume available</span>
                )}
                
                <Button 
                  size="sm" 
                  onClick={() => handleContactStudent(application.studentId)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
