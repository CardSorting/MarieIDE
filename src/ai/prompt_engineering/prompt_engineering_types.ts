/**
 * Core types for the Prompt Engineering System
 * Defines interfaces for prompt management, optimization, and analytics
 */

export interface Prompt {
  id: string
  name: string
  content: string
  version: number
  createdAt: Date
  updatedAt: Date
  tags: string[]
  category: PromptCategory
  metadata: PromptMetadata
}

export interface PromptMetadata {
  author: string
  description: string
  usageCount: number
  successRate: number
  averageResponseTime: number
  lastUsed: Date | null
  dependencies: string[]
  variables: PromptVariable[]
}

export interface PromptVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  defaultValue?: unknown
  description: string
}

export interface PromptTemplate {
  id: string
  name: string
  template: string
  variables: PromptVariable[]
  category: PromptCategory
  isSystemTemplate: boolean
}

export interface PromptOptimization {
  promptId: string
  optimizationType: OptimizationType
  parameters: Record<string, unknown>
  performanceMetrics: PerformanceMetrics
  appliedAt: Date
}

export interface PerformanceMetrics {
  responseTime: number
  successRate: number
  userSatisfaction: number
  tokenEfficiency: number
  contextRelevance: number
}

export interface PromptAnalytics {
  promptId: string
  usageCount: number
  successRate: number
  averageResponseTime: number
  errorRate: number
  userFeedback: UserFeedback[]
  performanceHistory: PerformanceMetrics[]
  lastAnalyzed: Date
}

export interface UserFeedback {
  userId: string
  rating: number // 1-5 scale
  comment?: string
  timestamp: Date
  context?: Record<string, unknown>
}

export interface ContextInjection {
  projectContext: ProjectContext
  userContext: UserContext
  sessionContext: SessionContext
  systemContext: SystemContext
}

export interface ProjectContext {
  projectName: string
  projectType: string
  technologies: string[]
  fileStructure: string[]
  recentChanges: string[]
  activeFiles: string[]
}

export interface UserContext {
  userId: string
  preferences: UserPreferences
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  workingStyle: string[]
  recentActions: string[]
}

export interface SessionContext {
  sessionId: string
  currentTask: string
  conversationHistory: ConversationEntry[]
  activeModels: string[]
  currentPhase: string
}

export interface SystemContext {
  availableModels: string[]
  systemResources: SystemResources
  currentTime: Date
  systemStatus: 'healthy' | 'degraded' | 'error'
}

export interface SystemResources {
  memoryUsage: number
  cpuUsage: number
  diskSpace: number
  networkStatus: 'online' | 'offline' | 'limited'
}

export interface UserPreferences {
  preferredModels: string[]
  responseStyle: 'concise' | 'detailed' | 'balanced'
  includeExamples: boolean
  technicalDepth: 'basic' | 'intermediate' | 'advanced'
  language: string
}

export interface ConversationEntry {
  id: string
  timestamp: Date
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown>
}

export interface PromptCache {
  promptId: string
  content: string
  variables: Record<string, unknown>
  context: ContextInjection
  cachedAt: Date
  expiresAt: Date
  hitCount: number
}

export interface PromptValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'syntax' | 'variable' | 'context' | 'dependency'
  message: string
  line?: number
  column?: number
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  type: 'performance' | 'best_practice' | 'optimization'
  message: string
  suggestion?: string
  impact: 'low' | 'medium' | 'high'
}

export type PromptCategory = 
  | 'code_generation'
  | 'code_review'
  | 'debugging'
  | 'documentation'
  | 'refactoring'
  | 'testing'
  | 'deployment'
  | 'analysis'
  | 'optimization'
  | 'conversation'
  | 'system'

export type OptimizationType = 
  | 'length_reduction'
  | 'clarity_improvement'
  | 'context_optimization'
  | 'variable_optimization'
  | 'template_optimization'
  | 'performance_optimization'

export interface PromptManagerConfig {
  cacheSize: number
  cacheTTL: number
  maxVersions: number
  enableAnalytics: boolean
  enableOptimization: boolean
  validationStrictness: 'loose' | 'moderate' | 'strict'
}

export interface PromptOptimizerConfig {
  enableABTesting: boolean
  optimizationThreshold: number
  learningRate: number
  maxOptimizationAttempts: number
  performanceWeight: number
  userSatisfactionWeight: number
}

export interface PromptAnalyticsConfig {
  enableTracking: boolean
  retentionDays: number
  enableUserFeedback: boolean
  enablePerformanceMonitoring: boolean
  aggregationInterval: number
}

export interface ContextInjectorConfig {
  enableProjectContext: boolean
  enableUserContext: boolean
  enableSessionContext: boolean
  enableSystemContext: boolean
  contextDepth: number
  maxContextSize: number
}

// Error types
export class PromptError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'PromptError'
  }
}

export class PromptValidationError extends PromptError {
  constructor(
    message: string,
    public readonly validationResult: PromptValidationResult,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', context)
    this.name = 'PromptValidationError'
  }
}

export class PromptOptimizationError extends PromptError {
  constructor(
    message: string,
    public readonly optimizationType: OptimizationType,
    context?: Record<string, unknown>
  ) {
    super(message, 'OPTIMIZATION_ERROR', context)
    this.name = 'PromptOptimizationError'
  }
}

export class PromptCacheError extends PromptError {
  constructor(
    message: string,
    public readonly cacheKey: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'CACHE_ERROR', context)
    this.name = 'PromptCacheError'
  }
}
