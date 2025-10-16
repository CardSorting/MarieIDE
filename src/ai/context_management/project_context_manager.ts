/**
 * Project Context Manager
 * 
 * Manages project context and provides intelligent codebase analysis
 * for the AI-first development environment.
 */

import { EventEmitter } from 'events'
import { 
  ProjectContext, 
  ProjectType, 
  FileType,
  ArchitectureType,
  ProjectStructure,
  FileInfo,
  DirectoryInfo 
} from './context_types'

export class ProjectContextManager extends EventEmitter {
  private readonly contexts: Map<string, ProjectContext> = new Map()
  private readonly analysisCache: Map<string, any> = new Map()

  constructor() {
    super()
  }

  /**
   * Analyze a project and create context
   */
  public async analyzeProject(projectPath: string): Promise<ProjectContext> {
    try {
      // Check cache first
      const cached = this.analysisCache.get(projectPath)
      if (cached && this.isCacheValid(cached)) {
        return cached
      }

      this.emit('analysis_started', { projectPath })

      // Analyze project structure
      const structure = await this.analyzeProjectStructure(projectPath)
      
      // Detect project type
      const projectType = this.detectProjectType(structure)
      
      // Detect language and framework
      const { language, framework } = this.detectLanguageAndFramework(structure)
      
      // Analyze dependencies
      const dependencies = await this.analyzeDependencies(projectPath)
      
      // Analyze configuration
      const configuration = await this.analyzeConfiguration(projectPath)
      
      // Create project context
      const context: ProjectContext = {
        id: this.generateProjectId(projectPath),
        name: this.extractProjectName(projectPath),
        rootPath: projectPath,
        type: projectType,
        language,
        framework,
        structure,
        dependencies,
        configuration,
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          authors: [],
          description: '',
          tags: [],
          repository: undefined,
          documentation: undefined
        },
        lastAnalyzed: new Date()
      }

      // Cache the result
      this.contexts.set(context.id, context)
      this.analysisCache.set(projectPath, context)
      
      this.emit('analysis_completed', { context })
      
      return context
      
    } catch (error) {
      this.emit('analysis_failed', { projectPath, error })
      throw error
    }
  }

  /**
   * Get project context by ID
   */
  public getProjectContext(projectId: string): ProjectContext | null {
    return this.contexts.get(projectId) || null
  }

  /**
   * Analyze project structure
   */
  private async analyzeProjectStructure(projectPath: string): Promise<ProjectStructure> {
    // Mock implementation - in real version would use fs operations
    const files: FileInfo[] = []
    const directories: DirectoryInfo[] = []
    
    // Simulate file analysis
    const mockFiles = [
      'package.json',
      'src/main.ts',
      'src/renderer/index.tsx',
      'src/ai/model_orchestration/model_orchestrator.ts',
      'README.md',
      'tsconfig.json'
    ]

    for (const filePath of mockFiles) {
      const file: FileInfo = {
        path: `${projectPath}/${filePath}`,
        name: filePath.split('/').pop() || filePath,
        type: this.detectFileType(filePath),
        size: Math.floor(Math.random() * 10000),
        language: this.detectLanguage(filePath),
        lastModified: new Date(),
        contentHash: this.generateContentHash(filePath),
        complexity: {
          cyclomaticComplexity: Math.floor(Math.random() * 10),
          cognitiveComplexity: Math.floor(Math.random() * 15),
          linesOfCode: Math.floor(Math.random() * 500),
          maintainabilityIndex: Math.random() * 100,
          technicalDebt: Math.floor(Math.random() * 1000)
        },
        purpose: this.detectFilePurpose(filePath),
        dependencies: [],
        exports: [],
        imports: []
      }
      files.push(file)
    }

    const structure: ProjectStructure = {
      files,
      directories,
      relationships: [],
      architecture: {
        type: ArchitectureType.MODULAR,
        layers: [],
        components: [],
        dataFlow: [],
        patterns: []
      },
      patterns: []
    }

    return structure
  }

  /**
   * Detect project type based on structure
   */
  private detectProjectType(structure: ProjectStructure): ProjectType {
    const packageJsonFile = structure.files.find(f => f.name === 'package.json')
    if (packageJsonFile) {
      return ProjectType.WEB_APPLICATION
    }
    
    // Add more detection logic based on file patterns
    return ProjectType.UNKNOWN
  }

  /**
   * Detect language and framework
   */
  private detectLanguageAndFramework(structure: ProjectStructure): { language: string, framework?: string } {
    const tsFiles = structure.files.filter(f => f.language === 'typescript')
    const jsFiles = structure.files.filter(f => f.language === 'javascript')
    const reactFiles = structure.files.filter(f => f.name.includes('react'))
    
    if (tsFiles.length > 0) {
      return { language: 'typescript', framework: reactFiles.length > 0 ? 'react' : undefined }
    }
    
    if (jsFiles.length > 0) {
      return { language: 'javascript', framework: reactFiles.length > 0 ? 'react' : undefined }
    }
    
    return { language: 'unknown' }
  }

  /**
   * Analyze project dependencies
   */
  private async analyzeDependencies(projectPath: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        name: 'react',
        version: '^18.2.0',
        type: 'runtime',
        purpose: 'UI library',
        files: [],
        usage: []
      },
      {
        name: 'typescript',
        version: '^5.3.2',
        type: 'development',
        purpose: 'Type checking',
        files: [],
        usage: []
      }
    ]
  }

  /**
   * Analyze project configuration
   */
  private async analyzeConfiguration(projectPath: string): Promise<any> {
    // Mock implementation
    return {
      buildSystem: {
        type: 'webpack',
        configFile: 'webpack.config.js',
        commands: [],
        dependencies: []
      },
      packageManager: {
        type: 'npm',
        lockFile: 'package-lock.json',
        dependencies: [],
        scripts: []
      },
      linting: {
        enabled: true,
        tools: ['eslint'],
        configFiles: ['.eslintrc.js'],
        rules: {}
      },
      testing: {
        enabled: true,
        frameworks: ['jest'],
        configFiles: ['jest.config.js'],
        coverage: {
          threshold: 80,
          reports: [],
          exclude: []
        }
      },
      deployment: {
        platform: 'unknown',
        configFiles: [],
        environment: 'development'
      },
      environment: {
        nodeVersion: '18.0.0',
        environmentVariables: {},
        secrets: []
      }
    }
  }

  /**
   * Detect file type based on path
   */
  private detectFileType(filePath: string): FileType {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      return FileType.TEST
    }
    
    if (filePath.includes('.config.') || filePath.includes('tsconfig') || filePath.includes('webpack')) {
      return FileType.CONFIGURATION
    }
    
    if (filePath.includes('README') || filePath.includes('.md')) {
      return FileType.DOCUMENTATION
    }
    
    if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      return FileType.SOURCE_CODE
    }
    
    return FileType.UNKNOWN
  }

  /**
   * Detect language based on file extension
   */
  private detectLanguage(filePath: string): string {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      return 'typescript'
    }
    
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      return 'javascript'
    }
    
    if (filePath.endsWith('.json')) {
      return 'json'
    }
    
    if (filePath.endsWith('.md')) {
      return 'markdown'
    }
    
    return 'unknown'
  }

  /**
   * Detect file purpose
   */
  private detectFilePurpose(filePath: string): any {
    if (filePath.includes('main')) {
      return 'main_entry'
    }
    
    if (filePath.includes('test') || filePath.includes('spec')) {
      return 'test'
    }
    
    if (filePath.includes('config')) {
      return 'configuration'
    }
    
    if (filePath.includes('README') || filePath.includes('.md')) {
      return 'documentation'
    }
    
    return 'component'
  }

  /**
   * Generate content hash for file
   */
  private generateContentHash(filePath: string): string {
    // Mock hash generation
    return `hash_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(projectPath: string): string {
    return `project_${projectPath.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
  }

  /**
   * Extract project name from path
   */
  private extractProjectName(projectPath: string): string {
    return projectPath.split('/').pop() || 'Untitled Project'
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(cached: any): boolean {
    const maxAge = 5 * 60 * 1000 // 5 minutes
    return Date.now() - cached.lastAnalyzed.getTime() < maxAge
  }

  /**
   * Update project context
   */
  public async updateProjectContext(projectId: string, updates: Partial<ProjectContext>): Promise<ProjectContext> {
    const context = this.contexts.get(projectId)
    if (!context) {
      throw new Error(`Project context not found: ${projectId}`)
    }

    const updatedContext = {
      ...context,
      ...updates,
      lastAnalyzed: new Date()
    }

    this.contexts.set(projectId, updatedContext)
    this.emit('context_updated', { projectId, context: updatedContext })
    
    return updatedContext
  }

  /**
   * Get all project contexts
   */
  public getAllContexts(): ProjectContext[] {
    return Array.from(this.contexts.values())
  }

  /**
   * Clear project context
   */
  public clearProjectContext(projectId: string): void {
    this.contexts.delete(projectId)
    this.emit('context_cleared', { projectId })
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.contexts.clear()
    this.analysisCache.clear()
    this.removeAllListeners()
  }
}
