
import { Plus, Users, BarChart3, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/new-job')}>
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
  );
}
