/**
 * AI Model Status Component
 * 
 * Displays real-time status and performance metrics of AI models.
 * Provides transparency into the AI system's operation.
 */

import React, { useState, useEffect } from 'react'

interface AIModelStatusProps {
  isOpen: boolean
  onClose: () => void
}

export const AIModelStatus: React.FC<AIModelStatusProps> = ({ isOpen, onClose }) => {
  const [aiStatus, setAIStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAIStatus()
    }
  }, [isOpen])

  const loadAIStatus = async () => {
    setIsLoading(true)
    try {
      const status = await window.marieIDE.ai.getStatus()
      setAIStatus(status)
    } catch (error) {
      console.error('Failed to load AI status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI Model Status</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div>Loading AI status...</div>
            </div>
          ) : aiStatus ? (
            <div className="status-content">
              <div className="status-overview">
                <div className="overview-item">
                  <div className="overview-label">Total Models</div>
                  <div className="overview-value">{aiStatus.totalModels}</div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Available Models</div>
                  <div className="overview-value">{aiStatus.availableModels}</div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Active Requests</div>
                  <div className="overview-value">{aiStatus.activeRequests}</div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Success Rate</div>
                  <div className="overview-value">
                    {Math.round(aiStatus.successRate * 100)}%
                  </div>
                </div>
              </div>

              <div className="performance-metrics">
                <h3>Performance Metrics</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-label">Average Response Time</div>
                    <div className="metric-value">{aiStatus.averageResponseTime}ms</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Last Updated</div>
                    <div className="metric-value">
                      {new Date(aiStatus.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="actions">
                <button onClick={loadAIStatus} className="refresh-button">
                  Refresh Status
                </button>
              </div>
            </div>
          ) : (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <div className="error-message">Failed to load AI status</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
