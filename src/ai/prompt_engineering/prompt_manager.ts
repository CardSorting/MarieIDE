/**
 * Prompt Manager - Core prompt management functionality
 * Handles prompt storage, retrieval, versioning, validation, and caching
 */

import {
  Prompt,
  PromptTemplate,
  PromptCache,
  PromptValidationResult,
  ValidationError,
  ValidationWarning,
  PromptManagerConfig,
  ContextInjection,
  PromptError,
  PromptValidationError,
  PromptCacheError
} from './prompt_engineering_types'

/**
 * Central prompt management system
 * Provides CRUD operations, versioning, validation, and caching for prompts
 */
export class PromptManager {
  private prompts: Map<string, Prompt> = new Map()
  private templates: Map<string, PromptTemplate> = new Map()
  private cache: Map<string, PromptCache> = new Map()
  private config: PromptManagerConfig
  private cacheHitCount = 0
  private cacheMissCount = 0

  constructor(config: Partial<PromptManagerConfig> = {}) {
    this.config = {
      cacheSize: config.cacheSize || 1000,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes
      maxVersions: config.maxVersions || 10,
      enableAnalytics: config.enableAnalytics ?? true,
      enableOptimization: config.enableOptimization ?? true,
      validationStrictness: config.validationStrictness || 'moderate'
    }
  }

  /**
   * Create a new prompt with validation
   */
  async createPrompt(
    name: string,
    content: string,
    category: string,
    author: string,
    description: string,
    variables: any[] = []
  ): Promise<Prompt> {
    try {
      // Validate input parameters
      this.validatePromptInputs(name, content, category, author)

      // Create prompt ID
      const id = this.generatePromptId(name, category)
      
      // Check for existing prompt with same name
      if (this.prompts.has(id)) {
        throw new PromptError(
          `Prompt with name '${name}' already exists. Use updatePrompt() to modify existing prompts.`,
          'DUPLICATE_PROMPT',
          { name, category }
        )
      }

      // Validate prompt content
      const validationResult = await this.validatePromptContent(content, variables)
      if (!validationResult.isValid) {
        throw new PromptValidationError(
          'Prompt validation failed. Fix validation errors before creating prompt.',
          validationResult,
          { name, category, content }
        )
      }

      // Create prompt object
      const prompt: Prompt = {
        id,
        name,
        content,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        category: category as any,
        metadata: {
          author,
          description,
          usageCount: 0,
          successRate: 0,
          averageResponseTime: 0,
          lastUsed: null,
          dependencies: [],
          variables
        }
      }

      // Store prompt
      this.prompts.set(id, prompt)
      
      return prompt
    } catch (error) {
      if (error instanceof PromptError || error instanceof PromptValidationError) {
        throw error
      }
      throw new PromptError(
        `Failed to create prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_ERROR',
        { name, category }
      )
    }
  }

  /**
   * Retrieve a prompt by ID with caching
   */
  async getPrompt(promptId: string, context?: ContextInjection): Promise<Prompt | null> {
    try {
      // Check cache first if context provided
      if (context) {
        const cacheKey = this.generateCacheKey(promptId, context)
        const cached = this.cache.get(cacheKey)
        
        if (cached && this.isCacheValid(cached)) {
          cached.hitCount++
          this.cacheHitCount++
          return this.prompts.get(promptId) || null
        }
        
        this.cacheMissCount++
      }

      // Get from storage
      const prompt = this.prompts.get(promptId)
      if (!prompt) {
        return null
      }

      // Cache if context provided
      if (context) {
        await this.cachePrompt(promptId, context)
      }

      return prompt
    } catch (error) {
      throw new PromptError(
        `Failed to retrieve prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RETRIEVE_ERROR',
        { promptId }
      )
    }
  }

