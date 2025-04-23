
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { JobCard } from '@/components/cards/JobCard';
import { StudentProfileCard } from '@/components/cards/StudentProfileCard';
import { 
  PieChart,
  BarChart3,
  Briefcase, 
  Users,
  Bell,
  Building,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job, Notification, Student } from '@/types';

// Mock data for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'New Application',
    message: 'A new candidate has applied for the Frontend Developer position.',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '1',
    title: 'Job Post Expiring',
    message: 'Your "UX Designer" job post will expire in 3 days.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Innovations Inc.',
    location: 'San Francisco, CA (Remote)',
    description: 'We are looking for a skilled Frontend Developer proficient in React and modern JavaScript.',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
    qualifications: ['Bachelor\'s in Computer Science or related field', '2+ years of experience'],
    employerId: '1',
    status: 'active',
    createdAt: new Date().toISOString(),
    applications: 12
  },
  {
    id: '2',
    title: 'UX Designer',
    company: 'Tech Innovations Inc.',
    location: 'San Francisco, CA',
    description: 'Join our team to create beautiful and intuitive user experiences for our products.',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
    qualifications: ['Bachelor\'s in Design or related field', '3+ years of experience'],
    employerId: '1',
    status: 'active',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    applications: 8
  }
];
const mockRecentApplicants: Student[] = [
  {
    id: '1',
    userId: '101',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
    qualifications: ['Bachelor\'s in Computer Science', 'Frontend Development Certificate'],
    location: 'San Francisco, CA',
    resumeUrl: '#'
  },
  {
    id: '2',
    userId: '102',
    name: 'Bob Smith',
    email: 'bob@example.com',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Adobe XD'],
    qualifications: ['Master\'s in Design', 'UX Certificate'],
    location: 'New York, NY',
    resumeUrl: '#'
  }
];

export default function EmployerDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
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

  // Count active and closed jobs
  const activeJobs = mockJobs.filter(job => job.status === 'active').length;
  const closedJobs = mockJobs.filter(job => job.status === 'closed').length;
  const totalApplications = mockJobs.reduce((sum, job) => sum + (job.applications || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="employer" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employer Dashboard</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold">{mockJobs.length}</p>
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
                <p className="text-2xl font-bold">87%</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <BarChart3 className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active job postings */}
            <DashboardCard 
              title="Job Postings" 
              icon={<Briefcase size={20} />}
              count={mockJobs.length}
              linkText="View All"
              linkUrl="/employer/jobs"
            >
              <div className="space-y-4">
                {mockJobs.map(job => (
                  <JobCard key={job.id} job={job} isEmployerView={true} />
                ))}
              </div>
            </DashboardCard>

            {/* Recent applicants */}
            <DashboardCard 
              title="Recent Applicants" 
              icon={<Users size={20} />}
              linkText="View All Candidates"
              linkUrl="/employer/applicants"
            >
              <div className="space-y-4">
                {mockRecentApplicants.map(student => (
                  <StudentProfileCard 
                    key={student.id} 
                    student={student} 
                    matchPercentage={Math.floor(Math.random() * 30) + 70} // Random match between 70-100%
                  />
                ))}
              </div>
            </DashboardCard>

            {/* Analytics */}
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
                    {mockJobs.map(job => (
                      <div key={job.id} className="flex justify-between items-center">
                        <div className="text-sm truncate max-w-[180px]">{job.title}</div>
                        <div className="ml-2 flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-platformBlue h-2 rounded-full" 
                              style={{ width: `${Math.min(100, ((job.applications || 0) / 15) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{job.applications}</span>
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

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Company profile card */}
            <DashboardCard 
              title="Company Profile" 
              icon={<Building size={20} />}
              linkText="Edit"
              linkUrl="/employer/profile/edit"
            >
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-4">
                  <Building size={36} />
                </div>
                <h3 className="font-medium text-lg">Tech Innovations Inc.</h3>
                <p className="text-gray-500">Technology</p>
                <p className="text-gray-500 text-sm mt-1">San Francisco, CA</p>
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
              <Button className="w-full mt-4" variant="outline">
                View Public Profile
              </Button>
            </DashboardCard>
            
            {/* Notifications */}
            <DashboardCard 
              title="Notifications" 
              icon={<Bell size={20} />}
              linkText="View All"
              linkUrl="/employer/notifications"
            >
              <NotificationList 
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                limit={3}
              />
            </DashboardCard>

            {/* Quick actions */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Post a New Job
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" /> Browse Candidates
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Building className="mr-2 h-4 w-4" /> Update Company Profile
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
