/**
 * Loading Screen Component
 * 
 * Displays loading state while AI systems are initializing.
 * Shows progress and status information to the user.
 */

import React from 'react'

interface LoadingScreenProps {
  message: string
  submessage: string
  progress?: number
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message, 
  submessage, 
  progress 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-icon">M</div>
          <div className="logo-text">MarieIDE</div>
        </div>
        
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        
        <div className="loading-text">
          <h2>{message}</h2>
          <p>{submessage}</p>
        </div>
        
        {progress !== undefined && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>
        )}
        
        <div className="loading-features">
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <div className="feature-text">AI Model Orchestration</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🧠</div>
            <div className="feature-text">Context Management</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">Intelligent Code Generation</div>
          </div>
        </div>
      </div>
    </div>
  )
}