  /**
   * Update an existing prompt with versioning
   */
  async updatePrompt(
    promptId: string,
    updates: Partial<Pick<Prompt, 'content' | 'name' | 'tags'>>,
    author: string
  ): Promise<Prompt> {
    try {
      const existingPrompt = this.prompts.get(promptId)
      if (!existingPrompt) {
        throw new PromptError(
          `Prompt with ID '${promptId}' not found. Create prompt first.`,
          'PROMPT_NOT_FOUND',
          { promptId }
        )
      }

      // Validate updates
      if (updates.content) {
        const validationResult = await this.validatePromptContent(
          updates.content, 
          existingPrompt.metadata.variables
        )
        if (!validationResult.isValid) {
          throw new PromptValidationError(
            'Updated prompt content validation failed.',
            validationResult,
            { promptId, updates }
          )
        }
      }

      // Create new version
      const updatedPrompt: Prompt = {
        ...existingPrompt,
        ...updates,
        version: existingPrompt.version + 1,
        updatedAt: new Date(),
        metadata: {
          ...existingPrompt.metadata,
          author,
          lastUsed: existingPrompt.metadata.lastUsed
        }
      }

      // Store updated prompt
      this.prompts.set(promptId, updatedPrompt)

      // Clear related cache entries
      this.clearPromptCache(promptId)

      return updatedPrompt
    } catch (error) {
      if (error instanceof PromptError || error instanceof PromptValidationError) {
        throw error
      }
      throw new PromptError(
        `Failed to update prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_ERROR',
        { promptId }
      )
    }
  }

  /**
   * Delete a prompt and its cache
   */
  async deletePrompt(promptId: string): Promise<boolean> {
    try {
      const prompt = this.prompts.get(promptId)
      if (!prompt) {
        return false
      }

      // Remove from storage
      this.prompts.delete(promptId)

      // Clear cache
      this.clearPromptCache(promptId)

      return true
    } catch (error) {
      throw new PromptError(
        `Failed to delete prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_ERROR',
        { promptId }
      )
    }
  }

