// Core application types for MarieIDE Phase 1

export interface FileInfo {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  isOpen?: boolean;
  isModified?: boolean;
  content?: string;
}

export interface Workspace {
  id: string;
  name: string;
  path: string;
  files: FileInfo[];
  openFiles: string[];
  activeFile?: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  files: Record<string, string>; // file path -> content
  metadata: Record<string, any>;
}

export interface GitStatus {
  branch: string;
  isClean: boolean;
  modifiedFiles: string[];
  stagedFiles: string[];
  untrackedFiles: string[];
  ahead: number;
  behind: number;
}

export interface AIResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
  model: string;
  context?: {
    file?: string;
    selection?: string;
    project?: string;
  };
}

export interface PanelLayout {
  sidebar: {
    width: number;
    visible: boolean;
  };
  composer: {
    width: number;
    visible: boolean;
  };
  terminal: {
    height: number;
    visible: boolean;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  autoSave: boolean;
  autoSaveDelay: number;
  aiProvider: 'openai' | 'anthropic' | 'local';
  aiModel: string;
  gitAutoCommit: boolean;
  checkpointAutoCreate: boolean;
  layout: PanelLayout;
}

export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
  history: string[];
}

// IPC Command types
export interface IPCCommands {
  // File operations
  'file:read': { path: string };
  'file:write': { path: string; content: string };
  'file:delete': { path: string };
  'file:rename': { oldPath: string; newPath: string };
  'file:list': { path: string };
  
  // Workspace operations
  'workspace:open': { path: string };
  'workspace:close': {};
  'workspace:get-current': {};
  
  // Checkpoint operations
  'checkpoint:create': { name: string; description?: string };
  'checkpoint:list': {};
  'checkpoint:restore': { id: string };
  'checkpoint:delete': { id: string };
  
  // Git operations
  'git:status': {};
  'git:commit': { message: string; files?: string[] };
  'git:add': { files: string[] };
  'git:branch': { name?: string };
  'git:checkout': { branch: string };
  'git:init': {};
  
  // AI operations
  'ai:generate': { prompt: string; context?: any };
  'ai:models': {};
  'ai:set-model': { model: string };
  
  // Settings operations
  'settings:get': {};
  'settings:set': { settings: Partial<AppSettings> };
  
  // Terminal operations
  'terminal:create': { cwd?: string };
  'terminal:execute': { sessionId: string; command: string };
  'terminal:list': {};
}

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Event types
export interface AppEvents {
  'file:opened': { file: FileInfo };
  'file:closed': { fileId: string };
  'file:modified': { file: FileInfo };
  'workspace:changed': { workspace: Workspace };
  'checkpoint:created': { checkpoint: Checkpoint };
  'git:status-changed': { status: GitStatus };
  'ai:response': { response: AIResponse };
  'settings:changed': { settings: AppSettings };
}
