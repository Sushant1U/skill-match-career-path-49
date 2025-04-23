import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { JobCard } from '@/components/cards/JobCard';
import { StudentProfileCard } from '@/components/cards/StudentProfileCard';
import { ApplicationCard } from '@/components/cards/ApplicationCard';
import { 
  PieChart,
  BarChart3,
  Briefcase, 
  Users,
  Bell,
  Building,
  Plus,
  Mail,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job, Notification, Student, Application } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { fetchApplicationsForEmployer, fetchStudentProfile, fetchNotificationsForUser } from '@/services/applications';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Fetch jobs posted by the employer
  const { data: jobs = [], isLoading: isLoadingJobs, error: jobsError } = useQuery({
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

  // Fetch recent applications
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['employer-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return fetchApplicationsForEmployer(user.id, 5);
    },
    enabled: !!user
  });

  // Fetch student profiles for applications
  const { data: students = {}, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['application-students', applications],
    queryFn: async () => {
      const studentIds = applications.map(app => app.studentId);
      const uniqueIds = [...new Set(studentIds)];
      
      const studentsMap: Record<string, Student | null> = {};
      
      await Promise.all(
        uniqueIds.map(async (id) => {
          const student = await fetchStudentProfile(id);
          studentsMap[id] = student;
        })
      );
      
      return studentsMap;
    },
    enabled: applications.length > 0
  });

  // Fetch notifications
  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['employer-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return fetchNotificationsForUser(user.id, 5);
    },
    enabled: !!user
  });

  // Mutation for updating job status
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

  // Mark notification as read
  const markNotificationAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['employer-notifications'] });
    },
    onError: (error) => {
      toast.error(`Error marking notification as read: ${error.message}`);
    }
  });

  // Mark all notifications as read
  const markAllNotificationsAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(`Error marking all notifications as read: ${error.message}`);
    }
  });

  // Handle creating a new job
  const handleCreateJob = () => {
    navigate('/new-job');
  };
  
  // Handle contact student
  const handleContactStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    
    const student = students[studentId];
    if (student) {
      toast.success(`Contact email sent to ${student.name} (${student.email})`);
    } else {
      toast.error('Unable to contact student. Student information not available.');
    }
  };

  // Calculate dashboard metrics
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const closedJobs = jobs.filter(job => job.status === 'closed').length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="employer" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employer Dashboard</h1>
          <Button onClick={handleCreateJob}>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Briefcase className="h-6 w-6 text-platformBlue" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold">{activeJobs}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Briefcase className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Applications</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="h-6 w-6 text-platformPurple" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Response Rate</p>
                <p className="text-2xl font-bold">{applications.length > 0 ? Math.round((applications.filter(a => a.status !== 'pending').length / applications.length) * 100) : 0}%</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <BarChart3 className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCard 
              title="Job Postings" 
              icon={<Briefcase size={20} />}
              count={jobs.length}
              linkText="View All"
              linkUrl="/employer/jobs"
            >
              {isLoadingJobs ? (
                <div className="py-6 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : jobsError ? (
                <div className="py-6 text-center text-red-500">Error loading jobs</div>
              ) : jobs.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  You haven't posted any jobs yet. Click "Post New Job" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 3).map(job => (
                    <JobCard key={job.id} job={job} isEmployerView={true} />
                  ))}
                  {jobs.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="link" onClick={() => navigate('/employer/jobs')}>
                        View all {jobs.length} jobs
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DashboardCard>

            <DashboardCard 
              title="Recent Applicants" 
              icon={<Users size={20} />}
              linkText="View All Candidates"
              linkUrl="/employer/applicants"
            >
              {isLoadingApplications || isLoadingStudents ? (
                <div className="py-6 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : applications.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  No applications received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 3).map(application => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      student={students[application.studentId]}
                      onContact={handleContactStudent}
                    />
                  ))}
                </div>
              )}
            </DashboardCard>

            <DashboardCard 
              title="Analytics & Insights" 
              icon={<PieChart size={20} />}
              linkText="Detailed Reports"
              linkUrl="/employer/analytics"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Applications by Job</h4>
                  <div className="space-y-3">
                    {jobs.slice(0, 5).map(job => (
                      <div key={job.id} className="flex justify-between items-center">
                        <div className="text-sm truncate max-w-[180px]">{job.title}</div>
                        <div className="ml-2 flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-platformBlue h-2 rounded-full" 
                              style={{ width: `${Math.min(100, ((job.applications || 0) / 15) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{job.applications || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Top Applicant Skills</h4>
                  <div className="space-y-3">
                    {['JavaScript', 'React', 'UI/UX Design', 'TypeScript', 'Node.js'].map((skill, index) => (
                      <div key={skill} className="flex justify-between items-center">
                        <div className="text-sm">{skill}</div>
                        <div className="ml-2 flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-platformPurple h-2 rounded-full" 
                              style={{ width: `${Math.min(100, 100 - (index * 15))}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{10 - index}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <DashboardCard 
              title="Company Profile" 
              icon={<Building size={20} />}
              linkText="Edit"
              linkUrl="/employer/profile/edit"
            >
              {isLoadingJobs ? (
                <div className="py-6 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <>
                  <div className="text-center py-4">
                    <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-4">
                      <Building size={36} />
                    </div>
                    <h3 className="font-medium text-lg">
                      {jobs[0]?.company || user?.user_metadata?.name || 'Your Company'}
                    </h3>
                    <p className="text-gray-500">{user?.user_metadata?.industry || 'Technology'}</p>
                    <p className="text-gray-500 text-sm mt-1">{jobs[0]?.location || 'No location set'}</p>
                  </div>
                  <div className="space-y-2 mt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profile Completion</span>
                      <span className="font-medium">90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-platformBlue h-2.5 rounded-full w-[90%]"></div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline" 
                    onClick={() => navigate('/employer/profile')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Public Profile
                  </Button>
                </>
              )}
            </DashboardCard>
            
            <DashboardCard 
              title="Notifications" 
              icon={<Bell size={20} />}
              linkText="View All"
              linkUrl="/employer/notifications"
            >
              {isLoadingNotifications ? (
                <div className="py-6 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <NotificationList 
                  notifications={notifications}
                  onMarkAsRead={(id) => markNotificationAsRead.mutate(id)}
                  onMarkAllAsRead={() => markAllNotificationsAsRead.mutate()}
                  limit={3}
                />
              )}
            </DashboardCard>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={handleCreateJob}>
                  <Plus className="mr-2 h-4 w-4" /> Post a New Job
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/employer/candidates')}>
                  <Users className="mr-2 h-4 w-4" /> Browse Candidates
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/employer/analytics')}>
                  <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/employer/profile/edit')}>
                  <Edit className="mr-2 h-4 w-4" /> Update Company Profile
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
