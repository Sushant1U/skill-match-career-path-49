
import { useNavigate } from 'react-router-dom';
import { Plus, Bell } from 'lucide-react'; 
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationsForUser } from '@/services/applications';
import { JobPostingsSection } from '@/components/dashboard/employer/JobPostingsSection';
import { RecentApplicationsSection } from '@/components/dashboard/employer/RecentApplicationsSection';
import { DashboardStats } from '@/components/dashboard/employer/DashboardStats';
import { QuickActions } from '@/components/dashboard/employer/QuickActions';
import { CompanyProfileCard } from '@/components/dashboard/employer/CompanyProfileCard';
import { Notification } from '@/types';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['employer-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return fetchNotificationsForUser(user.id, 5) as Promise<Notification[]>;
    },
    enabled: !!user,
    refetchInterval: 60000 // Refetch every minute
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

        <DashboardStats />

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
