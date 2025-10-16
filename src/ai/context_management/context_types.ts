/**
 * Context Management Types
 * 
 * Defines the core types for intelligent context management in MarieIDE.
 * This enables the AI to understand and maintain project context effectively.
 */

export interface ProjectContext {
  readonly id: string
  readonly name: string
  readonly rootPath: string
  readonly type: ProjectType
  readonly language: string
  readonly framework?: string
  readonly structure: ProjectStructure
  readonly dependencies: DependencyInfo[]
  readonly configuration: ProjectConfiguration
  readonly metadata: ProjectMetadata
  readonly lastAnalyzed: Date
}

export interface ProjectStructure {
  readonly files: FileInfo[]
  readonly directories: DirectoryInfo[]
  readonly relationships: FileRelationship[]
  readonly architecture: ArchitectureInfo
  readonly patterns: CodePattern[]
}

export interface FileInfo {
  readonly path: string
  readonly name: string
  readonly type: FileType
  readonly size: number
  readonly language: string
  readonly lastModified: Date
  readonly contentHash: string
  readonly complexity: ComplexityMetrics
  readonly purpose: FilePurpose
  readonly dependencies: string[]
  readonly exports: ExportInfo[]
  readonly imports: ImportInfo[]
}

export interface DirectoryInfo {
  readonly path: string
  readonly name: string
  readonly type: DirectoryType
  readonly files: string[]
  readonly subdirectories: string[]
  readonly purpose: DirectoryPurpose
}

export interface FileRelationship {
  readonly source: string
  readonly target: string
  readonly type: RelationshipType
  readonly strength: number
  readonly description: string
}

export interface ArchitectureInfo {
  readonly type: ArchitectureType
  readonly layers: LayerInfo[]
  readonly components: ComponentInfo[]
  readonly dataFlow: DataFlowInfo[]
  readonly patterns: ArchitecturePattern[]
}

export interface LayerInfo {
  readonly name: string
  readonly type: LayerType
  readonly files: string[]
  readonly responsibilities: string[]
  readonly dependencies: string[]
}

export interface ComponentInfo {
  readonly name: string
  readonly type: ComponentType
  readonly file: string
  readonly exports: string[]
  readonly imports: string[]
  readonly dependencies: string[]
  readonly interfaces: InterfaceInfo[]
}

export interface DataFlowInfo {
  readonly source: string
  readonly target: string
  readonly dataType: string
  readonly flowType: DataFlowType
  readonly transformation?: string
}

export interface CodePattern {
  readonly type: PatternType
  readonly name: string
  readonly files: string[]
  readonly confidence: number
  readonly description: string
  readonly examples: string[]
}

export interface DependencyInfo {
  readonly name: string
  readonly version: string
  readonly type: DependencyType
  readonly purpose: string
  readonly files: string[]
  readonly usage: UsageInfo[]
}

export interface UsageInfo {
  readonly file: string
  readonly line: number
  readonly context: string
  readonly frequency: number
}

export interface ExportInfo {
  readonly name: string
  readonly type: ExportType
  readonly signature: string
  readonly description?: string
  readonly line: number
}

export interface ImportInfo {
  readonly name: string
  readonly source: string
  readonly type: ImportType
  readonly line: number
  readonly usage: string[]
}

export interface InterfaceInfo {
  readonly name: string
  readonly methods: MethodInfo[]
  readonly properties: PropertyInfo[]
  readonly extends?: string[]
  readonly implements?: string[]
}

export interface MethodInfo {
  readonly name: string
  readonly signature: string
  readonly parameters: ParameterInfo[]
  readonly returnType: string
  readonly visibility: Visibility
  readonly description?: string
}

export interface PropertyInfo {
  readonly name: string
  readonly type: string
  readonly visibility: Visibility
  readonly readonly: boolean
  readonly optional: boolean
  readonly description?: string
}

export interface ParameterInfo {
  readonly name: string
  readonly type: string
  readonly optional: boolean
  readonly defaultValue?: string
  readonly description?: string
}

