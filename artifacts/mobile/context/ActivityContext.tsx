import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface ActivityContextType {
  activities: ActivityEntry[];
  notifications: AppNotification[];
  unreadCount: number;
  logActivity:  (type: string, description: string, entityType?: string, entityId?: string, metadata?: Record<string, any>) => Promise<void>;
  markRead:     (id: string) => Promise<void>;
  markAllRead:  () => Promise<void>;
  addNotification: (title: string, body: string, type: string, priority?: AppNotification['priority'], actionUrl?: string) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = useCallback(async () => {
    if (!user) { setActivities([]); setNotifications([]); return; }
    try {
      const [aRes, nRes] = await Promise.all([
        supabase.from('activity_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      ]);
      if (aRes.data) setActivities(aRes.data.map(a => ({ id: a.id, type: a.type, description: a.description, entityType: a.entity_type, entityId: a.entity_id, metadata: a.metadata, createdAt: a.created_at })));
      if (nRes.data) setNotifications(nRes.data.map(n => ({ id: n.id, title: n.title, body: n.body, type: n.type, priority: n.priority, read: n.read, actionUrl: n.action_url, metadata: n.metadata, createdAt: n.created_at })));
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { if (user) load(); else { setActivities([]); setNotifications([]); } }, [user]);

  async function logActivity(type: string, description: string, entityType?: string, entityId?: string, metadata?: Record<string, any>) {
    if (!user) return;
    await supabase.from('activity_log').insert({ id: uid(), user_id: user.id, type, description, entity_type: entityType, entity_id: entityId, metadata: metadata ?? {} });
    await load();
  }

  async function markRead(id: string) {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    await load();
  }

  async function markAllRead() {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    await load();
  }

  async function addNotification(title: string, body: string, type: string, priority: AppNotification['priority'] = 'medium', actionUrl?: string) {
    if (!user) return;
    await supabase.from('notifications').insert({ id: uid(), user_id: user.id, title, body, type, priority, action_url: actionUrl, metadata: {} });
    await load();
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ActivityContext.Provider value={{ activities, notifications, unreadCount, logActivity, markRead, markAllRead, addNotification }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be inside ActivityProvider');
  return ctx;
}
