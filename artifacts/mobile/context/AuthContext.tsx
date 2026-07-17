import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(mapUser(session.user));
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(mapUser(session.user));
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function mapUser(supabaseUser: User): AppUser {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
      role: supabaseUser.user_metadata?.role || 'Developer',
      joinedAt: supabaseUser.created_at || new Date().toISOString(),
    };
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function register(name: string, email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw error;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function updateUser(updates: Partial<AppUser>) {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (error) throw error;
  }

  async function openOAuth(provider: 'google' | 'github') {
    const redirectTo = Linking.createURL('/');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') {
      const hash = result.url.split('#')[1];
      if (!hash) {
        const hasCode = result.url.includes('code=');
        if (hasCode) {
          const params = new URLSearchParams(result.url.split('?')[1] || '');
          const code = params.get('code');
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
            return;
          }
        }
        throw new Error('OAuth failed - no tokens received');
      }
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
      } else {
        throw new Error('OAuth failed - no access token');
      }
    } else {
      throw new Error('OAuth cancelled');
    }
  }

  async function signInWithGoogle() {
    await openOAuth('google');
  }

  async function signInWithGithub() {
    await openOAuth('github');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, signInWithGoogle, signInWithGithub }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