export interface ComplexityMetrics {
  readonly cyclomaticComplexity: number
  readonly cognitiveComplexity: number
  readonly linesOfCode: number
  readonly maintainabilityIndex: number
  readonly technicalDebt: number
}

export interface ProjectConfiguration {
  readonly buildSystem: BuildSystemInfo
  readonly packageManager: PackageManagerInfo
  readonly linting: LintingConfig
  readonly testing: TestingConfig
  readonly deployment: DeploymentConfig
  readonly environment: EnvironmentConfig
}

export interface BuildSystemInfo {
  readonly type: BuildSystemType
  readonly configFile: string
  readonly commands: BuildCommand[]
  readonly dependencies: string[]
}

export interface PackageManagerInfo {
  readonly type: PackageManagerType
  readonly lockFile: string
  readonly dependencies: DependencyInfo[]
  readonly scripts: ScriptInfo[]
}

export interface LintingConfig {
  readonly enabled: boolean
  readonly tools: string[]
  readonly configFiles: string[]
  readonly rules: LintingRules
}

export interface TestingConfig {
  readonly enabled: boolean
  readonly frameworks: string[]
  readonly configFiles: string[]
  readonly coverage: CoverageConfig
}

export interface DeploymentConfig {
  readonly platform: DeploymentPlatform
  readonly configFiles: string[]
  readonly environment: string
}

export interface EnvironmentConfig {
  readonly nodeVersion: string
  readonly environmentVariables: Record<string, string>
  readonly secrets: string[]
}

export interface BuildCommand {
  readonly name: string
  readonly command: string
  readonly description: string
}

export interface ScriptInfo {
  readonly name: string
  readonly command: string
  readonly description: string
  readonly category: ScriptCategory
}

export interface LintingRules {
  readonly rules: Record<string, any>
  readonly overrides: Record<string, any>
}

export interface CoverageConfig {
  readonly threshold: number
  readonly reports: string[]
  readonly exclude: string[]
}

export interface ProjectMetadata {
  readonly createdAt: Date
  readonly lastModified: Date
  readonly authors: string[]
  readonly description: string
  readonly tags: string[]
  readonly repository?: RepositoryInfo
  readonly documentation?: DocumentationInfo
}

export interface RepositoryInfo {
  readonly url: string
  readonly branch: string
  readonly remote: string
}

export interface DocumentationInfo {
  readonly readme: string
  readonly docs: string[]
  readonly apiDocs: string[]
}

// Enums
export enum ProjectType {
  WEB_APPLICATION = 'web_application',
  MOBILE_APPLICATION = 'mobile_application',
  DESKTOP_APPLICATION = 'desktop_application',
  LIBRARY = 'library',
  API_SERVER = 'api_server',
  MICROSERVICE = 'microservice',
  MONOLITH = 'monolith',
  UNKNOWN = 'unknown'
}

export enum FileType {
  SOURCE_CODE = 'source_code',
  CONFIGURATION = 'configuration',
  DOCUMENTATION = 'documentation',
  TEST = 'test',
  ASSET = 'asset',
  BUILD = 'build',
  UNKNOWN = 'unknown'
}

export enum DirectoryType {
  SOURCE = 'source',
  TEST = 'test',
  ASSETS = 'assets',
  CONFIG = 'config',
  DOCS = 'docs',
  BUILD = 'build',
  DIST = 'dist',
  NODE_MODULES = 'node_modules',
  UNKNOWN = 'unknown'
}

export enum RelationshipType {
  IMPORTS = 'imports',
  EXTENDS = 'extends',
  IMPLEMENTS = 'implements',
  USES = 'uses',
  DEPENDS_ON = 'depends_on',
  CALLS = 'calls',
  INSTANTIATES = 'instantiates',
  REFERENCES = 'references'
}

export enum ArchitectureType {
  MONOLITHIC = 'monolithic',
  MICROSERVICES = 'microservices',
  LAYERED = 'layered',
  MODULAR = 'modular',
  COMPONENT_BASED = 'component_based',
  EVENT_DRIVEN = 'event_driven',
  CLEAN_ARCHITECTURE = 'clean_architecture',
  HEXAGONAL = 'hexagonal',
  UNKNOWN = 'unknown'
}

