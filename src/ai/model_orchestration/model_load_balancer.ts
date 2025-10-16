/**
 * Model Load Balancer
 * 
 * Distributes requests across multiple instances of the same model type
 * to optimize performance and handle high-volume workloads.
 */

import { AIModel } from './ai_model_types'
import { LoadBalancingConfig } from './ai_model_types'

export interface LoadBalancingStrategy {
  selectInstance(model: AIModel): Promise<AIModel>
  getInstanceMetrics(modelId: string): InstanceMetrics[]
  updateInstanceHealth(modelId: string, instanceId: string, health: InstanceHealth): void
}

export interface InstanceMetrics {
  readonly instanceId: string
  readonly modelId: string
  readonly activeRequests: number
  readonly totalRequests: number
  readonly averageResponseTime: number
  readonly errorRate: number
  readonly lastRequestTime: Date | null
  readonly health: InstanceHealth
}

export interface InstanceHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy'
  readonly responseTime: number
  readonly errorRate: number
  readonly lastHealthCheck: Date
}

export class ModelLoadBalancer implements LoadBalancingStrategy {
  private readonly config: LoadBalancingConfig
  private readonly instanceMetrics: Map<string, InstanceMetrics[]> = new Map()
  private readonly instanceHealth: Map<string, InstanceHealth> = new Map()
  private readonly roundRobinCounters: Map<string, number> = new Map()

  constructor(config: LoadBalancingConfig) {
    this.config = config
  }

  /**
   * Select an instance for the given model
   */
  public async selectInstance(model: AIModel): Promise<AIModel> {
    const instances = await this.getModelInstances(model.id)
    
    if (instances.length === 0) {
      return model // No instances available, return original model
    }

    if (instances.length === 1) {
      return instances[0]
    }

    switch (this.config.strategy) {
      case 'round_robin':
        return this.selectRoundRobin(model, instances)
      
      case 'weighted':
        return this.selectWeighted(model, instances)
      
      case 'performance_based':
        return this.selectPerformanceBased(model, instances)
      
      default:
        return this.selectRoundRobin(model, instances)
    }
  }

  /**
   * Round robin selection strategy
   */
  private selectRoundRobin(model: AIModel, instances: AIModel[]): AIModel {
    const counter = this.roundRobinCounters.get(model.id) || 0
    const selectedIndex = counter % instances.length
    const selectedInstance = instances[selectedIndex]
    
    this.roundRobinCounters.set(model.id, counter + 1)
    return selectedInstance
  }

  /**
   * Weighted selection strategy
   */
  private selectWeighted(model: AIModel, instances: AIModel[]): AIModel {
    if (!this.config.weights || Object.keys(this.config.weights).length === 0) {
      return this.selectRoundRobin(model, instances)
    }

    // Create weighted selection pool
    const weightedPool: AIModel[] = []
    
    for (const instance of instances) {
      const weight = this.config.weights![instance.id] || 1
      for (let i = 0; i < weight; i++) {
        weightedPool.push(instance)
      }
    }

    // Select randomly from weighted pool
    const randomIndex = Math.floor(Math.random() * weightedPool.length)
    return weightedPool[randomIndex]
  }

  /**
   * Performance-based selection strategy
   */
  private selectPerformanceBased(model: AIModel, instances: AIModel[]): AIModel {
    const metrics = this.instanceMetrics.get(model.id) || []
    
    if (metrics.length === 0) {
      return this.selectRoundRobin(model, instances)
    }

    // Score instances based on performance metrics
    const scoredInstances = instances.map(instance => {
      const instanceMetrics = metrics.find(m => m.instanceId === instance.id)
      const health = this.instanceHealth.get(instance.id)
      
      let score = 1.0
      
      if (instanceMetrics) {
        // Lower active requests = higher score
        score *= Math.max(0.1, 1 - (instanceMetrics.activeRequests / 10))
        
        // Lower response time = higher score
        score *= Math.max(0.1, 1 - (instanceMetrics.averageResponseTime / 5000))
        
        // Lower error rate = higher score
        score *= Math.max(0.1, 1 - instanceMetrics.errorRate)
      }
      
      // Health status multiplier
      if (health) {
        switch (health.status) {
          case 'healthy':
            score *= 1.0
            break
          case 'degraded':
            score *= 0.7
            break
          case 'unhealthy':
            score *= 0.1
            break
        }
      }
      
      return { instance, score }
    })

    // Sort by score and select the best one
    scoredInstances.sort((a, b) => b.score - a.score)
    return scoredInstances[0].instance
  }

  /**
   * Get available instances for a model
   */
  private async getModelInstances(modelId: string): Promise<AIModel[]> {
    // In a real implementation, this would query the model registry
    // For now, we'll return the model itself as a single instance
    return []
  }

