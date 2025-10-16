/**
 * AI-First Editor Component
 * 
 * Main editor interface optimized for AI collaboration.
 * Provides minimal human interface with maximum AI capabilities.
 */

import React, { useState, useRef, useEffect } from 'react'

interface AIFirstEditorProps {
  project: any
  aiStatus: any | null
}

export const AIFirstEditor: React.FC<AIFirstEditorProps> = ({ 
  project, 
  aiStatus 
}) => {
  const [isAIActive, setIsAIActive] = useState(false)
  const [aiRequest, setAIRequest] = useState('')
  const [aiResponse, setAIResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAIRequest = async () => {
    if (!aiRequest.trim() || isProcessing) return

    setIsProcessing(true)
    const userMessage = {
      type: 'user',
      content: aiRequest,
      timestamp: new Date()
    }

    setConversationHistory(prev => [...prev, userMessage])

    try {
      const response = await window.marieIDE.ai.executeRequest({
        prompt: aiRequest,
        criteria: {
          taskType: 'code_generation',
          contextSize: 10000,
          requiredCapabilities: {
            codeGeneration: true,
            codeAnalysis: true,
            naturalLanguage: true
          },
          performanceRequirements: {
            maxResponseTimeMs: 5000,
            minAccuracy: 0.95,
            reliability: 0.9
          },
          costConstraints: {
            maxCostPerRequest: 1.0,
            budgetLimit: 100.0
          }
        }
      })

      const aiMessage = {
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata
      }

      setConversationHistory(prev => [...prev, aiMessage])
      setAIResponse(response.content)
      setAIRequest('')
    } catch (error) {
      console.error('AI request failed:', error)
      const errorMessage = {
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setConversationHistory(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleAIRequest()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className="ai-editor">
      <div className="editor-header">
        <div className="project-info">
          <div className="project-name">{project?.name || 'Untitled Project'}</div>
          <div className="project-path">{project?.rootPath || ''}</div>
        </div>
        <div className="ai-status">
          <div className={`status-indicator ${isAIActive ? 'active' : 'inactive'}`}>
            <div className="status-dot"></div>
            <span>AI {isAIActive ? 'Active' : 'Ready'}</span>
          </div>
          {aiStatus && (
            <div className="performance-info">
              <span>{aiStatus.availableModels} models</span>
              <span>{Math.round(aiStatus.successRate * 100)}% success</span>
            </div>
          )}
        </div>
      </div>

      <div className="editor-content">
        <div className="conversation-panel">
          <div className="conversation-header">
            <h3>AI Assistant</h3>
            <div className="conversation-controls">
              <button 
                className="clear-button"
                onClick={() => setConversationHistory([])}
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="conversation-history">
            {conversationHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <div className="empty-title">AI Assistant Ready</div>
                <div className="empty-description">
                  Describe what you want to build or ask questions about your code.
                  The AI will understand your project context and help you develop.
                </div>
              </div>
            ) : (
              conversationHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`conversation-message ${message.type}`}
                >
                  <div className="message-header">
                    <div className="message-type">
                      {message.type === 'user' ? 'You' : 
                       message.type === 'ai' ? 'AI' : 'Error'}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                  {message.metadata && (
                    <div className="message-metadata">
                      <div className="metadata-item">
                        Model: {message.metadata.modelVersion}
                      </div>
                      <div className="metadata-item">
                        Tokens: {message.metadata.usage.totalTokens}
                      </div>
                      <div className="metadata-item">
                        Time: {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="input-panel">
            <div className="input-container">
              <textarea
                ref={textareaRef}
                value={aiRequest}
                onChange={(e) => setAIRequest(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you want to build or ask about your code..."
                disabled={isProcessing}
                className="ai-input"
              />
              <button
                onClick={handleAIRequest}
                disabled={!aiRequest.trim() || isProcessing}
                className="send-button"
              >
                {isProcessing ? 'Processing...' : 'Send'}
              </button>
            </div>
            <div className="input-hint">
              Press Ctrl+Enter to send message
            </div>
          </div>
        </div>

        <div className="code-panel">
          <div className="code-header">
            <h3>Generated Code</h3>
            <div className="code-controls">
              <button className="apply-button">Apply Changes</button>
              <button className="preview-button">Preview</button>
            </div>
          </div>
          
          <div className="code-content">
            {aiResponse ? (
              <pre className="generated-code">
                <code>{aiResponse}</code>
              </pre>
            ) : (
              <div className="code-empty-state">
                <div className="empty-icon">💻</div>
                <div className="empty-title">No Code Generated</div>
                <div className="empty-description">
                  Ask the AI to generate code and it will appear here.
                  You can then review, modify, and apply the changes.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
