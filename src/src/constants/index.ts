// Application constants for MarieIDE Phase 1

export const APP_NAME = 'MarieIDE';
export const APP_VERSION = '1.0.0-alpha';

// Performance targets
export const PERFORMANCE_TARGETS = {
  STARTUP_TIME: 2000, // 2 seconds
  MEMORY_USAGE: 300 * 1024 * 1024, // 300MB
  FILE_OPEN_TIME: 200, // 200ms
  FILE_SAVE_TIME: 100, // 100ms
  CHECKPOINT_CREATE_TIME: 2000, // 2 seconds
  AI_RESPONSE_TIME: 10000, // 10 seconds
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  theme: 'dark' as const,
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  autoSave: true,
  autoSaveDelay: 1000, // 1 second
  aiProvider: 'openai' as const,
  aiModel: 'gpt-4',
  gitAutoCommit: false,
  checkpointAutoCreate: true,
  layout: {
    sidebar: {
      width: 250,
      visible: true,
    },
    composer: {
      width: 350,
      visible: true,
    },
    terminal: {
      height: 200,
      visible: true,
    },
  },
} as const;

// File type mappings
export const FILE_EXTENSIONS = {
  // Programming languages
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.go': 'go',
  '.rs': 'rust',
  '.php': 'php',
  '.rb': 'ruby',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.r': 'r',
  '.m': 'matlab',
  '.pl': 'perl',
  '.lua': 'lua',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.fish': 'shell',
  '.ps1': 'powershell',
  '.bat': 'batch',
  '.cmd': 'batch',
  
  // Web technologies
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.less': 'less',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.astro': 'astro',
  
  // Data formats
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.ini': 'ini',
  '.cfg': 'ini',
  '.conf': 'ini',
  '.env': 'env',
  
  // Documentation
  '.md': 'markdown',
  '.txt': 'text',
  '.rtf': 'rtf',
  
  // Configuration
  '.gitignore': 'gitignore',
  '.dockerignore': 'dockerignore',
  'Dockerfile': 'dockerfile',
  'docker-compose.yml': 'yaml',
  'package.json': 'json',
  'tsconfig.json': 'json',
  'webpack.config.js': 'javascript',
  'vite.config.ts': 'typescript',
} as const;

// AI model configurations
export const AI_MODELS = {
  openai: [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  ],
  anthropic: [
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and lightweight' },
  ],
  local: [
    { id: 'codellama', name: 'Code Llama', description: 'Local code model' },
    { id: 'starcoder', name: 'StarCoder', description: 'Code generation model' },
  ],
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  // File operations
  'Ctrl+N': 'file:new',
  'Ctrl+O': 'file:open',
  'Ctrl+S': 'file:save',
  'Ctrl+Shift+S': 'file:save-as',
  'Ctrl+W': 'file:close',
  'Ctrl+Shift+W': 'file:close-all',
  
  // Editor operations
  'Ctrl+Z': 'edit:undo',
  'Ctrl+Y': 'edit:redo',
  'Ctrl+X': 'edit:cut',
  'Ctrl+C': 'edit:copy',
  'Ctrl+V': 'edit:paste',
  'Ctrl+A': 'edit:select-all',
  'Ctrl+F': 'edit:find',
  'Ctrl+H': 'edit:replace',
  
  // Workspace operations
  'Ctrl+Shift+O': 'workspace:open',
  'Ctrl+Shift+N': 'workspace:new',
  
  // Checkpoint operations
  'Ctrl+Shift+C': 'checkpoint:create',
  'Ctrl+Shift+R': 'checkpoint:restore',
  'Ctrl+Shift+H': 'checkpoint:history',
  
  // Git operations
  'Ctrl+Shift+G': 'git:status',
  'Ctrl+Shift+A': 'git:add',
  'Ctrl+Shift+M': 'git:commit',
  'Ctrl+Shift+P': 'git:push',
  
  // AI operations
  'Ctrl+Shift+I': 'ai:composer',
  'Ctrl+Enter': 'ai:send-prompt',
  
  // Panel toggles
  'Ctrl+B': 'panel:sidebar',
  'Ctrl+Shift+B': 'panel:composer',
  'Ctrl+`': 'panel:terminal',
  
  // Theme
  'Ctrl+Shift+T': 'theme:toggle',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FILE_NOT_FOUND: 'File not found',
  FILE_READ_ERROR: 'Failed to read file',
  FILE_WRITE_ERROR: 'Failed to write file',
  FILE_DELETE_ERROR: 'Failed to delete file',
  WORKSPACE_OPEN_ERROR: 'Failed to open workspace',
  CHECKPOINT_CREATE_ERROR: 'Failed to create checkpoint',
  CHECKPOINT_RESTORE_ERROR: 'Failed to restore checkpoint',
  GIT_INIT_ERROR: 'Failed to initialize Git repository',
  GIT_COMMIT_ERROR: 'Failed to commit changes',
  AI_REQUEST_ERROR: 'Failed to process AI request',
  SETTINGS_SAVE_ERROR: 'Failed to save settings',
  TERMINAL_CREATE_ERROR: 'Failed to create terminal session',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_SAVED: 'File saved successfully',
  WORKSPACE_OPENED: 'Workspace opened successfully',
  CHECKPOINT_CREATED: 'Checkpoint created successfully',
  CHECKPOINT_RESTORED: 'Checkpoint restored successfully',
  GIT_COMMITTED: 'Changes committed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;