  /**
   * Get instance metrics for a model
   */
  public getInstanceMetrics(modelId: string): InstanceMetrics[] {
    return this.instanceMetrics.get(modelId) || []
  }

  /**
   * Update instance health status
   */
  public updateInstanceHealth(modelId: string, instanceId: string, health: InstanceHealth): void {
    const metrics = this.instanceMetrics.get(modelId) || []
    const existingMetric = metrics.find(m => m.instanceId === instanceId)
    
    if (existingMetric) {
      const updatedMetric: InstanceMetrics = {
        ...existingMetric,
        health
      }
      
      const updatedMetrics = metrics.map(m => 
        m.instanceId === instanceId ? updatedMetric : m
      )
      
      this.instanceMetrics.set(modelId, updatedMetrics)
    }
    
    this.instanceHealth.set(instanceId, health)
  }

  /**
   * Record request metrics for an instance
   */
  public recordRequest(
    modelId: string,
    instanceId: string,
    responseTime: number,
    success: boolean
  ): void {
    const metrics = this.instanceMetrics.get(modelId) || []
    let instanceMetric = metrics.find(m => m.instanceId === instanceId)
    
    if (!instanceMetric) {
      instanceMetric = {
        instanceId,
        modelId,
        activeRequests: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastRequestTime: null,
        health: {
          status: 'healthy',
          responseTime: 0,
          errorRate: 0,
          lastHealthCheck: new Date()
        }
      }
      metrics.push(instanceMetric)
    }
    
    // Update metrics
    instanceMetric.totalRequests++
    if (!success) {
      instanceMetric.errorRate = (instanceMetric.errorRate * (instanceMetric.totalRequests - 1) + 1) / instanceMetric.totalRequests
    } else {
      instanceMetric.errorRate = (instanceMetric.errorRate * (instanceMetric.totalRequests - 1)) / instanceMetric.totalRequests
    }
    
    // Update average response time
    instanceMetric.averageResponseTime = (
      instanceMetric.averageResponseTime * (instanceMetric.totalRequests - 1) + responseTime
    ) / instanceMetric.totalRequests
    
    instanceMetric.lastRequestTime = new Date()
    
    this.instanceMetrics.set(modelId, metrics)
  }

  /**
   * Get load balancing statistics
   */
  public getLoadBalancingStats(): LoadBalancingStats {
    const stats: LoadBalancingStats = {
      totalModels: this.instanceMetrics.size,
      totalInstances: 0,
      averageInstancesPerModel: 0,
      unhealthyInstances: 0,
      totalActiveRequests: 0
    }
    
    for (const [modelId, metrics] of this.instanceMetrics) {
      stats.totalInstances += metrics.length
      stats.totalActiveRequests += metrics.reduce((sum, m) => sum + m.activeRequests, 0)
      stats.unhealthyInstances += metrics.filter(m => m.health.status === 'unhealthy').length
    }
    
    stats.averageInstancesPerModel = stats.totalModels > 0 
      ? stats.totalInstances / stats.totalModels 
      : 0
    
    return stats
  }

  /**
   * Perform health check on all instances
   */
  public async performHealthCheck(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = []
    
    for (const [modelId, metrics] of this.instanceMetrics) {
      for (const metric of metrics) {
        try {
          const health = await this.checkInstanceHealth(metric.instanceId)
          this.updateInstanceHealth(modelId, metric.instanceId, health)
          
          results.push({
            modelId,
            instanceId: metric.instanceId,
            health,
            timestamp: new Date()
          })
        } catch (error) {
          const unhealthyHealth: InstanceHealth = {
            status: 'unhealthy',
            responseTime: 0,
            errorRate: 1.0,
            lastHealthCheck: new Date()
          }
          
          this.updateInstanceHealth(modelId, metric.instanceId, unhealthyHealth)
          
          results.push({
            modelId,
            instanceId: metric.instanceId,
            health: unhealthyHealth,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          })
        }
      }
    }
    
    return results
  }

  /**
   * Check health of a specific instance
   */
  private async checkInstanceHealth(instanceId: string): Promise<InstanceHealth> {
    // In a real implementation, this would ping the instance
    // For now, return a mock healthy status
    return {
      status: 'healthy',
      responseTime: Math.random() * 1000 + 200,
      errorRate: Math.random() * 0.05,
      lastHealthCheck: new Date()
    }
  }
}

export interface LoadBalancingStats {
  readonly totalModels: number
  readonly totalInstances: number
  readonly averageInstancesPerModel: number
  readonly unhealthyInstances: number
  readonly totalActiveRequests: number
}

export interface HealthCheckResult {
  readonly modelId: string
  readonly instanceId: string
  readonly health: InstanceHealth
  readonly error?: string
  readonly timestamp: Date
}
