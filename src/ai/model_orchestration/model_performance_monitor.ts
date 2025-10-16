/**
 * Model Performance Monitor
 * 
 * Tracks and monitors the performance of all AI models in the orchestration system.
 * Provides real-time metrics and alerts for model health and performance.
 */

import { EventEmitter } from 'events'
import { AIModel, ModelStatus } from './ai_model_types'

export interface ModelMetrics {
  readonly modelId: string
  readonly totalRequests: number
  readonly successfulRequests: number
  readonly failedRequests: number
  readonly averageResponseTime: number
  readonly minResponseTime: number
  readonly maxResponseTime: number
  readonly totalTokensUsed: number
  readonly averageTokensPerRequest: number
  readonly errorRate: number
  readonly lastRequestTime: Date | null
  readonly status: ModelStatus
  readonly healthScore: number
}

export interface PerformanceAlert {
  readonly type: 'degraded_performance' | 'high_error_rate' | 'slow_response' | 'rate_limit_exceeded'
  readonly modelId: string
  readonly severity: 'low' | 'medium' | 'high' | 'critical'
  readonly message: string
  readonly timestamp: Date
  readonly metrics: Partial<ModelMetrics>
}

export class ModelPerformanceMonitor extends EventEmitter {
  private readonly metrics: Map<string, ModelMetrics> = new Map()
  private readonly requestHistory: Map<string, RequestRecord[]> = new Map()
  private readonly alertThresholds: AlertThresholds
  private readonly maxHistorySize = 1000

  constructor() {
    super()
    this.alertThresholds = {
      maxResponseTime: 10000, // 10 seconds
      maxErrorRate: 0.1, // 10%
      minHealthScore: 0.7, // 70%
      maxRequestsPerMinute: 100
    }
  }

  /**
   * Register a new model for monitoring
   */
  public registerModel(modelId: string): void {
    const initialMetrics: ModelMetrics = {
      modelId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      totalTokensUsed: 0,
      averageTokensPerRequest: 0,
      errorRate: 0,
      lastRequestTime: null,
      status: ModelStatus.AVAILABLE,
      healthScore: 1.0
    }

    this.metrics.set(modelId, initialMetrics)
    this.requestHistory.set(modelId, [])
    
    this.emit('model_registered', { modelId, timestamp: new Date() })
  }

  /**
   * Record a model response for performance tracking
   */
  public async recordResponse(response: ResponseRecord): Promise<void> {
    const modelId = response.modelId
    const currentMetrics = this.metrics.get(modelId)
    
    if (!currentMetrics) {
      console.warn(`Model ${modelId} not registered for monitoring`)
      return
    }

    // Add to request history
    this.addToHistory(modelId, response)

    // Update metrics
    const updatedMetrics = this.calculateUpdatedMetrics(modelId, response)
    this.metrics.set(modelId, updatedMetrics)

    // Check for performance alerts
    await this.checkPerformanceAlerts(modelId, updatedMetrics)

    this.emit('metrics_updated', { modelId, metrics: updatedMetrics })
  }

  /**
   * Add request to history for trend analysis
   */
  private addToHistory(modelId: string, response: ResponseRecord): void {
    const history = this.requestHistory.get(modelId) || []
    const record: RequestRecord = {
      timestamp: new Date(),
      responseTime: response.responseTime,
      success: response.success,
      tokensUsed: response.tokensUsed,
      error: response.error
    }

    history.push(record)
    
    // Maintain history size limit
    if (history.length > this.maxHistorySize) {
      history.shift()
    }
    
    this.requestHistory.set(modelId, history)
  }

  /**
   * Calculate updated metrics based on new response
   */
  private calculateUpdatedMetrics(modelId: string, response: ResponseRecord): ModelMetrics {
    const current = this.metrics.get(modelId)!
    const history = this.requestHistory.get(modelId) || []

    const totalRequests = current.totalRequests + 1
    const successfulRequests = current.successfulRequests + (response.success ? 1 : 0)
    const failedRequests = current.failedRequests + (response.success ? 0 : 1)
    
    // Calculate response time metrics
    const responseTimes = history.map(r => r.responseTime).filter(t => t > 0)
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0

    // Calculate token usage
    const totalTokensUsed = current.totalTokensUsed + (response.tokensUsed || 0)
    const averageTokensPerRequest = totalRequests > 0 ? totalTokensUsed / totalRequests : 0

    // Calculate error rate
    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0

    // Calculate health score
    const healthScore = this.calculateHealthScore({
      errorRate,
      averageResponseTime,
      totalRequests,
      maxResponseTime: this.alertThresholds.maxResponseTime
    })

    // Determine model status
    const status = this.determineModelStatus(healthScore, errorRate)

    return {
      modelId,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      totalTokensUsed,
      averageTokensPerRequest,
      errorRate,
      lastRequestTime: new Date(),
      status,
      healthScore
    }
  }

  /**
   * Calculate health score based on performance metrics
   */
  private calculateHealthScore(metrics: {
    errorRate: number
    averageResponseTime: number
    totalRequests: number
    maxResponseTime: number
  }): number {
    let score = 1.0

    // Penalize high error rates
    if (metrics.errorRate > 0.05) { // >5% error rate
      score -= metrics.errorRate * 2 // Double penalty for errors
    }

    // Penalize slow response times
    if (metrics.averageResponseTime > metrics.maxResponseTime * 0.5) {
      const responseTimePenalty = (metrics.averageResponseTime / metrics.maxResponseTime - 0.5) * 0.5
      score -= responseTimePenalty
    }

    // Bonus for high request volume (indicates reliability)
    if (metrics.totalRequests > 100) {
      score += 0.1
    }

    return Math.max(0, Math.min(1, score))
  }

