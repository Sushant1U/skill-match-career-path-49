
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { toast } from '@/components/ui/sonner';

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data.role as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
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
        role,
      },
    },
  });

  if (error) throw error;

  toast.success('Sign up successful! Please verify your email.');
  return data;
}

export async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  toast.success('Successfully signed in!');
  return data;
}

export async function handleSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  toast.success('Successfully signed out!');
}

export async function updateUserProfile(userId: string, data: { name?: string }) {
  if (!userId) throw new Error('No user logged in');

  const { error: updateError } = await supabase.auth.updateUser({
    data: { name: data.name },
  });

  if (updateError) throw updateError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name: data.name })
    .eq('id', userId);

  if (profileError) throw profileError;

  toast.success('Profile updated successfully');
}
