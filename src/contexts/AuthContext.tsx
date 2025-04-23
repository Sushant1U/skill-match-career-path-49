
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { AuthContextType } from '@/types/auth';
import { getUserRole, handleSignUp, handleSignIn, handleSignOut, updateUserProfile } from '@/utils/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      }
    );

    // Initialize session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        getUserRole(session.user.id)
          .then(role => setUserRole(role))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      await handleSignUp(email, password, name, role);
      if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/employer-dashboard');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await handleSignIn(email, password);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await handleSignOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (data: { name?: string }) => {
    try {
      if (!user) throw new Error('No user logged in');
      await updateUserProfile(user.id, data);
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        userRole, 
        loading, 
        signUp, 
        signIn, 
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
