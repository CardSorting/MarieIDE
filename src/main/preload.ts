/**
 * MarieIDE Preload Script
 * 
 * Secure bridge between main process and renderer for AI-first development environment.
 * Provides controlled access to AI capabilities and system functions.
 */

import { contextBridge, ipcRenderer } from 'electron'

// Define the API that will be exposed to the renderer
const marieIDEAPI = {
  // Project management
  project: {
    open: () => ipcRenderer.invoke('open-project'),
    create: () => ipcRenderer.invoke('create-project'),
    analyze: (projectPath: string) => ipcRenderer.invoke('analyze-project', projectPath),
    getContext: (projectId: string) => ipcRenderer.invoke('get-project-context', projectId)
  },

  // AI model operations
  ai: {
    executeRequest: (request: AIRequest) => ipcRenderer.invoke('execute-ai-request', request),
    getStatus: () => ipcRenderer.invoke('get-ai-status'),
    onModelSelected: (callback: (data: any) => void) => {
      ipcRenderer.on('model-selected', (event, data) => callback(data))
    },
    onPerformanceAlert: (callback: (alert: any) => void) => {
      ipcRenderer.on('performance-alert', (event, alert) => callback(alert))
    },
    onModelDegraded: (callback: (data: any) => void) => {
      ipcRenderer.on('model-degraded', (event, data) => callback(data))
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('model-selected')
      ipcRenderer.removeAllListeners('performance-alert')
      ipcRenderer.removeAllListeners('model-degraded')
    }
  },

  // System events
  system: {
    onAIReady: (callback: () => void) => {
      ipcRenderer.on('ai-ready', callback)
    },
    onProjectLoaded: (callback: (project: any) => void) => {
      ipcRenderer.on('project-loaded', (event, project) => callback(project))
    },
    onShowModelStatus: (callback: () => void) => {
      ipcRenderer.on('show-model-status', callback)
    },
    onShowPerformanceMetrics: (callback: () => void) => {
      ipcRenderer.on('show-performance-metrics', callback)
    },
    onOpenSettings: (callback: () => void) => {
      ipcRenderer.on('open-settings', callback)
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('ai-ready')
      ipcRenderer.removeAllListeners('project-loaded')
      ipcRenderer.removeAllListeners('show-model-status')
      ipcRenderer.removeAllListeners('show-performance-metrics')
      ipcRenderer.removeAllListeners('open-settings')
    }
  },

  // Utility functions
  utils: {
    getVersion: () => process.env.npm_package_version || '0.1.0',
    getPlatform: () => process.platform,
    isDev: () => process.env.NODE_ENV === 'development'
  }
}

// Type definitions for the API
export interface AIRequest {
  prompt: string
  criteria: {
    taskType: string
    contextSize: number
    requiredCapabilities: any
    performanceRequirements: {
      maxResponseTimeMs: number
      minAccuracy: number
      reliability: number
    }
    costConstraints: {
      maxCostPerRequest: number
      budgetLimit: number
    }
  }
  options?: {
    maxTokens?: number
    temperature?: number
    timeout?: number
    retries?: number
  }
}

export interface AIResponse {
  content: string
  modelId: string
  responseTimeMs: number
  tokensUsed: number
  confidence: number
  metadata: {
    finishReason: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
    modelVersion: string
    timestamp: Date
  }
}

export interface AIStatus {
  totalModels: number
  availableModels: number
  activeRequests: number
  averageResponseTime: number
  successRate: number
  lastUpdated: Date
}

export interface ProjectContext {
  id: string
  name: string
  rootPath: string
  type: string
  language: string
  framework?: string
  structure: any
  dependencies: any[]
  configuration: any
  metadata: any
  lastAnalyzed: Date
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('marieIDE', marieIDEAPI)

// Type declaration for the global API
declare global {
  interface Window {
    marieIDE: typeof marieIDEAPI
  }
}
