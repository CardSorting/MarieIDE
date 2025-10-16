/**
 * Project Manager Component
 * 
 * Handles project creation, opening, and management in the AI-first environment.
 * Provides an intuitive interface for project operations.
 */

import React, { useState } from 'react'

interface ProjectManagerProps {
  onOpenProject: () => void
  onCreateProject: () => void
  aiStatus: any | null
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  onOpenProject,
  onCreateProject,
  aiStatus
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenProject = async () => {
    setIsLoading(true)
    try {
      await onOpenProject()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    setIsLoading(true)
    try {
      await onCreateProject()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="project-manager">
      <div className="project-manager-content">
        <div className="welcome-section">
          <div className="welcome-header">
            <div className="logo">
              <div className="logo-icon">M</div>
              <div className="logo-text">MarieIDE</div>
            </div>
            <div className="welcome-title">
              AI-First Development Environment
            </div>
            <div className="welcome-subtitle">
              Autonomous code generation and intelligent project management
            </div>
          </div>
        </div>

        <div className="project-actions">
          <div className="action-card" onClick={handleOpenProject}>
            <div className="action-icon">📁</div>
            <div className="action-title">Open Project</div>
            <div className="action-description">
              Open an existing project and let AI analyze and understand your codebase
            </div>
            <div className="action-button">
              {isLoading ? 'Opening...' : 'Browse'}
            </div>
          </div>

          <div className="action-card" onClick={handleCreateProject}>
            <div className="action-icon">✨</div>
            <div className="action-title">Create Project</div>
            <div className="action-description">
              Start a new project with AI-assisted setup and intelligent scaffolding
            </div>
            <div className="action-button">
              {isLoading ? 'Creating...' : 'Create'}
            </div>
          </div>
        </div>

        {aiStatus && (
          <div className="ai-status-section">
            <div className="status-header">
              <h3>AI System Status</h3>
            </div>
            <div className="status-grid">
              <div className="status-item">
                <div className="status-label">Available Models</div>
                <div className="status-value">{aiStatus.availableModels}</div>
              </div>
              <div className="status-item">
                <div className="status-label">Success Rate</div>
                <div className="status-value">
                  {Math.round(aiStatus.successRate * 100)}%
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">Avg Response Time</div>
                <div className="status-value">{aiStatus.averageResponseTime}ms</div>
              </div>
              <div className="status-item">
                <div className="status-label">Active Requests</div>
                <div className="status-value">{aiStatus.activeRequests}</div>
              </div>
            </div>
          </div>
        )}

        <div className="features-section">
          <div className="features-header">
            <h3>AI-First Capabilities</h3>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <div className="feature-title">Multi-Model AI</div>
              <div className="feature-description">
                Intelligent orchestration of multiple AI models for optimal performance
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <div className="feature-title">Context Understanding</div>
              <div className="feature-description">
                Automatic analysis and understanding of your entire codebase
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">Code Generation</div>
              <div className="feature-description">
                Generate complete features from natural language descriptions
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <div className="feature-title">Autonomous Workflows</div>
              <div className="feature-description">
                Self-managing development processes with minimal human intervention
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-title">Intelligent Testing</div>
              <div className="feature-description">
                Automatic test generation and validation for quality assurance
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <div className="feature-title">Performance Optimization</div>
              <div className="feature-description">
                Continuous optimization and performance improvement
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
