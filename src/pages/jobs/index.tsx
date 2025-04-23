
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/cards/JobCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Job } from "@/types";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    remote: false,
    fullTime: false,
    internship: false,
  });

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map the snake_case DB columns to camelCase properties
      return (data || []).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        skills: job.skills,
        qualifications: job.qualifications,
        employerId: job.employer_id, // Convert snake_case to camelCase
        status: job.status as "active" | "closed",
        createdAt: job.created_at, // Convert snake_case to camelCase
        applications: job.applications_count
      })) as Job[];
    }
  });

  // Filter jobs based on search query and filters
  const filteredJobs = jobs.filter(job => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Filter by Remote
    const matchesRemote = !filters.remote || job.location.toLowerCase().includes("remote");

    // We don't have data for full-time vs internship yet, so this is a placeholder
    // In a real app, you'd have job type fields in your database
    return matchesSearch && matchesRemote;
  });

  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Browse Jobs</h1>

        {/* Search and filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.remote ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter("remote")}
            >
              Remote
            </Button>
            <Button
              variant={filters.fullTime ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter("fullTime")}
            >
              Full-time
            </Button>
            <Button
              variant={filters.internship ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter("internship")}
            >
              Internship
            </Button>
          </div>
        </div>

        {/* Job listings */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">Loading jobs...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading jobs. Please try again.
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-10">
              No jobs found. Try adjusting your search criteria.
            </div>
          ) : (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
