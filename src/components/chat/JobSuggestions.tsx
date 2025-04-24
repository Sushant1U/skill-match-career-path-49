
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Job } from '@/types';
import { Briefcase, MapPin, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobSuggestionsProps {
  jobs: Job[];
}

export function JobSuggestions({ jobs }: JobSuggestionsProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayJobs = showAll ? jobs : jobs.slice(0, 3);
  
  if (!jobs || jobs.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-3 space-y-4 animate-fade-in">
      <h3 className="font-semibold flex items-center gap-2 text-platformPurple">
        <Lightbulb className="h-5 w-5" />
        <span>Job Recommendations</span>
      </h3>
      
      <div className="space-y-2">
        {displayJobs.map((job, index) => (
          <Card 
            key={job.id || index} 
            className="p-3 border-l-4 border-l-platformPurple hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-base">{job.title}</h4>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{job.company}</span>
                  
                  <span className="mx-2">•</span>
                  
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                
                {job.skills && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skills.slice(0, 3).map((skill, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-platformPurple"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <Link to={`/jobs/${job.id}`}>
                <Button size="sm" variant="outline" className="text-platformPurple hover:bg-purple-50">
                  View
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
      
      {jobs.length > 3 && (
        <Button 
          variant="ghost" 
          onClick={() => setShowAll(!showAll)}
          className="text-platformPurple w-full text-sm"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show {jobs.length - 3} More Jobs
            </>
          )}
        </Button>
      )}
    </div>
  );
}
