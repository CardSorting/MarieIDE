/**
 * AI Model Orchestrator
 * 
 * Core component for managing multiple AI models and intelligent model selection.
 * This is the heart of our AI-first development environment's multi-model capabilities.
 */

import { EventEmitter } from 'events'
import { 
  AIModel, 
  ModelResponse, 
  ModelSelectionCriteria, 
  TaskType, 
  ModelStatus,
  SelectionStrategy,
  ModelOrchestrationConfig 
} from './ai_model_types'
import { ModelPerformanceMonitor } from './model_performance_monitor'
import { ModelSelector } from './model_selector'
import { ModelLoadBalancer } from './model_load_balancer'

export class ModelOrchestrator extends EventEmitter {
  private readonly models: Map<string, AIModel> = new Map()
  private readonly performanceMonitor: ModelPerformanceMonitor
  private readonly modelSelector: ModelSelector
  private readonly loadBalancer: ModelLoadBalancer
  private readonly config: ModelOrchestrationConfig
  private readonly requestQueue: Map<string, Promise<ModelResponse>> = new Map()

  constructor(config: ModelOrchestrationConfig) {
    super()
    this.config = config
    this.performanceMonitor = new ModelPerformanceMonitor()
    this.modelSelector = new ModelSelector(config.selectionStrategy)
    this.loadBalancer = new ModelLoadBalancer(config.loadBalancing)
    
    this.initializeModels()
    this.setupEventHandlers()
  }

  /**
   * Initialize all available AI models from configuration
   */
  private initializeModels(): void {
    const allModels = [...this.config.primaryModels, ...this.config.fallbackModels]
    
    for (const model of allModels) {
      this.models.set(model.id, model)
      this.performanceMonitor.registerModel(model.id)
    }
    
    this.emit('models_initialized', { modelCount: this.models.size })
  }

  /**
   * Setup event handlers for model orchestration
   */
  private setupEventHandlers(): void {
    this.performanceMonitor.on('performance_alert', (data) => {
      this.emit('performance_alert', data)
    })
    
    this.performanceMonitor.on('model_degraded', (modelId: string) => {
      this.emit('model_degraded', { modelId, timestamp: new Date() })
    })
  }

  /**
   * Select the optimal model for a given task
   */
  public async selectOptimalModel(criteria: ModelSelectionCriteria): Promise<AIModel> {
    try {
      const availableModels = this.getAvailableModels()
      const performanceMetrics = await this.performanceMonitor.getModelMetrics()
      
      const selectedModel = await this.modelSelector.selectModel({
        criteria,
        availableModels,
        performanceMetrics
      })
      
      if (!selectedModel) {
        throw new Error(
          `No suitable model found for task type: ${criteria.taskType}. ` +
          `Available models: ${availableModels.map(m => m.id).join(', ')}`
        )
      }
      
      this.emit('model_selected', { 
        modelId: selectedModel.id, 
        taskType: criteria.taskType,
        timestamp: new Date()
      })
      
      return selectedModel
    } catch (error) {
      this.emit('model_selection_error', { error, criteria })
      throw error
    }
  }

