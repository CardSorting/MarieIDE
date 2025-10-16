/**
 * MarieIDE Main Process
 * 
 * Electron main process for the AI-first development environment.
 * Handles window management, AI model orchestration, and system integration.
 */

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { ModelOrchestrator } from '../ai/model_orchestration/model_orchestrator'
import { ModelOrchestrationConfig } from '../ai/model_orchestration/ai_model_types'
import { ProjectContextManager } from '../ai/context_management/project_context_manager'

class MarieIDEMain {
  private mainWindow: BrowserWindow | null = null
  private modelOrchestrator: ModelOrchestrator | null = null
  private projectContextManager: ProjectContextManager | null = null
  private isDev: boolean = false

  constructor() {
    this.isDev = process.argv.includes('--dev')
    this.initializeApp()
  }

  /**
   * Initialize the Electron application
   */
  private initializeApp(): void {
    app.whenReady().then(() => {
      this.createWindow()
      this.initializeAI()
      this.setupMenu()
      this.setupIPC()
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow()
        }
      })
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('before-quit', () => {
      this.cleanup()
    })
  }

  /**
   * Create the main application window
   */
  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, 'preload.js')
      },
      titleBarStyle: 'hiddenInset',
      show: false
    })

    // Load the renderer
    if (this.isDev) {
      this.mainWindow.loadURL('http://localhost:3000')
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  /**
   * Initialize AI systems
   */
  private async initializeAI(): Promise<void> {
    try {
      // Initialize model orchestration
      const orchestrationConfig = this.createOrchestrationConfig()
      this.modelOrchestrator = new ModelOrchestrator(orchestrationConfig)
      
      // Initialize project context manager
      this.projectContextManager = new ProjectContextManager()
      
      // Set up AI event handlers
      this.setupAIEventHandlers()
      
      console.log('AI systems initialized successfully')
      
      // Notify renderer that AI is ready
      this.mainWindow?.webContents.send('ai-ready')
      
    } catch (error) {
      console.error('Failed to initialize AI systems:', error)
      this.showErrorDialog('AI Initialization Error', 
        `Failed to initialize AI systems: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create model orchestration configuration
   */
  private createOrchestrationConfig(): ModelOrchestrationConfig {
    return {
      primaryModels: [
        // This would be populated with actual model configurations
        // For now, we'll use placeholder models
      ],
      fallbackModels: [
        // Fallback models for redundancy
      ],
      selectionStrategy: 'performance_first' as any,
      loadBalancing: {
        strategy: 'performance_based',
        healthCheckInterval: 30000
      },
      caching: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000,
        compressionEnabled: true
      }
    }
  }

  /**
   * Setup AI event handlers
   */
  private setupAIEventHandlers(): void {
    if (!this.modelOrchestrator) return

    this.modelOrchestrator.on('model_selected', (data) => {
      this.mainWindow?.webContents.send('model-selected', data)
    })

    this.modelOrchestrator.on('performance_alert', (alert) => {
      this.mainWindow?.webContents.send('performance-alert', alert)
    })

    this.modelOrchestrator.on('model_degraded', (data) => {
      this.mainWindow?.webContents.send('model-degraded', data)
    })
  }

  /**
   * Setup application menu
   */
  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Open Project',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.openProject()
          },
          {
            label: 'New Project',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.createNewProject()
          },
          { type: 'separator' },
          {
            label: 'Settings',
            accelerator: 'CmdOrCtrl+,',
            click: () => this.openSettings()
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'AI',
        submenu: [
          {
            label: 'Model Status',
            click: () => this.showModelStatus()
          },
          {
            label: 'Performance Metrics',
            click: () => this.showPerformanceMetrics()
          },
          { type: 'separator' },
          {
            label: 'Reload AI Models',
            click: () => this.reloadAIModels()
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Developer Tools',
            accelerator: 'F12',
            click: () => this.mainWindow?.webContents.toggleDevTools()
          },
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: () => this.mainWindow?.webContents.reload()
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About MarieIDE',
            click: () => this.showAbout()
          },
          {
            label: 'Documentation',
            click: () => this.openDocumentation()
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  /**
   * Setup IPC communication
   */
  private setupIPC(): void {
    // Project management IPC
    ipcMain.handle('open-project', async () => {
      return this.openProject()
    })

    ipcMain.handle('create-project', async () => {
      return this.createNewProject()
    })

    // AI model IPC
    ipcMain.handle('execute-ai-request', async (event, request) => {
      if (!this.modelOrchestrator) {
        throw new Error('AI system not initialized')
      }
      return await this.modelOrchestrator.executeRequest(
        request.prompt,
        request.criteria,
        request.options
      )
    })

    ipcMain.handle('get-ai-status', async () => {
      if (!this.modelOrchestrator) {
        return { error: 'AI system not initialized' }
      }
      return await this.modelOrchestrator.getStatus()
    })

    // Project context IPC
    ipcMain.handle('analyze-project', async (event, projectPath) => {
      if (!this.projectContextManager) {
        throw new Error('Project context manager not initialized')
      }
      return await this.projectContextManager.analyzeProject(projectPath)
    })

    ipcMain.handle('get-project-context', async (event, projectId) => {
      if (!this.projectContextManager) {
        throw new Error('Project context manager not initialized')
      }
      return await this.projectContextManager.getProjectContext(projectId)
    })
  }

  /**
   * Open project dialog
   */
  private async openProject(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openDirectory'],
      title: 'Open Project Directory'
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const projectPath = result.filePaths[0]
      this.loadProject(projectPath)
    }
  }

  /**
   * Create new project
   */
  private async createNewProject(): Promise<void> {
    const result = await dialog.showSaveDialog(this.mainWindow!, {
      title: 'Create New Project',
      defaultPath: 'new-project',
      buttonLabel: 'Create'
    })

    if (!result.canceled && result.filePath) {
      // Create new project directory and initialize
      this.createProjectDirectory(result.filePath)
    }
  }

  /**
   * Load project from path
   */
  private async loadProject(projectPath: string): Promise<void> {
    try {
      if (!this.projectContextManager) {
        throw new Error('Project context manager not initialized')
      }

      // Analyze project
      const projectContext = await this.projectContextManager.analyzeProject(projectPath)
      
      // Notify renderer
      this.mainWindow?.webContents.send('project-loaded', projectContext)
      
      console.log(`Project loaded: ${projectContext.name}`)
    } catch (error) {
      console.error('Failed to load project:', error)
      this.showErrorDialog('Project Load Error', 
        `Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create new project directory
   */
  private async createProjectDirectory(projectPath: string): Promise<void> {
    // Implementation would create project structure
    console.log(`Creating new project at: ${projectPath}`)
  }

  /**
   * Show model status
   */
  private showModelStatus(): void {
    this.mainWindow?.webContents.send('show-model-status')
  }

  /**
   * Show performance metrics
   */
  private showPerformanceMetrics(): void {
    this.mainWindow?.webContents.send('show-performance-metrics')
  }

  /**
   * Reload AI models
   */
  private async reloadAIModels(): Promise<void> {
    try {
      await this.initializeAI()
      console.log('AI models reloaded')
    } catch (error) {
      console.error('Failed to reload AI models:', error)
    }
  }

  /**
   * Open settings
   */
  private openSettings(): void {
    this.mainWindow?.webContents.send('open-settings')
  }

  /**
   * Show about dialog
   */
  private showAbout(): void {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'About MarieIDE',
      message: 'MarieIDE - AI-First Development Environment',
      detail: 'Version 0.1.0\n\nAn autonomous AI-driven development environment that revolutionizes software development through intelligent code generation and management.',
      buttons: ['OK']
    })
  }

  /**
   * Open documentation
   */
  private openDocumentation(): void {
    // Open documentation URL
    require('electron').shell.openExternal('https://marieide.dev/docs')
  }

  /**
   * Show error dialog
   */
  private showErrorDialog(title: string, message: string): void {
    dialog.showErrorBox(title, message)
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Cleanup AI systems
    if (this.modelOrchestrator) {
      this.modelOrchestrator.removeAllListeners()
    }
    
    if (this.projectContextManager) {
      this.projectContextManager.cleanup()
    }
  }
}

// Initialize the application
new MarieIDEMain()
