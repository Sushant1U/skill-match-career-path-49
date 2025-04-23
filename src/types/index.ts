
export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Skill {
  id: string;
  name: string;
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
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: 'pending' | 'shortlisted' | 'rejected';
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  skills: string[];
  qualifications: string[];
  location: string;
  resumeUrl?: string;
}

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  logoUrl?: string;
  location: string;
  industry: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
