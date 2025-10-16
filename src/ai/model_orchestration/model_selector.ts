/**
 * Model Selector
 * 
 * Intelligent model selection based on task requirements, performance metrics,
 * and cost optimization. This is the brain of our AI-first model orchestration.
 */

import { AIModel, ModelSelectionCriteria, TaskType, SelectionStrategy } from './ai_model_types'
import { ModelMetrics } from './model_performance_monitor'

export interface ModelSelectionOptions {
  readonly criteria: ModelSelectionCriteria
  readonly availableModels: AIModel[]
  readonly performanceMetrics: ModelMetrics[]
}

export interface ModelSelectionResult {
  readonly selectedModel: AIModel
  readonly confidence: number
  readonly reasoning: string
  readonly alternativeModels: AIModel[]
}

export class ModelSelector {
  private readonly strategy: SelectionStrategy
  private readonly taskTypePreferences: Map<TaskType, string[]>
  private readonly performanceWeights: PerformanceWeights

  constructor(strategy: SelectionStrategy) {
    this.strategy = strategy
    this.taskTypePreferences = this.initializeTaskPreferences()
    this.performanceWeights = this.initializePerformanceWeights()
  }

  /**
   * Initialize task type to model preferences
   */
  private initializeTaskPreferences(): Map<TaskType, string[]> {
    const preferences = new Map<TaskType, string[]>()

    // Code generation tasks prefer models with strong code capabilities
    preferences.set(TaskType.CODE_GENERATION, [
      'gpt-4', 'claude-3', 'gpt-4-turbo', 'claude-3-sonnet'
    ])

    // Code analysis tasks prefer models with good reasoning
    preferences.set(TaskType.CODE_ANALYSIS, [
      'gpt-4', 'claude-3', 'gpt-4-turbo', 'claude-3-opus'
    ])

    // Natural language tasks can use any capable model
    preferences.set(TaskType.NATURAL_LANGUAGE, [
      'gpt-4', 'claude-3', 'gpt-3.5-turbo', 'claude-3-haiku'
    ])

    // Visual processing tasks require vision capabilities
    preferences.set(TaskType.VISUAL_PROCESSING, [
      'gpt-4-vision', 'claude-3-vision', 'gemini-pro-vision'
    ])

    // Context understanding tasks prefer large context windows
    preferences.set(TaskType.CONTEXT_UNDERSTANDING, [
      'gpt-4-turbo', 'claude-3-opus', 'gpt-4'
    ])

    // Documentation tasks prefer models with good explanation capabilities
    preferences.set(TaskType.DOCUMENTATION, [
      'claude-3', 'gpt-4', 'claude-3-sonnet'
    ])

    return preferences
  }

  /**
   * Initialize performance weights for different strategies
   */
  private initializePerformanceWeights(): PerformanceWeights {
    switch (this.strategy) {
      case SelectionStrategy.PERFORMANCE_FIRST:
        return {
          accuracy: 0.4,
          responseTime: 0.3,
          reliability: 0.2,
          cost: 0.1
        }
      
      case SelectionStrategy.COST_OPTIMIZED:
        return {
          cost: 0.5,
          accuracy: 0.2,
          responseTime: 0.2,
          reliability: 0.1
        }
      
      case SelectionStrategy.CAPABILITY_MATCHED:
        return {
          capabilityMatch: 0.6,
          accuracy: 0.2,
          responseTime: 0.1,
          reliability: 0.1
        }
      
      case SelectionStrategy.HYBRID:
        return {
          accuracy: 0.25,
          responseTime: 0.25,
          reliability: 0.25,
          cost: 0.25
        }
      
      default:
        return {
          accuracy: 0.3,
          responseTime: 0.3,
          reliability: 0.2,
          cost: 0.2
        }
    }
  }

  /**
   * Select the optimal model for given criteria
   */
  public async selectModel(options: ModelSelectionOptions): Promise<AIModel | null> {
    const { criteria, availableModels, performanceMetrics } = options

    // Filter models by basic requirements
    const suitableModels = this.filterSuitableModels(availableModels, criteria)
    
    if (suitableModels.length === 0) {
      return null
    }

    // If only one suitable model, return it
    if (suitableModels.length === 1) {
      return suitableModels[0]
    }

    // Score all suitable models
    const scoredModels = await this.scoreModels(suitableModels, criteria, performanceMetrics)
    
    // Sort by score and return the best one
    scoredModels.sort((a, b) => b.score - a.score)
    
    return scoredModels[0].model
  }

  /**
   * Check if a model is suitable for given criteria
   */
  public isModelSuitable(model: AIModel, criteria: ModelSelectionCriteria): boolean {
    // Check if model has required capabilities
    if (!this.hasRequiredCapabilities(model, criteria.requiredCapabilities)) {
      return false
    }

    // Check context window requirements
    if (model.contextWindow < criteria.contextSize) {
      return false
    }

    // Check performance requirements
    if (model.responseTimeMs > criteria.performanceRequirements.maxResponseTimeMs) {
      return false
    }

    // Check cost constraints
    if (model.costPerToken > criteria.costConstraints.maxCostPerRequest / 1000) {
      return false
    }

    return true
  }

  /**
   * Filter models that meet basic suitability criteria
   */
  private filterSuitableModels(models: AIModel[], criteria: ModelSelectionCriteria): AIModel[] {
    return models.filter(model => this.isModelSuitable(model, criteria))
  }

  /**
   * Check if model has required capabilities
   */
  private hasRequiredCapabilities(model: AIModel, required: any): boolean {
    const capabilities = model.capabilities

    if (required.codeGeneration && !capabilities.codeGeneration) return false
    if (required.codeAnalysis && !capabilities.codeAnalysis) return false
    if (required.naturalLanguage && !capabilities.naturalLanguage) return false
    if (required.visualProcessing && !capabilities.visualProcessing) return false
    if (required.contextUnderstanding && !capabilities.contextUnderstanding) return false
    if (required.reasoning && !capabilities.reasoning) return false

    return true
  }

