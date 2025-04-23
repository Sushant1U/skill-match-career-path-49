
import { Briefcase, Users, BarChart3 } from "lucide-react";
import { Job, Application } from "@/types";

interface DashboardStatsProps {
  jobs: Job[];
  applications: Application[];
}

export function DashboardStats({ jobs, applications }: DashboardStatsProps) {
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications || 0), 0);
  const responseRate = applications.length > 0 
    ? Math.round((applications.filter(a => a.status !== 'pending').length / applications.length) * 100)
    : 0;

  return (
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
            <p className="text-2xl font-bold">{responseRate}%</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-full">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
