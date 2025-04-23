
import { Building, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";

interface CompanyProfileCardProps {
  user: User | any; // Allow for Supabase user type
  company: string;
  location: string;
}

export function CompanyProfileCard({ user, company, location }: CompanyProfileCardProps) {
  const navigate = useNavigate();

  // Safely access user metadata
  const userData = user || {};
  const userMeta = (userData as any).user_metadata || {};

  return (
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
        <h3 className="font-medium text-lg">
          {company || userMeta.name || 'Your Company'}
        </h3>
        <p className="text-gray-500">{userMeta.industry || 'Technology'}</p>
        <p className="text-gray-500 text-sm mt-1">{location || 'No location set'}</p>
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
    </DashboardCard>
  );
}
