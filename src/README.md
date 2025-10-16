# MarieIDE - Phase 1

Ultra-lightweight IDE with integrated AI composition, Git functionality, and reliable checkpoint/version system.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Rust (latest stable)
- Git

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run tauri:dev
   ```

3. **Build Application**
   ```bash
   npm run tauri:build
   ```

## 📁 Project Structure

```
src/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── layout/        # Layout components
│   │   └── panels/        # Panel components
│   ├── stores/            # Zustand state management
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # Application constants
│   ├── utils/             # Utility functions
│   └── services/          # Frontend services
├── src-tauri/             # Rust backend
│   ├── src/               # Rust source code
│   └── Cargo.toml         # Rust dependencies
└── docs/                  # Documentation
```

## 🎯 Phase 1 Features

### ✅ Completed
- [x] Tauri + React project setup
- [x] TypeScript configuration
- [x] TailwindCSS styling
- [x] Basic component structure
- [x] Zustand state management
- [x] IPC communication setup
- [x] Basic Rust backend commands

### 🚧 In Progress
- [ ] CSS Grid layout system
- [ ] Monaco Editor integration
- [ ] AI Composer panel
- [ ] Git integration
- [ ] Checkpoint system
- [ ] Terminal panel

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand
- **Editor**: Monaco Editor
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend (Rust + Tauri)
- **Runtime**: Tauri 2.0
- **Language**: Rust
- **IPC**: Type-safe command system
- **Storage**: SQLite (planned)
- **Version Control**: Git integration (planned)

## 🎨 UI Components

### Core Components
- `TitleBar` - Application title bar with controls
- `Sidebar` - File tree, Git status, and history
- `Editor` - Monaco Editor with tab management
- `Composer` - AI assistant panel
- `Terminal` - Integrated terminal

### UI Components
- `Button` - Reusable button component
- `LoadingScreen` - Application loading screen

## 🔧 Development Commands

```bash
# Development
npm run tauri:dev          # Run development server
npm run dev                # Run Vite dev server only

# Building
npm run tauri:build        # Build Tauri application
npm run build              # Build frontend only

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint errors
npm run format             # Format code with Prettier

# Testing
npm run test               # Run tests
npm run test:ui            # Run tests with UI
```

## 📊 Performance Targets

- **Startup Time**: <2 seconds
- **Memory Usage**: <300MB baseline
- **File Operations**: <200ms for files up to 1MB
- **AI Response**: <10 seconds for typical requests

## 🚨 Known Issues

- TailwindCSS warnings in CSS (expected)
- Mock data in backend commands
- AI integration placeholder
- Git integration placeholder

## 🔄 Next Steps

1. **Week 2**: Complete UI foundation and Monaco Editor
2. **Week 3**: Implement AI Composer functionality
3. **Week 4**: Add Git integration and checkpoint system
4. **Week 5**: Terminal panel and testing
5. **Week 6**: Performance optimization and polish

## 📚 Documentation

- [Phase 1 Requirements](../docs/phases/phase1/phase1_requirements.md)
- [Development Plan](../PHASE1_DEVELOPMENT_PLAN.md)
- [Architecture Overview](../docs/architecture/README.md)

## 🤝 Contributing

1. Follow the coding standards in `.cursor/rules/konmarimethod.mdc`
2. Use TypeScript for all new code
3. Write tests for new features
4. Update documentation as needed

---

**Status**: Phase 1 - Foundation Setup Complete ✅  
**Next**: UI Foundation & Editor Integration 🚧