  /**
   * Score models based on selection criteria and performance
   */
  private async scoreModels(
    models: AIModel[],
    criteria: ModelSelectionCriteria,
    performanceMetrics: ModelMetrics[]
  ): Promise<ScoredModel[]> {
    const scoredModels: ScoredModel[] = []

    for (const model of models) {
      const score = await this.calculateModelScore(model, criteria, performanceMetrics)
      scoredModels.push({ model, score })
    }

    return scoredModels
  }

  /**
   * Calculate comprehensive score for a model
   */
  private async calculateModelScore(
    model: AIModel,
    criteria: ModelSelectionCriteria,
    performanceMetrics: ModelMetrics[]
  ): Promise<number> {
    const weights = this.performanceWeights
    let totalScore = 0

    // Capability match score
    if (weights.capabilityMatch) {
      const capabilityScore = this.calculateCapabilityScore(model, criteria)
      totalScore += capabilityScore * weights.capabilityMatch
    }

    // Accuracy score based on performance metrics
    const accuracyScore = this.calculateAccuracyScore(model, performanceMetrics)
    totalScore += accuracyScore * weights.accuracy

    // Response time score
    const responseTimeScore = this.calculateResponseTimeScore(model, criteria)
    totalScore += responseTimeScore * weights.responseTime

    // Reliability score
    const reliabilityScore = this.calculateReliabilityScore(model, performanceMetrics)
    totalScore += reliabilityScore * weights.reliability

    // Cost score
    const costScore = this.calculateCostScore(model, criteria)
    totalScore += costScore * weights.cost

    // Task type preference bonus
    const preferenceBonus = this.calculatePreferenceBonus(model, criteria.taskType)
    totalScore += preferenceBonus * 0.1

    return Math.max(0, Math.min(1, totalScore))
  }

  /**
   * Calculate capability match score
   */
  private calculateCapabilityScore(model: AIModel, criteria: ModelSelectionCriteria): number {
    const required = criteria.requiredCapabilities
    const modelCapabilities = model.capabilities
    
    let score = 0
    let totalChecks = 0

    if (required.codeGeneration) {
      totalChecks++
      if (modelCapabilities.codeGeneration) score += 1
    }

    if (required.codeAnalysis) {
      totalChecks++
      if (modelCapabilities.codeAnalysis) score += 1
    }

    if (required.naturalLanguage) {
      totalChecks++
      if (modelCapabilities.naturalLanguage) score += 1
    }

    if (required.visualProcessing) {
      totalChecks++
      if (modelCapabilities.visualProcessing) score += 1
    }

    if (required.contextUnderstanding) {
      totalChecks++
      if (modelCapabilities.contextUnderstanding) score += 1
    }

    if (required.reasoning) {
      totalChecks++
      if (modelCapabilities.reasoning) score += 1
    }

    return totalChecks > 0 ? score / totalChecks : 1
  }

  /**
   * Calculate accuracy score from performance metrics
   */
  private calculateAccuracyScore(model: AIModel, performanceMetrics: ModelMetrics[]): number {
    const metrics = performanceMetrics.find(m => m.modelId === model.id)
    
    if (!metrics || metrics.totalRequests === 0) {
      return 0.8 // Default score for new models
    }

    // Use success rate as accuracy proxy
    return metrics.successfulRequests / metrics.totalRequests
  }

  /**
   * Calculate response time score
   */
  private calculateResponseTimeScore(model: AIModel, criteria: ModelSelectionCriteria): number {
    const maxAllowed = criteria.performanceRequirements.maxResponseTimeMs
    const modelTime = model.responseTimeMs

    // Score inversely proportional to response time
    return Math.max(0, 1 - (modelTime / maxAllowed))
  }

  /**
   * Calculate reliability score from performance metrics
   */
  private calculateReliabilityScore(model: AIModel, performanceMetrics: ModelMetrics[]): number {
    const metrics = performanceMetrics.find(m => m.modelId === model.id)
    
    if (!metrics) {
      return 0.9 // Default reliability for new models
    }

    // Use health score as reliability measure
    return metrics.healthScore
  }

  /**
   * Calculate cost score
   */
  private calculateCostScore(model: AIModel, criteria: ModelSelectionCriteria): number {
    const maxCost = criteria.costConstraints.maxCostPerRequest
    const modelCost = model.costPerToken * 1000 // Convert to per-request cost estimate

    // Score inversely proportional to cost
    return Math.max(0, 1 - (modelCost / maxCost))
  }

  /**
   * Calculate task type preference bonus
   */
  private calculatePreferenceBonus(model: AIModel, taskType: TaskType): number {
    const preferredModels = this.taskTypePreferences.get(taskType) || []
    
    if (preferredModels.includes(model.id)) {
      return 0.2 // 20% bonus for preferred models
    }

    return 0
  }

  /**
   * Get alternative models for a given selection
   */
  public getAlternativeModels(
    primaryModel: AIModel,
    availableModels: AIModel[],
    criteria: ModelSelectionCriteria
  ): AIModel[] {
    const suitableModels = this.filterSuitableModels(availableModels, criteria)
    return suitableModels.filter(model => model.id !== primaryModel.id)
  }
}

export interface ScoredModel {
  readonly model: AIModel
  readonly score: number
}

export interface PerformanceWeights {
  readonly accuracy?: number
  readonly responseTime?: number
  readonly reliability?: number
  readonly cost?: number
  readonly capabilityMatch?: number
}
