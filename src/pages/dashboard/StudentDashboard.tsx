
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ProfileSection } from '@/components/dashboard/student/ProfileSection';
import { SkillsSection } from '@/components/dashboard/student/SkillsSection';
import { JobSearchSection } from '@/components/dashboard/student/JobSearchSection';
import { AppliedJobsSection } from '@/components/dashboard/student/AppliedJobsSection';
import { RecommendedJobsSection } from '@/components/dashboard/student/RecommendedJobsSection';
import { NotificationsSection } from '@/components/dashboard/student/NotificationsSection';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileUp } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="student" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <Link to="/profile/edit">
            <Button className="flex items-center gap-2">
              <FileUp size={16} />
              Update Profile & Resume
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <SkillsSection />
            <JobSearchSection />
            <AppliedJobsSection />
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            <ProfileSection />
            <NotificationsSection />
            <RecommendedJobsSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
