
import { useState } from 'react';
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

// Mock data for demonstration
const mockSkills = ['React', 'JavaScript', 'TypeScript', 'UI/UX Design'];
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
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'UX Designer',
    company: 'Creative Solutions',
    location: 'New York, NY',
    description: 'Join our team to create beautiful and intuitive user experiences for our products.',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
    qualifications: ['Bachelor\'s in Design or related field', '3+ years of experience'],
    employerId: '2',
    status: 'active',
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];
const mockRecommendedJobs: Job[] = [
  {
    id: '3',
    title: 'React Developer',
    company: 'Web Wizards LLC',
    location: 'Austin, TX (Remote)',
    description: 'Looking for a React developer to join our growing team working on exciting projects.',
    skills: ['React', 'JavaScript', 'Redux', 'Node.js'],
    qualifications: ['Bachelor\'s degree', '1+ years of experience'],
    employerId: '3',
    status: 'active',
    createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  }
];

export default function StudentDashboard() {
  const [skills, setSkills] = useState<string[]>(mockSkills);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
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
              <SkillsList 
                skills={skills} 
                onAddSkill={addSkill} 
                onRemoveSkill={removeSkill} 
                editable={true} 
              />
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
              count={mockJobs.length}
              linkText="View All"
              linkUrl="/my-applications"
            >
              <div className="space-y-4">
                {mockJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
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
                <h3 className="font-medium text-lg">John Doe</h3>
                <p className="text-gray-500">Computer Science Student</p>
                <p className="text-gray-500 text-sm mt-1">San Francisco, CA</p>
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
              <div className="space-y-4">
                {mockRecommendedJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
