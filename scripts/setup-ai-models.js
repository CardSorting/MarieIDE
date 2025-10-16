/**
 * AI Models Setup Script
 * 
 * Helps configure AI models for MarieIDE development.
 * Sets up local and cloud model configurations.
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 MarieIDE AI Models Setup');
console.log('============================\n');

// Check for required environment variables
function checkEnvironmentVariables() {
  const required = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('\nPlease set these variables in your .env file or environment.\n');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  return true;
}

// Create AI configuration file
function createAIConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'ai-models.json');
  const configDir = path.dirname(configPath);
  
  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const aiConfig = {
    models: {
      primary: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          type: 'text_generation',
          capabilities: {
            codeGeneration: true,
            codeAnalysis: true,
            naturalLanguage: true,
            visualProcessing: false,
            contextUnderstanding: true,
            reasoning: true
          },
          contextWindow: 8192,
          costPerToken: 0.00003,
          responseTimeMs: 2000
        },
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          type: 'text_generation',
          capabilities: {
            codeGeneration: true,
            codeAnalysis: true,
            naturalLanguage: true,
            visualProcessing: false,
            contextUnderstanding: true,
            reasoning: true
          },
          contextWindow: 200000,
          costPerToken: 0.000015,
          responseTimeMs: 1500
        }
      ],
      fallback: [
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          type: 'text_generation',
          capabilities: {
            codeGeneration: true,
            codeAnalysis: true,
            naturalLanguage: true,
            visualProcessing: false,
            contextUnderstanding: false,
            reasoning: false
          },
          contextWindow: 4096,
          costPerToken: 0.000002,
          responseTimeMs: 1000
        }
      ]
    },
    providers: {
      openai: {
        id: 'openai',
        name: 'OpenAI',
        type: 'cloud',
        apiEndpoint: 'https://api.openai.com/v1',
        authentication: {
          type: 'api_key',
          apiKey: process.env.OPENAI_API_KEY
        },
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerMinute: 90000,
          requestsPerDay: 10000
        }
      },
      anthropic: {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'cloud',
        apiEndpoint: 'https://api.anthropic.com',
        authentication: {
          type: 'api_key',
          apiKey: process.env.ANTHROPIC_API_KEY
        },
        rateLimits: {
          requestsPerMinute: 50,
          tokensPerMinute: 80000,
          requestsPerDay: 5000
        }
      }
    },
    orchestration: {
      selectionStrategy: 'performance_first',
      loadBalancing: {
        strategy: 'performance_based',
        healthCheckInterval: 30000
      },
      caching: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
        compressionEnabled: true
      }
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(aiConfig, null, 2));
  console.log('✅ AI configuration created:', configPath);
}

// Create .env template
function createEnvTemplate() {
  const envPath = path.join(__dirname, '..', '.env.example');
  const envTemplate = `# MarieIDE Environment Configuration

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Configuration  
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google AI Configuration (optional)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Local AI Model Configuration (optional)
OLLAMA_BASE_URL=http://localhost:11434
LOCAL_MODEL_ENABLED=false

# Development Configuration
NODE_ENV=development
ELECTRON_IS_DEV=true
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Environment template created:', envPath);
}

// Check for local AI models
function checkLocalModels() {
  console.log('\n🔍 Checking for local AI models...');
  
  // Check for Ollama
  try {
    const { execSync } = require('child_process');
    execSync('ollama --version', { stdio: 'pipe' });
    console.log('✅ Ollama detected');
    
    // List available models
    try {
      const models = execSync('ollama list', { encoding: 'utf8' });
      console.log('📋 Available Ollama models:');
      console.log(models);
    } catch (error) {
      console.log('ℹ️  No Ollama models installed yet');
    }
  } catch (error) {
    console.log('ℹ️  Ollama not found (optional)');
  }
}

// Main setup function
async function main() {
  try {
    // Check environment
    const envOk = checkEnvironmentVariables();
    
    // Create configuration files
    createAIConfig();
    createEnvTemplate();
    
    // Check local models
    checkLocalModels();
    
    console.log('\n🎉 AI Models Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Copy .env.example to .env and add your API keys');
    console.log('2. Run "npm run dev" to start MarieIDE');
    console.log('3. Open a project to see AI in action\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  main();
}

module.exports = { main };
