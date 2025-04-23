
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function JobSearchSection() {
  return (
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
  );
}
