/**
 * MarieIDE Renderer Application
 * 
 * Main React application for the AI-first development environment.
 * Provides the minimal editor interface optimized for AI collaboration.
 */

import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AIFirstEditor } from './components/AIFirstEditor'
import { ProjectManager } from './components/ProjectManager'
import { AIModelStatus } from './components/AIModelStatus'
import { LoadingScreen } from './components/LoadingScreen'
import './styles/global.css'

interface AppState {
  isAIReady: boolean
  isProjectLoaded: boolean
  currentProject: any | null
  aiStatus: any | null
  error: string | null
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isAIReady: false,
    isProjectLoaded: false,
    currentProject: null,
    aiStatus: null,
    error: null
  })

  useEffect(() => {
    // Set up event listeners for AI and project events
    setupEventListeners()
    
    // Check if AI is already ready
    checkAIStatus()
    
    return () => {
      cleanup()
    }
  }, [])

  const setupEventListeners = () => {
    // AI ready event
    window.marieIDE.system.onAIReady(() => {
      setState(prev => ({ ...prev, isAIReady: true }))
      checkAIStatus()
    })

    // Project loaded event
    window.marieIDE.system.onProjectLoaded((project: any) => {
      setState(prev => ({ 
        ...prev, 
        isProjectLoaded: true, 
        currentProject: project 
      }))
    })

    // AI model events
    window.marieIDE.ai.onModelSelected((data: any) => {
      console.log('Model selected:', data)
    })

    window.marieIDE.ai.onPerformanceAlert((alert: any) => {
      console.warn('Performance alert:', alert)
      // Could show notification to user
    })

    window.marieIDE.ai.onModelDegraded((data: any) => {
      console.error('Model degraded:', data)
      // Could show error notification
    })

    // Menu events
    window.marieIDE.system.onShowModelStatus(() => {
      showModelStatus()
    })

    window.marieIDE.system.onShowPerformanceMetrics(() => {
      showPerformanceMetrics()
    })

    window.marieIDE.system.onOpenSettings(() => {
      showSettings()
    })
  }

  const checkAIStatus = async () => {
    try {
      const status = await window.marieIDE.ai.getStatus()
      setState(prev => ({ ...prev, aiStatus: status }))
    } catch (error) {
      console.error('Failed to get AI status:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to initialize AI system' 
      }))
    }
  }

  const cleanup = () => {
    window.marieIDE.ai.removeAllListeners()
    window.marieIDE.system.removeAllListeners()
  }

  const showModelStatus = () => {
    // Implementation for showing model status dialog
    console.log('Show model status')
  }

  const showPerformanceMetrics = () => {
    // Implementation for showing performance metrics
    console.log('Show performance metrics')
  }

  const showSettings = () => {
    // Implementation for showing settings dialog
    console.log('Show settings')
  }

  const handleOpenProject = async () => {
    try {
      await window.marieIDE.project.open()
    } catch (error) {
      console.error('Failed to open project:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to open project' 
      }))
    }
  }

  const handleCreateProject = async () => {
    try {
      await window.marieIDE.project.create()
    } catch (error) {
      console.error('Failed to create project:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create project' 
      }))
    }
  }

  // Show loading screen while AI is initializing
  if (!state.isAIReady) {
    return (
      <LoadingScreen 
        message="Initializing AI Systems"
        submessage="Setting up multi-model orchestration and context management"
      />
    )
  }

  // Show error screen if there's an error
  if (state.error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h1>Error</h1>
          <p>{state.error}</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      </div>
    )
  }

  // Show project manager if no project is loaded
  if (!state.isProjectLoaded) {
    return (
      <ProjectManager 
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
        aiStatus={state.aiStatus}
      />
    )
  }

  // Show main editor interface
  return (
    <div className="app-container">
      <AIFirstEditor 
        project={state.currentProject}
        aiStatus={state.aiStatus}
      />
    </div>
  )
}

// Initialize the application
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
} else {
  console.error('Root container not found')
}
