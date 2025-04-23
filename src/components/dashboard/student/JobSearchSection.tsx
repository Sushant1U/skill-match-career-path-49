
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Job } from '@/types';

export function JobSearchSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    remote: false,
    fullTime: false,
    internship: false
  });

  // Fetch jobs from Supabase
  const { data: jobs = [] } = useQuery({
    queryKey: ['dashboard-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map(job => ({
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

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRemote = !selectedFilters.remote || 
      job.location.toLowerCase().includes('remote');

    return matchesSearch && matchesRemote;
  });

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.append('search', searchQuery);
    if (selectedFilters.remote) searchParams.append('remote', 'true');
    if (selectedFilters.fullTime) searchParams.append('fullTime', 'true');
    if (selectedFilters.internship) searchParams.append('internship', 'true');
    
    navigate(`/jobs?${searchParams.toString()}`);
  };

  const toggleFilter = (filter: keyof typeof selectedFilters) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  return (
    <DashboardCard 
      title="Find Jobs" 
      icon={<Search size={20} />}
      linkText="Advanced Search"
      linkUrl="/jobs"
    >
      <div className="space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for jobs, skills, or locations"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-platformBlue focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </form>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedFilters.remote ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('remote')}
          >
            Remote Only
          </Button>
          <Button 
            variant={selectedFilters.fullTime ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('fullTime')}
          >
            Full-time
          </Button>
          <Button 
            variant={selectedFilters.internship ? "default" : "outline"} 
            size="sm"
            onClick={() => toggleFilter('internship')}
          >
            Internship
          </Button>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="mt-4 space-y-2">
            {filteredJobs.slice(0, 3).map(job => (
              <div 
                key={job.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <h3 className="font-medium text-platformBlue">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-xs text-gray-500">{job.location}</p>
              </div>
            ))}
            {jobs.length > 3 && (
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/jobs')}
              >
                View All Jobs ({jobs.length})
              </Button>
            )}
          </div>
        ) : searchQuery ? (
          <p className="text-center text-gray-500 py-4">
            No jobs found matching your search criteria
          </p>
        ) : null}
      </div>
    </DashboardCard>
  );
}
