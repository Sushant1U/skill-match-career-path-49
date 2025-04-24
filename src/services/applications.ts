import { supabase } from '@/integrations/supabase/client';
import { Application, Notification, Student } from '@/types';

export async function fetchApplicationsForEmployer(jobId?: string, limit?: number): Promise<Application[]> {
  let query = supabase
    .from('applications')
    .select(`
      *,
      jobs(title, company),
      student:profiles!applications_student_id_fkey(id, name, email, location, bio, skills, qualifications, resume_url, skill_score)
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
  
  console.log('Raw application data from DB:', data);
  
  return (data || []).map(app => ({
    id: app.id,
    jobId: app.job_id,
    studentId: app.student_id,
    status: app.status,
    createdAt: app.created_at,
    resumeUrl: app.resume_url || (app.student?.resume_url || null),
    jobTitle: app.jobs?.title,
    jobCompany: app.jobs?.company,
    student: app.student ? {
      id: app.student.id,
      name: app.student.name || 'Anonymous',
      email: app.student.email || '',
      location: app.student.location || 'Unknown location',
      bio: app.student.bio || '',
      skills: app.student.skills || [],
      qualifications: app.student.qualifications || [],
      resumeUrl: app.student.resume_url || null,
      skillScore: app.student.skill_score
    } : null
  }));
}

export async function fetchNotificationsForUser(userId: string, limit?: number): Promise<Notification[]> {
  if (!userId) {
    console.error('No user ID provided to fetch notifications');
    return [];
  }

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
  
  console.log(`Fetched ${data?.length || 0} notifications for user ${userId}`);
  
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

export async function deleteNotification(id: string): Promise<boolean> {
  if (!id) {
    console.error('No notification ID provided for deletion');
    return false;
  }
  
  console.log('Attempting to delete notification with ID:', id);
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
  
  console.log('Successfully deleted notification with ID:', id);
  return true;
}

export async function deleteAllUserNotifications(userId: string): Promise<boolean> {
  if (!userId) {
    console.error('No user ID provided for bulk notification deletion');
    return false;
  }
  
  console.log('Attempting to delete all notifications for user:', userId);
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error deleting all user notifications:', error);
    return false;
  }
  
  console.log('Successfully deleted all notifications for user:', userId);
  return true;
}
