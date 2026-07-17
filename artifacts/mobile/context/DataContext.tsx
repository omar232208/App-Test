/**
 * DataContext — all app data: Projects, Tasks, Notes, AI Messages,
 * Folders (with docs), Saved Images, Bookmarks.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ─── Core types ──────────────────────────────────────────────── */

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

/* ─── New library types ───────────────────────────────────────── */

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

/* ─── Context type ────────────────────────────────────────────── */

interface DataContextType {
  /* Projects */
  projects: Project[];
  addProject:    (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
  updateProject: (id: string, u: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  /* Tasks */
  addTask:    (projectId: string, t: Omit<Task, 'id' | 'createdAt' | 'projectId'>) => void;
  updateTask: (projectId: string, taskId: string, u: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  /* Notes */
  notes: Note[];
  addNote:    (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, u: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  /* AI */
  aiMessages:     AIMessage[];
  addAIMessage:   (m: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  clearAIMessages:() => void;
  /* Folders */
  folders: AppFolder[];
  addFolder:    (f: Omit<AppFolder, 'id' | 'createdAt' | 'updatedAt' | 'docs'>) => void;
  updateFolder: (id: string, u: Partial<AppFolder>) => void;
  deleteFolder: (id: string) => void;
  addDoc:    (folderId: string, d: Omit<FolderDoc, 'id' | 'createdAt' | 'updatedAt' | 'folderId'>) => void;
  updateDoc: (folderId: string, docId: string, u: Partial<FolderDoc>) => void;
  deleteDoc: (folderId: string, docId: string) => void;
  /* Images */
  savedImages: SavedImage[];
  addImage:    (img: Omit<SavedImage, 'id' | 'createdAt'>) => void;
  deleteImage: (id: string) => void;
  /* Bookmarks */
  bookmarks: Bookmark[];
  addBookmark:    (b: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  updateBookmark: (id: string, u: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
}

/* ─── Storage keys ────────────────────────────────────────────── */
const KEYS = {
  projects: '@devos_projects',
  notes:    '@devos_notes',
  ai:       '@devos_ai',
  folders:  '@devos_folders',
  images:   '@devos_images',
  bookmarks:'@devos_bookmarks',
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [notes,       setNotes]       = useState<Note[]>([]);
  const [aiMessages,  setAIMessages]  = useState<AIMessage[]>([]);
  const [folders,     setFolders]     = useState<AppFolder[]>([]);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [bookmarks,   setBookmarks]   = useState<Bookmark[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, n, a, f, im, bk] = await Promise.all(
          Object.values(KEYS).map(k => AsyncStorage.getItem(k))
        );
        if (p)  setProjects(JSON.parse(p));
        if (n)  setNotes(JSON.parse(n));
        if (a)  setAIMessages(JSON.parse(a));
        if (f)  setFolders(JSON.parse(f));
        if (im) setSavedImages(JSON.parse(im));
        if (bk) setBookmarks(JSON.parse(bk));
      } catch (_) {}
    })();
  }, []);

  /* ── helpers ── */
  const save = (key: string) => async (data: any[]) =>
    AsyncStorage.setItem(key, JSON.stringify(data));

  const sp = save(KEYS.projects);
  const sn = save(KEYS.notes);
  const sa = save(KEYS.ai);
  const sf = save(KEYS.folders);
  const si = save(KEYS.images);
  const sb = save(KEYS.bookmarks);

  /* ── Projects ── */
  function addProject(p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) {
    const now = new Date().toISOString();
    const next = [{ ...p, id: uid(), tasks: [], createdAt: now, updatedAt: now }, ...projects];
    setProjects(next); sp(next);
  }
  function updateProject(id: string, u: Partial<Project>) {
    const next = projects.map(p => p.id === id ? { ...p, ...u, updatedAt: new Date().toISOString() } : p);
    setProjects(next); sp(next);
  }
  function deleteProject(id: string) {
    const next = projects.filter(p => p.id !== id);
    setProjects(next); sp(next);
  }

  /* ── Tasks ── */
  function addTask(projectId: string, t: Omit<Task, 'id' | 'createdAt' | 'projectId'>) {
    const task: Task = { ...t, id: uid(), projectId, createdAt: new Date().toISOString() };
    const next = projects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = [task, ...p.tasks];
      return { ...p, tasks, progress: calcProgress(tasks), updatedAt: new Date().toISOString() };
    });
    setProjects(next); sp(next);
  }
  function updateTask(projectId: string, taskId: string, u: Partial<Task>) {
    const next = projects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = p.tasks.map(t => t.id === taskId ? { ...t, ...u } : t);
      return { ...p, tasks, progress: calcProgress(tasks), updatedAt: new Date().toISOString() };
    });
    setProjects(next); sp(next);
  }
  function deleteTask(projectId: string, taskId: string) {
    const next = projects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = p.tasks.filter(t => t.id !== taskId);
      return { ...p, tasks, progress: calcProgress(tasks), updatedAt: new Date().toISOString() };
    });
    setProjects(next); sp(next);
  }
  function calcProgress(tasks: Task[]) {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);
  }

  /* ── Notes ── */
  function addNote(n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const next = [{ ...n, id: uid(), createdAt: now, updatedAt: now }, ...notes];
    setNotes(next); sn(next);
  }
  function updateNote(id: string, u: Partial<Note>) {
    const next = notes.map(n => n.id === id ? { ...n, ...u, updatedAt: new Date().toISOString() } : n);
    setNotes(next); sn(next);
  }
  function deleteNote(id: string) {
    const next = notes.filter(n => n.id !== id);
    setNotes(next); sn(next);
  }

  /* ── AI ── */
  function addAIMessage(m: Omit<AIMessage, 'id' | 'timestamp'>) {
    const msg: AIMessage = { ...m, id: uid(), timestamp: new Date().toISOString() };
    const next = [...aiMessages, msg];
    setAIMessages(next); sa(next);
  }
  function clearAIMessages() { setAIMessages([]); sa([]); }

  /* ── Folders ── */
  function addFolder(f: Omit<AppFolder, 'id' | 'createdAt' | 'updatedAt' | 'docs'>) {
    const now = new Date().toISOString();
    const next = [{ ...f, id: uid(), docs: [], createdAt: now, updatedAt: now }, ...folders];
    setFolders(next); sf(next);
  }
  function updateFolder(id: string, u: Partial<AppFolder>) {
    const next = folders.map(f => f.id === id ? { ...f, ...u, updatedAt: new Date().toISOString() } : f);
    setFolders(next); sf(next);
  }
  function deleteFolder(id: string) {
    const next = folders.filter(f => f.id !== id);
    setFolders(next); sf(next);
  }
  function addDoc(folderId: string, d: Omit<FolderDoc, 'id' | 'createdAt' | 'updatedAt' | 'folderId'>) {
    const now = new Date().toISOString();
    const doc: FolderDoc = { ...d, id: uid(), folderId, createdAt: now, updatedAt: now };
    const next = folders.map(f => {
      if (f.id !== folderId) return f;
      return { ...f, docs: [doc, ...f.docs], updatedAt: now };
    });
    setFolders(next); sf(next);
  }
  function updateDoc(folderId: string, docId: string, u: Partial<FolderDoc>) {
    const now = new Date().toISOString();
    const next = folders.map(f => {
      if (f.id !== folderId) return f;
      const docs = f.docs.map(d => d.id === docId ? { ...d, ...u, updatedAt: now } : d);
      return { ...f, docs, updatedAt: now };
    });
    setFolders(next); sf(next);
  }
  function deleteDoc(folderId: string, docId: string) {
    const next = folders.map(f => {
      if (f.id !== folderId) return f;
      return { ...f, docs: f.docs.filter(d => d.id !== docId) };
    });
    setFolders(next); sf(next);
  }

  /* ── Images ── */
  function addImage(img: Omit<SavedImage, 'id' | 'createdAt'>) {
    const next = [{ ...img, id: uid(), createdAt: new Date().toISOString() }, ...savedImages];
    setSavedImages(next); si(next);
  }
  function deleteImage(id: string) {
    const next = savedImages.filter(i => i.id !== id);
    setSavedImages(next); si(next);
  }

  /* ── Bookmarks ── */
  function addBookmark(b: Omit<Bookmark, 'id' | 'createdAt'>) {
    const next = [{ ...b, id: uid(), createdAt: new Date().toISOString() }, ...bookmarks];
    setBookmarks(next); sb(next);
  }
  function updateBookmark(id: string, u: Partial<Bookmark>) {
    const next = bookmarks.map(b => b.id === id ? { ...b, ...u } : b);
    setBookmarks(next); sb(next);
  }
  function deleteBookmark(id: string) {
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next); sb(next);
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
