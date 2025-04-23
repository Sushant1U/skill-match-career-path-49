
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SkillsList } from '@/components/dashboard/SkillsList';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { JobCard } from '@/components/cards/JobCard';
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  Bell,
  FileUp,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job, Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';

// Mock data for notifications (we'll implement real notifications later)
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Application Status Update',
    message: 'Your application for Frontend Developer at Tech Co. has been reviewed.',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '1',
    title: 'New Job Match',
    message: 'We found a new job matching your skills: Full Stack Developer at DevCorp.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];

export default function StudentDashboard() {
  const { user, userRole } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  // Fetch jobs from Supabase
  const { data: jobs, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
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
    }
  });

  // Fetch user profile including skills
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Update skills when profile is loaded
  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

  const addSkill = async (skill: string) => {
    if (!user) return;
    if (!skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      
      // Update skills in database
      const { error } = await supabase
        .from('profiles')
        .update({ skills: newSkills })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update skills');
        // Revert changes
        setSkills(skills);
      }
    }
  };

  const removeSkill = async (skill: string) => {
    if (!user) return;
    const newSkills = skills.filter(s => s !== skill);
    setSkills(newSkills);
    
    // Update skills in database
    const { error } = await supabase
      .from('profiles')
      .update({ skills: newSkills })
      .eq('id', user.id);
    
    if (error) {
      toast.error('Failed to update skills');
      // Revert changes
      setSkills(skills);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Find recommended jobs based on skills match
  const recommendedJobs = jobs ? jobs
    .filter(job => job.skills.some(skill => skills.includes(skill)))
    .slice(0, 3) : [];

  // Recently applied jobs (mock for now)
  const appliedJobs = jobs ? jobs.slice(0, 2) : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="student" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <Button>Update Profile</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills section */}
            <DashboardCard 
              title="My Skills" 
              icon={<GraduationCap size={20} />} 
              linkText="Skill Assessment"
              linkUrl="/skills/assessment"
            >
              {profileLoading ? (
                <div className="py-6 text-center">Loading skills...</div>
              ) : (
                <SkillsList 
                  skills={skills} 
                  onAddSkill={addSkill} 
                  onRemoveSkill={removeSkill} 
                  editable={true} 
                />
              )}
            </DashboardCard>

            {/* Job search section */}
            <DashboardCard 
              title="Find Jobs" 
              icon={<Search size={20} />}
              linkText="Advanced Search"
              linkUrl="/jobs/search"
            >
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for jobs, skills, or companies"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-platformBlue focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Location: Any</Button>
                  <Button variant="outline" size="sm">Remote Only</Button>
                  <Button variant="outline" size="sm">Full-time</Button>
                  <Button variant="outline" size="sm">Internship</Button>
                </div>
              </div>
            </DashboardCard>

            {/* Applied jobs */}
            <DashboardCard 
              title="Applied Jobs" 
              icon={<Briefcase size={20} />}
              count={appliedJobs.length}
              linkText="View All"
              linkUrl="/my-applications"
            >
              {jobsLoading ? (
                <div className="py-6 text-center">Loading jobs...</div>
              ) : jobsError ? (
                <div className="py-6 text-center text-red-500">Error loading jobs</div>
              ) : appliedJobs.length === 0 ? (
                <div className="py-6 text-center text-gray-500">No job applications yet</div>
              ) : (
                <div className="space-y-4">
                  {appliedJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Profile summary card */}
            <DashboardCard 
              title="Profile" 
              icon={<User size={20} />}
              linkText="Edit"
              linkUrl="/profile/edit"
            >
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-4">
                  <User size={36} />
                </div>
                <h3 className="font-medium text-lg">{profile?.name || user?.user_metadata?.name || 'Student'}</h3>
                <p className="text-gray-500">Computer Science Student</p>
                <p className="text-gray-500 text-sm mt-1">{profile?.location || 'No location set'}</p>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Profile Completion</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-platformBlue h-2.5 rounded-full w-3/4"></div>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <FileUp className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </DashboardCard>
            
            {/* Notifications */}
            <DashboardCard 
              title="Notifications" 
              icon={<Bell size={20} />}
              linkText="View All"
              linkUrl="/notifications"
            >
              <NotificationList 
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                limit={3}
              />
            </DashboardCard>

            {/* Recommended jobs */}
            <DashboardCard 
              title="Recommended For You" 
              icon={<Briefcase size={20} />}
              linkText="View All"
              linkUrl="/jobs/recommended"
            >
              {jobsLoading ? (
                <div className="py-6 text-center">Loading recommendations...</div>
              ) : jobsError ? (
                <div className="py-6 text-center text-red-500">Error loading recommendations</div>
              ) : recommendedJobs.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  Add skills to get job recommendations
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
