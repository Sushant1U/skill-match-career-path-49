
export type UserRole = 'student' | 'employer' | string[];

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  profile?: any;
  metadata?: any;
  user_metadata?: any;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  qualifications: string[];
  employerId: string;
  status: 'active' | 'closed';
  createdAt: string;
  applications?: number;
  hasApplied?: boolean;
  applicationStatus?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  location: string;
  bio?: string;
  skills: string[];
  qualifications: string[];
  resumeUrl?: string;
  skillScore?: number;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted' | string;
  createdAt: string;
  resumeUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  linkUrl?: string;
}

export interface SkillAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
