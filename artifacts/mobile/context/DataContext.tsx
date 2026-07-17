import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type Priority      = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused';
export type TaskStatus    = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string; projectId: string; title: string;
  status: TaskStatus; priority: Priority;
  dueDate?: string; createdAt: string;
}

export interface Project {
  id: string; name: string; description: string;
  status: ProjectStatus; color: string; icon: string;
  progress: number; tasks: Task[];
  createdAt: string; updatedAt: string;
}

export interface Note {
  id: string; title: string; content: string;
  color: string; tags: string[]; pinned: boolean;
  createdAt: string; updatedAt: string;
}

export interface AIMessage {
  id: string; role: 'user' | 'assistant';
  content: string; timestamp: string;
}

export interface FolderDoc {
  id: string; folderId: string; title: string;
  content: string; createdAt: string; updatedAt: string;
}

export interface AppFolder {
  id: string; name: string; color: string; icon: string;
  docs: FolderDoc[]; createdAt: string; updatedAt: string;
}

export interface SavedImage {
  id: string; uri: string; name: string;
  note: string; createdAt: string;
}

export interface Bookmark {
  id: string; url: string; title: string;
  description: string; tags: string[];
  pinned: boolean; createdAt: string;
}

interface DataContextType {
  projects: Project[];
  addProject:    (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => Promise<void>;
  updateProject: (id: string, u: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask:    (projectId: string, t: Omit<Task, 'id' | 'createdAt' | 'projectId'>) => Promise<void>;
  updateTask: (projectId: string, taskId: string, u: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  notes: Note[];
  addNote:    (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, u: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  aiMessages: AIMessage[];
  addAIMessage:   (m: Omit<AIMessage, 'id' | 'timestamp'>) => Promise<void>;
  clearAIMessages:() => Promise<void>;
  folders: AppFolder[];
  addFolder:    (f: Omit<AppFolder, 'id' | 'createdAt' | 'updatedAt' | 'docs'>) => Promise<void>;
  updateFolder: (id: string, u: Partial<AppFolder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addDoc:    (folderId: string, d: Omit<FolderDoc, 'id' | 'createdAt' | 'updatedAt' | 'folderId'>) => Promise<void>;
  updateDoc: (folderId: string, docId: string, u: Partial<FolderDoc>) => Promise<void>;
  deleteDoc: (folderId: string, docId: string) => Promise<void>;
  savedImages: SavedImage[];
  addImage:    (img: Omit<SavedImage, 'id' | 'createdAt'>) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  bookmarks: Bookmark[];
  addBookmark:    (b: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>;
  updateBookmark: (id: string, u: Partial<Bookmark>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function calcProgress(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [notes,       setNotes]       = useState<Note[]>([]);
  const [aiMessages,  setAIMessages]  = useState<AIMessage[]>([]);
  const [folders,     setFolders]     = useState<AppFolder[]>([]);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [bookmarks,   setBookmarks]   = useState<Bookmark[]>([]);

  const loadProjects = useCallback(async () => {
    if (!user) { setProjects([]); return; }
    const { data: pData } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    const { data: tData } = await supabase.from('tasks').select('*').eq('user_id', user.id);
    if (!pData) return;
    const tasksMap: Record<string, Task[]> = {};
    for (const t of tData || []) {
      if (!tasksMap[t.project_id]) tasksMap[t.project_id] = [];
      tasksMap[t.project_id].push({ id: t.id, projectId: t.project_id, title: t.title, status: t.status, priority: t.priority, dueDate: t.due_date, createdAt: t.created_at });
    }
    setProjects(pData.map(p => ({
      id: p.id, name: p.name, description: p.description || '',
      status: p.status, color: p.color, icon: p.icon,
      progress: p.progress || 0, tasks: tasksMap[p.id] || [],
      createdAt: p.created_at, updatedAt: p.updated_at,
    })));
  }, [user]);

  const loadNotes = useCallback(async () => {
    if (!user) { setNotes([]); return; }
    const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setNotes(data.map(n => ({ id: n.id, title: n.title, content: n.content || '', color: n.color, tags: n.tags || [], pinned: n.pinned, createdAt: n.created_at, updatedAt: n.updated_at })));
  }, [user]);

  const loadAIMessages = useCallback(async () => {
    if (!user) { setAIMessages([]); return; }
    const { data } = await supabase.from('ai_messages').select('*').eq('user_id', user.id).order('timestamp', { ascending: true });
    if (data) setAIMessages(data.map(m => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp })));
  }, [user]);

  const loadFolders = useCallback(async () => {
    if (!user) { setFolders([]); return; }
    const { data: fData } = await supabase.from('folders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!fData) return;
    const { data: dData } = await supabase.from('folder_docs').select('*').eq('user_id', user.id);
    const docsMap: Record<string, FolderDoc[]> = {};
    for (const d of dData || []) {
      if (!docsMap[d.folder_id]) docsMap[d.folder_id] = [];
      docsMap[d.folder_id].push({ id: d.id, folderId: d.folder_id, title: d.title, content: d.content || '', createdAt: d.created_at, updatedAt: d.updated_at });
    }
    setFolders(fData.map(f => ({ id: f.id, name: f.name, color: f.color, icon: f.icon, docs: docsMap[f.id] || [], createdAt: f.created_at, updatedAt: f.updated_at })));
  }, [user]);

  const loadImages = useCallback(async () => {
    if (!user) { setSavedImages([]); return; }
    const { data } = await supabase.from('saved_images').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setSavedImages(data.map(i => ({ id: i.id, uri: i.uri, name: i.caption, note: i.caption, createdAt: i.created_at })));
  }, [user]);

  const loadBookmarks = useCallback(async () => {
    if (!user) { setBookmarks([]); return; }
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setBookmarks(data.map(b => ({ id: b.id, url: b.url, title: b.title, description: b.description || '', tags: [], pinned: false, createdAt: b.created_at })));
  }, [user]);

  useEffect(() => {
    if (user) { loadProjects(); loadNotes(); loadAIMessages(); loadFolders(); loadImages(); loadBookmarks(); }
    else { setProjects([]); setNotes([]); setAIMessages([]); setFolders([]); setSavedImages([]); setBookmarks([]); }
  }, [user]);

  async function addProject(p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) {
    if (!user) return;
    const id = uid();
    await supabase.from('projects').insert({ id, user_id: user.id, name: p.name, description: p.description, status: p.status, color: p.color, icon: p.icon, progress: 0 });
    await loadProjects();
  }
  async function updateProject(id: string, u: Partial<Project>) {
    if (!user) return;
    await supabase.from('projects').update({ name: u.name, description: u.description, status: u.status, color: u.color, icon: u.icon, progress: u.progress, updated_at: new Date().toISOString() }).eq('id', id);
    await loadProjects();
  }
  async function deleteProject(id: string) {
    if (!user) return;
    await supabase.from('tasks').delete().eq('project_id', id);
    await supabase.from('projects').delete().eq('id', id);
    await loadProjects();
  }

  async function addTask(projectId: string, t: Omit<Task, 'id' | 'createdAt' | 'projectId'>) {
    if (!user) return;
    await supabase.from('tasks').insert({ id: uid(), project_id: projectId, user_id: user.id, title: t.title, status: t.status, priority: t.priority, due_date: t.dueDate || null });
    await loadProjects();
  }
  async function updateTask(projectId: string, taskId: string, u: Partial<Task>) {
    if (!user) return;
    await supabase.from('tasks').update({ title: u.title, status: u.status, priority: u.priority, due_date: u.dueDate || null }).eq('id', taskId);
    await loadProjects();
  }
  async function deleteTask(projectId: string, taskId: string) {
    if (!user) return;
    await supabase.from('tasks').delete().eq('id', taskId);
    await loadProjects();
  }

  async function addNote(n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!user) return;
    const id = uid();
    await supabase.from('notes').insert({ id, user_id: user.id, title: n.title, content: n.content, color: n.color, tags: n.tags || [], pinned: n.pinned });
    await loadNotes();
  }
  async function updateNote(id: string, u: Partial<Note>) {
    if (!user) return;
    await supabase.from('notes').update({ title: u.title, content: u.content, color: u.color, tags: u.tags, pinned: u.pinned, updated_at: new Date().toISOString() }).eq('id', id);
    await loadNotes();
  }
  async function deleteNote(id: string) {
    if (!user) return;
    await supabase.from('notes').delete().eq('id', id);
    await loadNotes();
  }

  async function addAIMessage(m: Omit<AIMessage, 'id' | 'timestamp'>) {
    if (!user) return;
    await supabase.from('ai_messages').insert({ id: uid(), user_id: user.id, role: m.role, content: m.content });
    await loadAIMessages();
  }
  async function clearAIMessages() {
    if (!user) return;
    await supabase.from('ai_messages').delete().eq('user_id', user.id);
    await loadAIMessages();
  }

  async function addFolder(f: Omit<AppFolder, 'id' | 'createdAt' | 'updatedAt' | 'docs'>) {
    if (!user) return;
    const id = uid();
    await supabase.from('folders').insert({ id, user_id: user.id, name: f.name, color: f.color, icon: f.icon });
    await loadFolders();
  }
  async function updateFolder(id: string, u: Partial<AppFolder>) {
    if (!user) return;
    await supabase.from('folders').update({ name: u.name, color: u.color, icon: u.icon, updated_at: new Date().toISOString() }).eq('id', id);
    await loadFolders();
  }
  async function deleteFolder(id: string) {
    if (!user) return;
    await supabase.from('folder_docs').delete().eq('folder_id', id);
    await supabase.from('folders').delete().eq('id', id);
    await loadFolders();
  }
  async function addDoc(folderId: string, d: Omit<FolderDoc, 'id' | 'createdAt' | 'updatedAt' | 'folderId'>) {
    if (!user) return;
    await supabase.from('folder_docs').insert({ id: uid(), folder_id: folderId, user_id: user.id, title: d.title, content: d.content });
    await loadFolders();
  }
  async function updateDoc(folderId: string, docId: string, u: Partial<FolderDoc>) {
    if (!user) return;
    await supabase.from('folder_docs').update({ title: u.title, content: u.content, updated_at: new Date().toISOString() }).eq('id', docId);
    await loadFolders();
  }
  async function deleteDoc(folderId: string, docId: string) {
    if (!user) return;
    await supabase.from('folder_docs').delete().eq('id', docId);
    await loadFolders();
  }

  async function addImage(img: Omit<SavedImage, 'id' | 'createdAt'>) {
    if (!user) return;
    await supabase.from('saved_images').insert({ id: uid(), user_id: user.id, uri: img.uri, caption: img.note || img.name });
    await loadImages();
  }
  async function deleteImage(id: string) {
    if (!user) return;
    await supabase.from('saved_images').delete().eq('id', id);
    await loadImages();
  }

  async function addBookmark(b: Omit<Bookmark, 'id' | 'createdAt'>) {
    if (!user) return;
    const id = uid();
    await supabase.from('bookmarks').insert({ id, user_id: user.id, title: b.title, url: b.url, description: b.description || '' });
    await loadBookmarks();
  }
  async function updateBookmark(id: string, u: Partial<Bookmark>) {
    if (!user) return;
    await supabase.from('bookmarks').update({ title: u.title, url: u.url, description: u.description }).eq('id', id);
    await loadBookmarks();
  }
  async function deleteBookmark(id: string) {
    if (!user) return;
    await supabase.from('bookmarks').delete().eq('id', id);
    await loadBookmarks();
  }

  return (
    <DataContext.Provider value={{
      projects, addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      notes, addNote, updateNote, deleteNote,
      aiMessages, addAIMessage, clearAIMessages,
      folders, addFolder, updateFolder, deleteFolder,
      addDoc, updateDoc, deleteDoc,
      savedImages, addImage, deleteImage,
      bookmarks, addBookmark, updateBookmark, deleteBookmark,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
