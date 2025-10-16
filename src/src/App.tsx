import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import './App.css';
import { AppSettings, DEFAULT_SETTINGS } from './constants';
import { useAppStore } from './stores/appStore';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Composer } from './components/Composer';
import { Terminal } from './components/Terminal';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const { 
    workspace, 
    activeFile, 
    layout,
    setWorkspace,
    setActiveFile,
    setLayout,
    setSettings: setStoreSettings
  } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load settings
      const savedSettings = await invoke('settings:get');
      if (savedSettings) {
        setSettings(savedSettings as AppSettings);
        setStoreSettings(savedSettings as AppSettings);
      }

      // Set up event listeners
      await listen('workspace:changed', (event) => {
        setWorkspace(event.payload as any);
      });

      await listen('file:opened', (event) => {
        setActiveFile(event.payload as any);
      });

      await listen('settings:changed', (event) => {
        setSettings(event.payload as AppSettings);
        setStoreSettings(event.payload as AppSettings);
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`app ${settings.theme === 'dark' ? 'dark' : 'light'}`}>
      <TitleBar />
      
      <div className="app-content">
        <div 
          className="app-layout"
          style={{
            gridTemplateColumns: layout.sidebar.visible 
              ? `${layout.sidebar.width}px 1fr ${layout.composer.visible ? layout.composer.width : 0}px`
              : `0 1fr ${layout.composer.visible ? layout.composer.width : 0}px`,
            gridTemplateRows: layout.terminal.visible 
              ? `1fr ${layout.terminal.height}px`
              : '1fr 0',
          }}
        >
          {layout.sidebar.visible && (
            <Sidebar />
          )}
          
          <div className="editor-container">
            <Editor />
          </div>
          
          {layout.composer.visible && (
            <Composer />
          )}
          
          {layout.terminal.visible && (
            <Terminal />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
