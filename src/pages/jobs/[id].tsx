
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Building, MapPin, Calendar, Briefcase } from 'lucide-react';
import type { Job } from '@/types';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        skills: data.skills,
        qualifications: data.qualifications,
        employerId: data.employer_id,
        status: data.status as 'active' | 'closed',
        createdAt: data.created_at,
        applications: data.applications_count,
      } as Job;
    },
    enabled: !!id
  });

  const { data: hasApplied } = useQuery({
    queryKey: ['application', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return false;
      
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!id && !!user?.id
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!job || !user) throw new Error('Missing job or user');
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          student_id: user.id,
          status: 'pending'
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id, user?.id] });
      toast.success('Application submitted successfully');
      setCoverLetter('');
    },
    onError: (error) => {
      console.error('Application error:', error);
      toast.error('Failed to submit application');
    }
  });

  const handleApply = async () => {
    if (user?.role !== 'student') {
      toast.error('Only students can apply for jobs');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await applyMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar userRole={user?.role as any} />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16 flex justify-center items-center">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar userRole={user?.role as any} />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Job not found</h2>
            <p className="text-gray-500 mt-2">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/jobs')} className="mt-4">
              Browse Jobs
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole={user?.role as any} />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/jobs')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Jobs
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{job.title}</h1>
                <div className="flex items-center mt-2">
                  <Building className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-platformBlue font-medium">{job.company}</span>
                </div>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-gray-500">{job.location}</span>
                </div>
              </div>
              <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                {job.status === 'active' ? 'Active' : 'Closed'}
              </Badge>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{job.applications || 0} application{job.applications !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-semibold mb-2">Job Description</h2>
                  <div className="text-gray-700 whitespace-pre-line">
                    {job.description}
                  </div>
                </section>
                
                <section>
                  <h2 className="text-lg font-semibold mb-2">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
                
                <section>
                  <h2 className="text-lg font-semibold mb-2">Qualifications</h2>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {job.qualifications.map((qual, index) => (
                      <li key={index}>{qual}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
            
            {user?.role === 'student' && job.status === 'active' && (
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                {hasApplied ? (
                  <div className="text-center p-4">
                    <h3 className="text-lg font-medium text-green-600 mb-2">
                      You've already applied to this job
                    </h3>
                    <p className="text-gray-600">
                      Your application has been submitted. You'll be notified when there's an update.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Apply for this Position</h3>
                    <div className="mb-4">
                      <label 
                        htmlFor="coverLetter" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cover Letter (Optional)
                      </label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Tell us why you're a good fit for this role..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={5}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      onClick={handleApply}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
