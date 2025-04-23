
import { supabase } from '@/integrations/supabase/client';
import { Application, Student } from '@/types';

export async function fetchApplicationsForEmployer(employerId: string, limit?: number): Promise<Application[]> {
  try {
    // First, get all jobs posted by this employer
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('employer_id', employerId);
    
    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) return [];
    
    const jobIds = jobs.map(job => job.id);
    
    // Then, get applications for those jobs
    let query = supabase
      .from('applications')
      .select('*')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(app => ({
      id: app.id,
      jobId: app.job_id,
      studentId: app.student_id,
      status: app.status,
      createdAt: app.created_at,
    }));
  } catch (error) {
    console.error('Error fetching applications for employer:', error);
    return [];
  }
}

export async function fetchStudentProfile(studentId: string): Promise<Student | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      userId: data.id,
      name: data.name || 'Anonymous User',
      email: data.email,
      skills: data.skills || [],
      qualifications: data.qualifications || [],
      location: data.location || 'Location not specified',
      resumeUrl: data.resume_url,
    };
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return null;
  }
}

export async function fetchNotificationsForUser(userId: string, limit?: number): Promise<any[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}
