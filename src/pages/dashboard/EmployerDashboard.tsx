
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell } from 'lucide-react'; 
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationsForUser, fetchApplicationsForEmployer } from '@/services/applications';
import { JobPostingsSection } from '@/components/dashboard/employer/JobPostingsSection';
import { RecentApplicationsSection } from '@/components/dashboard/employer/RecentApplicationsSection';
import { DashboardStats } from '@/components/dashboard/employer/DashboardStats';
import { QuickActions } from '@/components/dashboard/employer/QuickActions';
import { CompanyProfileCard } from '@/components/dashboard/employer/CompanyProfileCard';
import { Notification, Job, Application } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['employer-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return fetchNotificationsForUser(user.id, 5) as Promise<Notification[]>;
    },
    enabled: !!user
  });

  // Fetch jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ['employer-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
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
    enabled: !!user?.id
  });

  // Fetch applications
  const { data: applications = [] } = useQuery({
    queryKey: ['employer-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return fetchApplicationsForEmployer(user.id, 10);
    },
    enabled: !!user?.id
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="employer" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employer Dashboard</h1>
          <Button onClick={() => navigate('/new-job')}>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <DashboardStats jobs={jobs} applications={applications} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <JobPostingsSection />
            <RecentApplicationsSection />
          </div>

          <div className="space-y-6">
            <CompanyProfileCard 
              user={user}
              company={user?.user_metadata?.company || ''}
              location={user?.user_metadata?.location || ''}
            />
            
            <DashboardCard 
              title="Notifications" 
              icon={<Bell size={20} />}
              linkText="View All"
              linkUrl="/notifications"
            >
              <NotificationList 
                notifications={notifications}
                limit={3}
              />
            </DashboardCard>

            <QuickActions />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