  /**
   * Execute a request using the optimal model
   */
  public async executeRequest(
    prompt: string,
    criteria: ModelSelectionCriteria,
    options?: RequestOptions
  ): Promise<ModelResponse> {
    const requestId = this.generateRequestId()
    
    try {
      // Check if request is already in progress (deduplication)
      if (this.requestQueue.has(requestId)) {
        return await this.requestQueue.get(requestId)!
      }

      // Select optimal model
      const selectedModel = await this.selectOptimalModel(criteria)
      
      // Load balance if multiple instances available
      const targetModel = await this.loadBalancer.selectInstance(selectedModel)
      
      // Execute request
      const requestPromise = this.executeModelRequest(targetModel, prompt, options)
      this.requestQueue.set(requestId, requestPromise)
      
      const startTime = Date.now()
      const response = await requestPromise
      const responseTime = Date.now() - startTime
      
      // Update performance metrics
      await this.performanceMonitor.recordResponse({
        modelId: selectedModel.id,
        responseTime,
        success: true,
        tokensUsed: response.tokensUsed
      })
      
      this.requestQueue.delete(requestId)
      return response
      
    } catch (error) {
      this.requestQueue.delete(requestId)
      
      // Record failure in performance monitor
      await this.performanceMonitor.recordResponse({
        modelId: criteria.taskType, // Fallback identifier
        responseTime: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Try fallback models if primary model fails
      return await this.executeWithFallback(prompt, criteria, options)
    }
  }

  /**
   * Execute request with fallback models
   */
  private async executeWithFallback(
    prompt: string,
    criteria: ModelSelectionCriteria,
    options?: RequestOptions
  ): Promise<ModelResponse> {
    const fallbackModels = this.config.fallbackModels.filter(model => 
      this.modelSelector.isModelSuitable(model, criteria)
    )
    
    for (const fallbackModel of fallbackModels) {
      try {
        this.emit('using_fallback_model', { 
          modelId: fallbackModel.id,
          originalCriteria: criteria
        })
        
        const response = await this.executeModelRequest(fallbackModel, prompt, options)
        
        this.emit('fallback_success', { 
          modelId: fallbackModel.id,
          responseTime: Date.now()
        })
        
        return response
      } catch (error) {
        this.emit('fallback_failed', { 
          modelId: fallbackModel.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        continue
      }
    }
    
    throw new Error(
      `All models failed for task type: ${criteria.taskType}. ` +
      `Tried ${fallbackModels.length} fallback models.`
    )
  }

  /**
   * Execute request on a specific model
   */
  private async executeModelRequest(
    model: AIModel,
    prompt: string,
    options?: RequestOptions
  ): Promise<ModelResponse> {
    // This would integrate with actual model APIs
    // For now, we'll create a mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          content: `Mock response from ${model.name}`,
          modelId: model.id,
          responseTimeMs: Math.random() * 1000 + 500,
          tokensUsed: Math.floor(prompt.length / 4), // Rough token estimation
          confidence: 0.95,
          metadata: {
            finishReason: 'stop',
            usage: {
              promptTokens: Math.floor(prompt.length / 4),
              completionTokens: 50,
              totalTokens: Math.floor(prompt.length / 4) + 50
            },
            modelVersion: '1.0.0',
            timestamp: new Date()
          }
        })
      }, Math.random() * 1000 + 200)
    })
  }

  /**
   * Get all available models
   */
  private getAvailableModels(): AIModel[] {
    return Array.from(this.models.values()).filter(model => {
      const status = this.performanceMonitor.getModelStatus(model.id)
      return status === ModelStatus.AVAILABLE
    })
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get orchestration status and metrics
   */
  public async getStatus(): Promise<OrchestrationStatus> {
    const modelMetrics = await this.performanceMonitor.getAllMetrics()
    const activeRequests = this.requestQueue.size
    
    return {
      totalModels: this.models.size,
      availableModels: this.getAvailableModels().length,
      activeRequests,
      averageResponseTime: this.calculateAverageResponseTime(modelMetrics),
      successRate: this.calculateSuccessRate(modelMetrics),
      lastUpdated: new Date()
    }
  }

  /**
   * Calculate average response time across all models
   */
  private calculateAverageResponseTime(metrics: any[]): number {
    if (metrics.length === 0) return 0
    
    const totalTime = metrics.reduce((sum, metric) => sum + metric.averageResponseTime, 0)
    return totalTime / metrics.length
  }

  /**
   * Calculate overall success rate
   */
  private calculateSuccessRate(metrics: any[]): number {
    if (metrics.length === 0) return 0
    
    const totalRequests = metrics.reduce((sum, metric) => sum + metric.totalRequests, 0)
    const successfulRequests = metrics.reduce((sum, metric) => sum + metric.successfulRequests, 0)
    
    return totalRequests > 0 ? successfulRequests / totalRequests : 0
  }
}

export interface RequestOptions {
  readonly maxTokens?: number
  readonly temperature?: number
  readonly timeout?: number
  readonly retries?: number
}

export interface OrchestrationStatus {
  readonly totalModels: number
  readonly availableModels: number
  readonly activeRequests: number
  readonly averageResponseTime: number
  readonly successRate: number
  readonly lastUpdated: Date
}
