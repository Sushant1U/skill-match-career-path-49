import { supabase } from '@/integrations/supabase/client';
import { Application, Student, Notification } from '@/types';

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
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        student_id,
        status,
        created_at
      `)
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })
      .limit(limit || 10);
    
    if (error) throw error;
    
    return (applications || []).map(app => ({
      id: app.id,
      jobId: app.job_id,
      studentId: app.student_id,
      status: app.status as 'pending' | 'shortlisted' | 'rejected',
      createdAt: app.created_at,
    }));
  } catch (error) {
    console.error('Error fetching applications for employer:', error);
    return [];
  }
}

export async function fetchNotificationsForUser(userId: string, limit?: number): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        message,
        read,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 10);
    
    if (error) throw error;
    
    // Map the database results to our custom Notification type
    return (data || []).map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.created_at,
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
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
