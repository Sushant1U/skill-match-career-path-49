
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error getting user role:', error);
      return null;
    }
    
    return data.role as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

export async function handleSignUp(
  email: string, 
  password: string, 
  name: string, 
  role: UserRole
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role
      }
    }
  });

  if (error) throw error;
  
  if (data.user) {
    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email,
        name,
        role: role.toString(),
        created_at: new Date().toISOString(),
        skills: []
      });
      
    if (profileError) {
      console.error('Error creating profile:', profileError);
      // We won't throw here to avoid breaking the signup flow
    }
  }
  
  return data;
}

export async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function handleSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateUserProfile(userId: string, data: any) {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);
    
  if (error) throw error;
}