  /**
   * Determine model status based on health metrics
   */
  private determineModelStatus(healthScore: number, errorRate: number): ModelStatus {
    if (errorRate > 0.5) return ModelStatus.ERROR
    if (healthScore < 0.3) return ModelStatus.ERROR
    if (healthScore < 0.7) return ModelStatus.BUSY
    return ModelStatus.AVAILABLE
  }

  /**
   * Check for performance alerts and emit them
   */
  private async checkPerformanceAlerts(modelId: string, metrics: ModelMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = []

    // Check response time
    if (metrics.averageResponseTime > this.alertThresholds.maxResponseTime) {
      alerts.push({
        type: 'slow_response',
        modelId,
        severity: 'medium',
        message: `Model ${modelId} average response time (${metrics.averageResponseTime}ms) exceeds threshold (${this.alertThresholds.maxResponseTime}ms)`,
        timestamp: new Date(),
        metrics: { averageResponseTime: metrics.averageResponseTime }
      })
    }

    // Check error rate
    if (metrics.errorRate > this.alertThresholds.maxErrorRate) {
      alerts.push({
        type: 'high_error_rate',
        modelId,
        severity: 'high',
        message: `Model ${modelId} error rate (${(metrics.errorRate * 100).toFixed(1)}%) exceeds threshold (${(this.alertThresholds.maxErrorRate * 100)}%)`,
        timestamp: new Date(),
        metrics: { errorRate: metrics.errorRate }
      })
    }

    // Check health score
    if (metrics.healthScore < this.alertThresholds.minHealthScore) {
      alerts.push({
        type: 'degraded_performance',
        modelId,
        severity: metrics.healthScore < 0.5 ? 'critical' : 'high',
        message: `Model ${modelId} health score (${(metrics.healthScore * 100).toFixed(1)}%) below threshold (${(this.alertThresholds.minHealthScore * 100)}%)`,
        timestamp: new Date(),
        metrics: { healthScore: metrics.healthScore }
      })
    }

    // Emit alerts
    for (const alert of alerts) {
      this.emit('performance_alert', alert)
      
      if (alert.severity === 'critical') {
        this.emit('model_degraded', modelId)
      }
    }
  }

  /**
   * Get metrics for a specific model
   */
  public getModelMetrics(modelId: string): ModelMetrics | null {
    return this.metrics.get(modelId) || null
  }

  /**
   * Get metrics for all models
   */
  public getAllMetrics(): ModelMetrics[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Get model status
   */
  public getModelStatus(modelId: string): ModelStatus {
    const metrics = this.metrics.get(modelId)
    return metrics?.status || ModelStatus.OFFLINE
  }

  /**
   * Get performance trends for a model
   */
  public getPerformanceTrends(modelId: string, timeWindow: number = 3600000): PerformanceTrend {
    const history = this.requestHistory.get(modelId) || []
    const cutoffTime = new Date(Date.now() - timeWindow)
    const recentHistory = history.filter(r => r.timestamp >= cutoffTime)

    if (recentHistory.length === 0) {
      return {
        modelId,
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 0,
        trendDirection: 'stable'
      }
    }

    const responseTimes = recentHistory.map(r => r.responseTime).filter(t => t > 0)
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0
    const errorRate = recentHistory.filter(r => !r.success).length / recentHistory.length

    // Calculate trend direction
    const trendDirection = this.calculateTrendDirection(recentHistory)

    return {
      modelId,
      requestCount: recentHistory.length,
      averageResponseTime,
      errorRate,
      trendDirection
    }
  }

  /**
   * Calculate trend direction based on recent history
   */
  private calculateTrendDirection(history: RequestRecord[]): 'improving' | 'degrading' | 'stable' {
    if (history.length < 10) return 'stable'

    const firstHalf = history.slice(0, Math.floor(history.length / 2))
    const secondHalf = history.slice(Math.floor(history.length / 2))

    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.responseTime, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.responseTime, 0) / secondHalf.length

    const improvement = (firstHalfAvg - secondHalfAvg) / firstHalfAvg

    if (improvement > 0.1) return 'improving'
    if (improvement < -0.1) return 'degrading'
    return 'stable'
  }
}

export interface ResponseRecord {
  readonly modelId: string
  readonly responseTime: number
  readonly success: boolean
  readonly tokensUsed?: number
  readonly error?: string
}

export interface RequestRecord {
  readonly timestamp: Date
  readonly responseTime: number
  readonly success: boolean
  readonly tokensUsed?: number
  readonly error?: string
}

export interface AlertThresholds {
  readonly maxResponseTime: number
  readonly maxErrorRate: number
  readonly minHealthScore: number
  readonly maxRequestsPerMinute: number
}

export interface PerformanceTrend {
  readonly modelId: string
  readonly requestCount: number
  readonly averageResponseTime: number
  readonly errorRate: number
  readonly trendDirection: 'improving' | 'degrading' | 'stable'
}