  /**
   * List prompts with filtering and pagination
   */
  async listPrompts(
    filters: {
      category?: string
      tags?: string[]
      author?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<Prompt[]> {
    try {
      let prompts = Array.from(this.prompts.values())

      // Apply filters
      if (filters.category) {
        prompts = prompts.filter(p => p.category === filters.category)
      }

      if (filters.tags && filters.tags.length > 0) {
        prompts = prompts.filter(p => 
          filters.tags!.some(tag => p.tags.includes(tag))
        )
      }

      if (filters.author) {
        prompts = prompts.filter(p => p.metadata.author === filters.author)
      }

      // Apply pagination
      const offset = filters.offset || 0
      const limit = filters.limit || 50
      
      return prompts.slice(offset, offset + limit)
    } catch (error) {
      throw new PromptError(
        `Failed to list prompts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LIST_ERROR',
        { filters }
      )
    }
  }

  /**
   * Create a prompt template for reuse
   */
  async createTemplate(
    name: string,
    template: string,
    variables: any[],
    category: string,
    isSystemTemplate = false
  ): Promise<PromptTemplate> {
    try {
      this.validateTemplateInputs(name, template, variables)

      const id = this.generateTemplateId(name, category)
      
      if (this.templates.has(id)) {
        throw new PromptError(
          `Template with name '${name}' already exists.`,
          'DUPLICATE_TEMPLATE',
          { name, category }
        )
      }

      const templateObj: PromptTemplate = {
        id,
        name,
        template,
        variables,
        category: category as any,
        isSystemTemplate
      }

      this.templates.set(id, templateObj)
      return templateObj
    } catch (error) {
      if (error instanceof PromptError) {
        throw error
      }
      throw new PromptError(
        `Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_CREATE_ERROR',
        { name, category }
      )
    }
  }

  /**
   * Generate a prompt from a template with variable substitution
   */
  async generateFromTemplate(
    templateId: string,
    variables: Record<string, unknown>,
    context?: ContextInjection
  ): Promise<string> {
    try {
      const template = this.templates.get(templateId)
      if (!template) {
        throw new PromptError(
          `Template with ID '${templateId}' not found.`,
          'TEMPLATE_NOT_FOUND',
          { templateId }
        )
      }

      // Validate required variables
      const missingVars = template.variables
        .filter(v => v.required && !(v.name in variables))
        .map(v => v.name)

      if (missingVars.length > 0) {
        throw new PromptError(
          `Missing required template variables: ${missingVars.join(', ')}. Provide all required variables to generate prompt from template.`,
          'MISSING_VARIABLES',
          { templateId, missingVars }
        )
      }

      // Substitute variables
      let content = template.template
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`
        content = content.replace(new RegExp(placeholder, 'g'), String(value))
      }

      // Inject context if provided
      if (context) {
        content = await this.injectContext(content, context)
      }

      return content
    } catch (error) {
      if (error instanceof PromptError) {
        throw error
      }
      throw new PromptError(
        `Failed to generate from template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TEMPLATE_GENERATION_ERROR',
        { templateId }
      )
    }
  }

  /**
   * Validate prompt content and variables
   */
  private async validatePromptContent(
    content: string,
    variables: any[]
  ): Promise<PromptValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Basic content validation
    if (!content || content.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Prompt content cannot be empty.',
        severity: 'error'
      })
    }

    if (content.length > 10000) {
      warnings.push({
        type: 'performance',
        message: 'Prompt content is very long (>10k chars). Consider optimizing for better performance.',
        impact: 'medium'
      })
    }

    // Variable validation
    const contentVariables = this.extractVariablesFromContent(content)
    const declaredVariables = variables.map(v => v.name)

    // Check for undeclared variables
    const undeclaredVars = contentVariables.filter(v => !declaredVariables.includes(v))
    if (undeclaredVars.length > 0) {
      errors.push({
        type: 'variable',
        message: `Undeclared variables found in content: ${undeclaredVars.join(', ')}. Declare all variables in the variables array.`,
        severity: 'error'
      })
    }

    // Check for unused declared variables
    const unusedVars = declaredVariables.filter(v => !contentVariables.includes(v))
    if (unusedVars.length > 0) {
      warnings.push({
        type: 'best_practice',
        message: `Unused declared variables: ${unusedVars.join(', ')}. Remove unused variables to keep prompts clean.`,
        impact: 'low'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Extract variable names from prompt content
   */
  private extractVariablesFromContent(content: string): string[] {
    const variablePattern = /\{\{([^}]+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = variablePattern.exec(content)) !== null) {
      variables.push(match[1].trim())
    }

    return [...new Set(variables)] // Remove duplicates
  }

  /**
   * Cache a prompt with context
   */
  private async cachePrompt(promptId: string, context: ContextInjection): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(promptId, context)
      const expiresAt = new Date(Date.now() + this.config.cacheTTL)

      const cacheEntry: PromptCache = {
        promptId,
        content: '', // Will be populated when needed
        variables: {},
        context,
        cachedAt: new Date(),
        expiresAt,
        hitCount: 0
      }

      // Manage cache size
      if (this.cache.size >= this.config.cacheSize) {
        this.evictOldestCacheEntry()
      }

      this.cache.set(cacheKey, cacheEntry)
    } catch (error) {
      throw new PromptCacheError(
        `Failed to cache prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        promptId,
        { context }
      )
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(cacheEntry: PromptCache): boolean {
    return new Date() < cacheEntry.expiresAt
  }

  /**
   * Clear cache entries for a specific prompt
   */
  private clearPromptCache(promptId: string): void {
    const keysToDelete: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.promptId === promptId) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Evict the oldest cache entry
   */
  private evictOldestCacheEntry(): void {
    let oldestKey = ''
    let oldestTime = new Date()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.cachedAt < oldestTime) {
        oldestTime = entry.cachedAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Generate unique prompt ID
   */
  private generatePromptId(name: string, category: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const timestamp = Date.now().toString(36)
    return `${category}_${sanitized}_${timestamp}`
  }

  /**
   * Generate unique template ID
   */
  private generateTemplateId(name: string, category: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    return `template_${category}_${sanitized}`
  }

  /**
   * Generate cache key for prompt and context
   */
  private generateCacheKey(promptId: string, context: ContextInjection): string {
    const contextHash = JSON.stringify({
      project: context.projectContext?.projectName,
      user: context.userContext?.userId,
      session: context.sessionContext?.sessionId
    })
    return `${promptId}_${Buffer.from(contextHash).toString('base64').slice(0, 16)}`
  }

  /**
   * Inject context into prompt content
   */
  private async injectContext(content: string, context: ContextInjection): Promise<string> {
    // This is a simplified implementation
    // In a real system, this would be more sophisticated
    let injected = content

    if (context.projectContext) {
      injected = injected.replace(/\{\{PROJECT_NAME\}\}/g, context.projectContext.projectName)
      injected = injected.replace(/\{\{PROJECT_TYPE\}\}/g, context.projectContext.projectType)
    }

    if (context.userContext) {
      injected = injected.replace(/\{\{USER_ID\}\}/g, context.userContext.userId)
      injected = injected.replace(/\{\{SKILL_LEVEL\}\}/g, context.userContext.skillLevel)
    }

    return injected
  }

  /**
   * Validate prompt input parameters
   */
  private validatePromptInputs(
    name: string,
    content: string,
    category: string,
    author: string
  ): void {
    if (!name || name.trim().length === 0) {
      throw new PromptError(
        'Prompt name is required. Provide a descriptive name for the prompt.',
        'INVALID_NAME',
        { name }
      )
    }

    if (!content || content.trim().length === 0) {
      throw new PromptError(
        'Prompt content is required. Provide the actual prompt content.',
        'INVALID_CONTENT',
        { name }
      )
    }

    if (!category || category.trim().length === 0) {
      throw new PromptError(
        'Prompt category is required. Choose from: code_generation, code_review, debugging, documentation, refactoring, testing, deployment, analysis, optimization, conversation, system.',
        'INVALID_CATEGORY',
        { name, category }
      )
    }

    if (!author || author.trim().length === 0) {
      throw new PromptError(
        'Author is required. Provide the author name for prompt attribution.',
        'INVALID_AUTHOR',
        { name }
      )
    }
  }

  /**
   * Validate template input parameters
   */
  private validateTemplateInputs(
    name: string,
    template: string,
    variables: any[]
  ): void {
    this.validatePromptInputs(name, template, 'template', 'system')

    if (!Array.isArray(variables)) {
      throw new PromptError(
        'Variables must be an array. Provide variables as an array of variable definitions.',
        'INVALID_VARIABLES',
        { name }
      )
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    hitCount: number
    missCount: number
    hitRate: number
  } {
    const totalRequests = this.cacheHitCount + this.cacheMissCount
    return {
      size: this.cache.size,
      hitCount: this.cacheHitCount,
      missCount: this.cacheMissCount,
      hitRate: totalRequests > 0 ? this.cacheHitCount / totalRequests : 0
    }
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheHitCount = 0
    this.cacheMissCount = 0
  }

  /**
   * Get prompt count by category
   */
  getPromptCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = {}
    
    for (const prompt of this.prompts.values()) {
      counts[prompt.category] = (counts[prompt.category] || 0) + 1
    }

    return counts
  }

  /**
   * Get system statistics
   */
  getSystemStats(): {
    totalPrompts: number
    totalTemplates: number
    cacheStats: ReturnType<typeof this.getCacheStats>
    categoryCounts: Record<string, number>
  } {
    return {
      totalPrompts: this.prompts.size,
      totalTemplates: this.templates.size,
      cacheStats: this.getCacheStats(),
      categoryCounts: this.getPromptCountByCategory()
    }
  }
}
