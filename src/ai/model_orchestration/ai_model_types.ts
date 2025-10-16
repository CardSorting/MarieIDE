/**
 * AI Model Types and Interfaces
 * 
 * Defines the core types for multi-model AI orchestration in MarieIDE.
 * This is the foundation of our AI-first development environment.
 */

export interface AIModel {
  readonly id: string
  readonly name: string
  readonly provider: AIProvider
  readonly type: ModelType
  readonly capabilities: ModelCapabilities
  readonly contextWindow: number
  readonly costPerToken: number
  readonly responseTimeMs: number
}

export interface ModelCapabilities {
  readonly codeGeneration: boolean
  readonly codeAnalysis: boolean
  readonly naturalLanguage: boolean
  readonly visualProcessing: boolean
  readonly contextUnderstanding: boolean
  readonly reasoning: boolean
}

export interface AIProvider {
  readonly id: string
  readonly name: string
  readonly type: ProviderType
  readonly apiEndpoint: string
  readonly authentication: AuthenticationConfig
  readonly rateLimits: RateLimitConfig
}

export interface AuthenticationConfig {
  readonly type: 'api_key' | 'oauth' | 'none'
  readonly apiKey?: string
  readonly clientId?: string
  readonly clientSecret?: string
}

export interface RateLimitConfig {
  readonly requestsPerMinute: number
  readonly tokensPerMinute: number
  readonly requestsPerDay: number
}

export interface ModelResponse {
  readonly content: string
  readonly modelId: string
  readonly responseTimeMs: number
  readonly tokensUsed: number
  readonly confidence: number
  readonly metadata: ResponseMetadata
}

export interface ResponseMetadata {
  readonly finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls'
  readonly usage: TokenUsage
  readonly modelVersion: string
  readonly timestamp: Date
}

export interface TokenUsage {
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
}

export interface ModelSelectionCriteria {
  readonly taskType: TaskType
  readonly contextSize: number
  readonly requiredCapabilities: ModelCapabilities
  readonly performanceRequirements: PerformanceRequirements
  readonly costConstraints: CostConstraints
}

export interface PerformanceRequirements {
  readonly maxResponseTimeMs: number
  readonly minAccuracy: number
  readonly reliability: number
}

export interface CostConstraints {
  readonly maxCostPerRequest: number
  readonly budgetLimit: number
}

export interface ModelOrchestrationConfig {
  readonly primaryModels: AIModel[]
  readonly fallbackModels: AIModel[]
  readonly selectionStrategy: SelectionStrategy
  readonly loadBalancing: LoadBalancingConfig
  readonly caching: CachingConfig
}

export interface LoadBalancingConfig {
  readonly strategy: 'round_robin' | 'weighted' | 'performance_based'
  readonly weights?: Record<string, number>
  readonly healthCheckInterval: number
}

export interface CachingConfig {
  readonly enabled: boolean
  readonly ttl: number
  readonly maxSize: number
  readonly compressionEnabled: boolean
}

export enum ProviderType {
  CLOUD = 'cloud',
  LOCAL = 'local',
  HYBRID = 'hybrid'
}

export enum ModelType {
  TEXT_GENERATION = 'text_generation',
  CODE_GENERATION = 'code_generation',
  EMBEDDING = 'embedding',
  VISION = 'vision',
  MULTIMODAL = 'multimodal'
}

export enum TaskType {
  CODE_GENERATION = 'code_generation',
  CODE_ANALYSIS = 'code_analysis',
  NATURAL_LANGUAGE = 'natural_language',
  VISUAL_PROCESSING = 'visual_processing',
  CONTEXT_UNDERSTANDING = 'context_understanding',
  REASONING = 'reasoning',
  DOCUMENTATION = 'documentation',
  TESTING = 'testing',
  DEBUGGING = 'debugging',
  REFACTORING = 'refactoring'
}

export enum SelectionStrategy {
  PERFORMANCE_FIRST = 'performance_first',
  COST_OPTIMIZED = 'cost_optimized',
  CAPABILITY_MATCHED = 'capability_matched',
  HYBRID = 'hybrid'
}

export enum ModelStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  ERROR = 'error',
  OFFLINE = 'offline',
  RATE_LIMITED = 'rate_limited'
}
