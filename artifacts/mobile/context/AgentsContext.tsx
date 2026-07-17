import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type AgentType =
  | 'project_manager' | 'frontend' | 'backend' | 'fullstack'
  | 'ui_ux' | 'database' | 'devops' | 'security'
  | 'qa_testing' | 'documentation' | 'code_review' | 'bug_fixing';

export interface AiAgent {
  id: string;
  type: AgentType;
  name: string;
  status: 'idle' | 'working' | 'completed' | 'failed';
  config: Record<string, any>;
  lastActive: string;
  createdAt: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: Record<string, any>;
  prompt: string;
  createdAt: string;
  completedAt?: string;
}

const AGENT_META: Record<AgentType, { icon: string; color: string; description: string }> = {
  project_manager:  { icon: 'briefcase', color: '#6366F1', description: 'Plan sprints, manage milestones, assign tasks' },
  frontend:         { icon: 'smartphone', color: '#3B82F6', description: 'Build UI components, pages, and responsive layouts' },
  backend:          { icon: 'server', color: '#10B981', description: 'Design APIs, services, and database integrations' },
  fullstack:        { icon: 'layers', color: '#8B5CF6', description: 'End-to-end feature development across the stack' },
  ui_ux:            { icon: 'figma', color: '#EC4899', description: 'Design interfaces, wireframes, and user flows' },
  database:         { icon: 'database', color: '#F59E0B', description: 'Schema design, queries, migrations, and optimization' },
  devops:           { icon: 'terminal', color: '#EF4444', description: 'CI/CD pipelines, infrastructure, and deployment' },
  security:         { icon: 'shield', color: '#14B8A6', description: 'Vulnerability scanning, auth, and compliance' },
  qa_testing:       { icon: 'check-square', color: '#F97316', description: 'Test plans, automation, and quality assurance' },
  documentation:    { icon: 'book', color: '#6B7280', description: 'API docs, guides, and technical writing' },
  code_review:      { icon: 'git-pull-request', color: '#A855F7', description: 'Review code quality, patterns, and best practices' },
  bug_fixing:       { icon: 'bug', color: '#DC2626', description: 'Diagnose issues, fix bugs, and write regression tests' },
};

export function getAgentMeta(type: AgentType) {
  return AGENT_META[type] ?? { icon: 'cpu', color: '#6366F1', description: 'AI assistant' };
}

interface AgentsContextType {
  agents: AiAgent[];
  agentTasks: AgentTask[];
  assignTask: (agentId: string, prompt: string) => Promise<void>;
  updateAgentStatus: (id: string, status: AiAgent['status']) => Promise<void>;
  createDefaultAgents: () => Promise<void>;
}

const AgentsContext = createContext<AgentsContextType | null>(null);

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const DEFAULT_AGENT_TYPES: AgentType[] = [
  'project_manager', 'frontend', 'backend', 'fullstack',
  'ui_ux', 'database', 'devops', 'security',
  'qa_testing', 'documentation', 'code_review', 'bug_fixing',
];

export function AgentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);

  const loadAgents = useCallback(async () => {
    if (!user) { setAgents([]); return; }
    try {
      const { data } = await supabase.from('ai_agents').select('*').eq('user_id', user.id).order('created_at');
      if (data) {
        setAgents(data.map(a => ({
          id: a.id, type: a.type as AgentType, name: a.name,
          status: a.status, config: a.config, lastActive: a.last_active, createdAt: a.created_at,
        })));
      }
    } catch { /* ignore */ }
  }, [user]);

  const loadAgentTasks = useCallback(async () => {
    if (!user) { setAgentTasks([]); return; }
    try {
      const { data } = await supabase.from('agent_tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) {
        setAgentTasks(data.map(t => ({
          id: t.id, agentId: t.agent_id, title: t.title, description: t.description,
          status: t.status, result: t.result, prompt: t.prompt,
          createdAt: t.created_at, completedAt: t.completed_at,
        })));
      }
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (user) { loadAgents(); loadAgentTasks(); }
    else { setAgents([]); setAgentTasks([]); }
  }, [user]);

  async function createDefaultAgents() {
    if (!user) return;
    const existing = await supabase.from('ai_agents').select('type').eq('user_id', user.id);
    const existingTypes = new Set((existing.data ?? []).map(a => a.type));
    const toCreate = DEFAULT_AGENT_TYPES.filter(t => !existingTypes.has(t));
    for (const type of toCreate) {
      const meta = AGENT_META[type];
      await supabase.from('ai_agents').insert({
        id: uid(), user_id: user.id, type, name: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        status: 'idle', config: {},
      });
    }
    await loadAgents();
  }

  async function assignTask(agentId: string, prompt: string) {
    if (!user) return;
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    const taskId = uid();
    await supabase.from('agent_tasks').insert({
      id: taskId, agent_id: agentId, user_id: user.id,
      title: prompt.slice(0, 80), description: prompt,
      status: 'pending', prompt, result: {},
    });
    await supabase.from('ai_agents').update({ status: 'working', last_active: new Date().toISOString() }).eq('id', agentId);
    await loadAgentTasks();
    await loadAgents();
    setTimeout(async () => {
      await supabase.from('agent_tasks').update({ status: 'completed', result: { summary: 'Task completed successfully' }, completed_at: new Date().toISOString() }).eq('id', taskId);
      await supabase.from('ai_agents').update({ status: 'idle', last_active: new Date().toISOString() }).eq('id', agentId);
      await loadAgentTasks();
      await loadAgents();
    }, 2000);
  }

  async function updateAgentStatus(id: string, status: AiAgent['status']) {
    if (!user) return;
    await supabase.from('ai_agents').update({ status, last_active: new Date().toISOString() }).eq('id', id);
    await loadAgents();
  }

  return (
    <AgentsContext.Provider value={{ agents, agentTasks, assignTask, updateAgentStatus, createDefaultAgents }}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentsContext);
  if (!ctx) throw new Error('useAgents must be inside AgentsProvider');
  return ctx;
}
