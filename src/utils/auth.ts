
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { toast } from '@/components/ui/sonner';

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    console.log("Fetching user role for:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user role:', error);
      throw error;
    }
    
    console.log("User role data:", data);
    return data?.role as UserRole || null;
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
  console.log("Signing up user:", { email, name, role });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) {
    console.error('Sign up error:', error);
    throw error;
  }

  console.log("Sign up response:", data);
  toast.success('Sign up successful! Please verify your email.');
  return data;
}

export async function handleSignIn(email: string, password: string) {
  console.log("Signing in user:", email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    throw error;
  }

  console.log("Sign in response:", data);
  toast.success('Successfully signed in!');
  return data;
}

export async function handleSignOut() {
  console.log("Signing out user");
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
  
  toast.success('Successfully signed out!');
}

export async function updateUserProfile(userId: string, data: { name?: string }) {
  if (!userId) throw new Error('No user logged in');
  console.log("Updating user profile:", { userId, data });

  const { error: updateError } = await supabase.auth.updateUser({
    data: { name: data.name },
  });

  if (updateError) {
    console.error('Update user error:', updateError);
    throw updateError;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name: data.name })
    .eq('id', userId);

  if (profileError) {
    console.error('Update profile error:', profileError);
    throw profileError;
  }

  toast.success('Profile updated successfully');
}
