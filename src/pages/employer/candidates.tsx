
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentProfileCard } from '@/components/cards/StudentProfileCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Student } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Search } from 'lucide-react';

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
      
      if (error) throw error;
      
      return (data || []).map(profile => ({
        id: profile.id,
        userId: profile.id,
        name: profile.name || 'Anonymous User',
        email: profile.email,
        skills: profile.skills || [],
        qualifications: profile.qualifications || [],
        location: profile.location || 'Location not specified',
        resumeUrl: profile.resume_url,
      })) as Student[];
    }
  });

  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.location.toLowerCase().includes(query) ||
      student.skills.some(skill => skill.toLowerCase().includes(query)) ||
      student.qualifications.some(qual => qual.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar userRole="employer" />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/employer-dashboard')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Browse Candidates</h1>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search candidates by name, skills, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">No candidates found</h2>
            <p className="text-gray-500">
              Try adjusting your search filters or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStudents.map(student => (
              <StudentProfileCard
                key={student.id}
                student={student}
                matchPercentage={Math.floor(Math.random() * 20) + 80}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
