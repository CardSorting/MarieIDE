import React from 'react';
import { useAppStore } from '../stores/appStore';
import { Button } from './ui/Button';
import { 
  FolderOpen, 
  GitBranch, 
  Save, 
  Settings, 
  Minimize2, 
  Maximize2, 
  X 
} from 'lucide-react';

export const TitleBar: React.FC = () => {
  const { workspace, gitStatus, settings } = useAppStore();

  const handleOpenWorkspace = async () => {
    try {
      // This will be implemented with Tauri's dialog API
      console.log('Opening workspace...');
    } catch (error) {
      console.error('Failed to open workspace:', error);
    }
  };

  const handleSave = async () => {
    try {
      // This will be implemented with file save functionality
      console.log('Saving files...');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleSettings = () => {
    // This will open the settings panel
    console.log('Opening settings...');
  };

  return (
    <div className="titlebar bg-gray-800 text-white flex items-center justify-between px-4 py-2 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <span className="font-semibold">MarieIDE</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Button
            variant="ghost"
            size="sm"
            icon={<FolderOpen className="w-4 h-4" />}
            onClick={handleOpenWorkspace}
            className="text-gray-300 hover:text-white"
          >
            {workspace ? workspace.name : 'Open Workspace'}
          </Button>
          
          {gitStatus && (
            <div className="flex items-center space-x-1">
              <GitBranch className="w-4 h-4" />
              <span>{gitStatus.branch}</span>
              {!gitStatus.isClean && (
                <span className="text-yellow-400">•</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave}
          className="text-gray-300 hover:text-white"
        />
        
        <Button
          variant="ghost"
          size="sm"
          icon={<Settings className="w-4 h-4" />}
          onClick={handleSettings}
          className="text-gray-300 hover:text-white"
        />
        
        <div className="flex items-center space-x-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<Minimize2 className="w-4 h-4" />}
            className="text-gray-300 hover:text-white"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Maximize2 className="w-4 h-4" />}
            className="text-gray-300 hover:text-white"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            className="text-gray-300 hover:text-white hover:bg-red-600"
          />
        </div>
      </div>
    </div>
  );
};
