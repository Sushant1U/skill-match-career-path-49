
import { supabase } from '@/integrations/supabase/client';
import { Application, Notification, Student } from '@/types';

export async function fetchApplicationsForEmployer(jobId?: string, limit?: number): Promise<Application[]> {
  let query = supabase
    .from('applications')
    .select(`
      *,
      student:profiles(id, name, email, location, bio, skills, qualifications, resume_url, skillScore)
    `)
    .order('created_at', { ascending: false });
  
  if (jobId) {
    query = query.eq('job_id', jobId);
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
  
  return (data || []).map(app => ({
    id: app.id,
    jobId: app.job_id,
    studentId: app.student_id,
    status: app.status,
    createdAt: app.created_at,
    resumeUrl: app.resume_url || app.student?.resume_url,
    student: app.student ? {
      id: app.student.id,
      name: app.student.name || 'Unknown',
      email: app.student.email || '',
      location: app.student.location || 'No location set',
      bio: app.student.bio,
      skills: app.student.skills || [],
      qualifications: app.student.qualifications || [],
      resumeUrl: app.student.resume_url,
      skillScore: app.student.skillScore
    } : undefined
  }));
}

export async function fetchNotificationsForUser(userId: string, limit?: number): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  
  return (data || []).map(notification => ({
    id: notification.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.created_at,
    type: notification.type,
    linkUrl: notification.link_url
  }));
}

export async function fetchStudentProfile(studentId: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching student profile:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name || 'Unknown',
    email: data.email || '',
    location: data.location || 'No location set',
    bio: data.bio,
    skills: data.skills || [],
    qualifications: data.qualifications || [],
    resumeUrl: data.resume_url,
    skillScore: data.skill_score
  };
}

export async function applyForJob(jobId: string, studentId: string, resumeUrl?: string): Promise<void> {
  // Check if already applied
  const { data: existingApplication, error: checkError } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('student_id', studentId)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking existing application:', checkError);
    throw checkError;
  }
  
  if (existingApplication) {
    throw new Error('You have already applied for this job');
  }
  
  // Create application
  const { error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      student_id: studentId,
      resume_url: resumeUrl,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error applying for job:', error);
    throw error;
  }
}