export enum LayerType {
  PRESENTATION = 'presentation',
  BUSINESS_LOGIC = 'business_logic',
  DATA_ACCESS = 'data_access',
  INFRASTRUCTURE = 'infrastructure',
  DOMAIN = 'domain',
  APPLICATION = 'application'
}

export enum ComponentType {
  SERVICE = 'service',
  CONTROLLER = 'controller',
  MODEL = 'model',
  VIEW = 'view',
  UTILITY = 'utility',
  MIDDLEWARE = 'middleware',
  PLUGIN = 'plugin',
  MODULE = 'module'
}

export enum DataFlowType {
  REQUEST = 'request',
  RESPONSE = 'response',
  EVENT = 'event',
  DATA_TRANSFER = 'data_transfer',
  STATE_CHANGE = 'state_change'
}

export enum PatternType {
  DESIGN_PATTERN = 'design_pattern',
  ARCHITECTURAL_PATTERN = 'architectural_pattern',
  CODING_PATTERN = 'coding_pattern',
  ANTI_PATTERN = 'anti_pattern',
  FRAMEWORK_PATTERN = 'framework_pattern'
}

export enum DependencyType {
  RUNTIME = 'runtime',
  DEVELOPMENT = 'development',
  PEER = 'peer',
  OPTIONAL = 'optional',
  BUNDLED = 'bundled'
}

export enum ExportType {
  FUNCTION = 'function',
  CLASS = 'class',
  INTERFACE = 'interface',
  TYPE = 'type',
  CONSTANT = 'constant',
  NAMESPACE = 'namespace',
  DEFAULT = 'default'
}

export enum ImportType {
  NAMED = 'named',
  DEFAULT = 'default',
  NAMESPACE = 'namespace',
  SIDE_EFFECT = 'side_effect'
}

export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
  INTERNAL = 'internal'
}

export enum FilePurpose {
  MAIN_ENTRY = 'main_entry',
  COMPONENT = 'component',
  SERVICE = 'service',
  UTILITY = 'utility',
  CONFIGURATION = 'configuration',
  TEST = 'test',
  DOCUMENTATION = 'documentation',
  BUILD = 'build',
  UNKNOWN = 'unknown'
}

export enum DirectoryPurpose {
  SOURCE_CODE = 'source_code',
  TESTS = 'tests',
  ASSETS = 'assets',
  CONFIGURATION = 'configuration',
  DOCUMENTATION = 'documentation',
  BUILD_OUTPUT = 'build_output',
  DEPENDENCIES = 'dependencies',
  UNKNOWN = 'unknown'
}

export enum BuildSystemType {
  WEBPACK = 'webpack',
  VITE = 'vite',
  ROLLUP = 'rollup',
  PARCEL = 'parcel',
  ESBUILD = 'esbuild',
  TYPESCRIPT = 'typescript',
  BABEL = 'babel',
  UNKNOWN = 'unknown'
}

export enum PackageManagerType {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
  BUN = 'bun',
  UNKNOWN = 'unknown'
}

export enum ScriptCategory {
  BUILD = 'build',
  TEST = 'test',
  LINT = 'lint',
  START = 'start',
  DEV = 'dev',
  DEPLOY = 'deploy',
  UTILITY = 'utility'
}

export enum DeploymentPlatform {
  VERCEL = 'vercel',
  NETLIFY = 'netlify',
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
  HEROKU = 'heroku',
  DOCKER = 'docker',
  UNKNOWN = 'unknown'
}

export enum ArchitecturePattern {
  MVC = 'mvc',
  MVP = 'mvp',
  MVVM = 'mvvm',
  FLUX = 'flux',
  REDUX = 'redux',
  CQRS = 'cqrs',
  EVENT_SOURCING = 'event_sourcing',
  SAGA = 'saga',
  UNKNOWN = 'unknown'
}
