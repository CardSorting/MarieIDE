import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FileInfo, Workspace, Checkpoint, GitStatus, AIResponse, PanelLayout, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface AppState {
  // Workspace state
  workspace: Workspace | null;
  activeFile: FileInfo | null;
  openFiles: FileInfo[];
  
  // UI state
  layout: PanelLayout;
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  
  // Version control state
  checkpoints: Checkpoint[];
  gitStatus: GitStatus | null;
  
  // AI state
  aiResponses: AIResponse[];
  isAIProcessing: boolean;
  
  // Terminal state
  terminalSessions: any[];
  activeTerminalSession: string | null;
  
  // Actions
  setWorkspace: (workspace: Workspace | null) => void;
  setActiveFile: (file: FileInfo | null) => void;
  addOpenFile: (file: FileInfo) => void;
  removeOpenFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileInfo>) => void;
  
  setLayout: (layout: Partial<PanelLayout>) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  addCheckpoint: (checkpoint: Checkpoint) => void;
  removeCheckpoint: (checkpointId: string) => void;
  setGitStatus: (status: GitStatus | null) => void;
  
  addAIResponse: (response: AIResponse) => void;
  setAIProcessing: (processing: boolean) => void;
  
  addTerminalSession: (session: any) => void;
  removeTerminalSession: (sessionId: string) => void;
  setActiveTerminalSession: (sessionId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      workspace: null,
      activeFile: null,
      openFiles: [],
      
      layout: DEFAULT_SETTINGS.layout,
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      error: null,
      
      checkpoints: [],
      gitStatus: null,
      
      aiResponses: [],
      isAIProcessing: false,
      
      terminalSessions: [],
      activeTerminalSession: null,
      
      // Actions
      setWorkspace: (workspace) => set({ workspace }),
      
      setActiveFile: (file) => set({ activeFile: file }),
      
      addOpenFile: (file) => set((state) => ({
        openFiles: [...state.openFiles.filter(f => f.id !== file.id), file]
      })),
      
      removeOpenFile: (fileId) => set((state) => ({
        openFiles: state.openFiles.filter(f => f.id !== fileId),
        activeFile: state.activeFile?.id === fileId ? null : state.activeFile
      })),
      
      updateFile: (fileId, updates) => set((state) => ({
        openFiles: state.openFiles.map(f => 
          f.id === fileId ? { ...f, ...updates } : f
        ),
        activeFile: state.activeFile?.id === fileId 
          ? { ...state.activeFile, ...updates }
          : state.activeFile
      })),
      
      setLayout: (layout) => set((state) => ({
        layout: { ...state.layout, ...layout }
      })),
      
      setSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      addCheckpoint: (checkpoint) => set((state) => ({
        checkpoints: [checkpoint, ...state.checkpoints]
      })),
      
      removeCheckpoint: (checkpointId) => set((state) => ({
        checkpoints: state.checkpoints.filter(c => c.id !== checkpointId)
      })),
      
      setGitStatus: (gitStatus) => set({ gitStatus }),
      
      addAIResponse: (response) => set((state) => ({
        aiResponses: [response, ...state.aiResponses]
      })),
      
      setAIProcessing: (isAIProcessing) => set({ isAIProcessing }),
      
      addTerminalSession: (session) => set((state) => ({
        terminalSessions: [...state.terminalSessions, session]
      })),
      
      removeTerminalSession: (sessionId) => set((state) => ({
        terminalSessions: state.terminalSessions.filter(s => s.id !== sessionId),
        activeTerminalSession: state.activeTerminalSession === sessionId 
          ? null 
          : state.activeTerminalSession
      })),
      
      setActiveTerminalSession: (activeTerminalSession) => set({ activeTerminalSession }),
    }),
    {
      name: 'marieide-store',
    }
  )
);
