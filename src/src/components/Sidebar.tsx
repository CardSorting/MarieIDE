import React, { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { Button } from './ui/Button';
import { 
  Folder, 
  File, 
  GitBranch, 
  History, 
  ChevronRight, 
  ChevronDown,
  Plus,
  MoreHorizontal
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { workspace, checkpoints, gitStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<'files' | 'git' | 'history'>('files');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (files: any[], level = 0) => {
    return files.map((file) => (
      <div key={file.id} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm ${
            level > 0 ? `ml-${level * 4}` : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {file.type === 'directory' ? (
            <>
              <button
                onClick={() => toggleFolder(file.path)}
                className="mr-1 text-gray-400 hover:text-white"
              >
                {expandedFolders.has(file.path) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <Folder className="w-4 h-4 mr-2 text-blue-400" />
            </>
          ) : (
            <div className="w-5 mr-1" />
          )}
          <File className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-300">{file.name}</span>
        </div>
        {file.type === 'directory' && expandedFolders.has(file.path) && file.children && (
          <div>
            {renderFileTree(file.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="sidebar bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === 'files'
              ? 'text-white bg-gray-800 border-b-2 border-primary-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        <button
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === 'git'
              ? 'text-white bg-gray-800 border-b-2 border-primary-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('git')}
        >
          Git
        </button>
        <button
          className={`flex-1 py-2 px-3 text-sm font-medium ${
            activeTab === 'history'
              ? 'text-white bg-gray-800 border-b-2 border-primary-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'files' && (
          <div className="p-2">
            {workspace ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">{workspace.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    className="text-gray-400 hover:text-white"
                  />
                </div>
                <div className="space-y-1">
                  {workspace.files && workspace.files.length > 0 ? (
                    renderFileTree(workspace.files)
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files in workspace</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No workspace open</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => console.log('Open workspace')}
                >
                  Open Workspace
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'git' && (
          <div className="p-2">
            {gitStatus ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">{gitStatus.branch}</span>
                </div>
                
                {!gitStatus.isClean && (
                  <div className="space-y-2">
                    {gitStatus.modifiedFiles.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-yellow-400 mb-1">Modified</h4>
                        {gitStatus.modifiedFiles.map((file) => (
                          <div key={file} className="text-xs text-gray-400 ml-2">
                            {file}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {gitStatus.untrackedFiles.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-red-400 mb-1">Untracked</h4>
                        {gitStatus.untrackedFiles.map((file) => (
                          <div key={file} className="text-xs text-gray-400 ml-2">
                            {file}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No Git repository</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => console.log('Init Git')}
                >
                  Initialize Git
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-2">
            {checkpoints.length > 0 ? (
              <div className="space-y-2">
                {checkpoints.map((checkpoint) => (
                  <div
                    key={checkpoint.id}
                    className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-750 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">{checkpoint.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<MoreHorizontal className="w-4 h-4" />}
                        className="text-gray-400 hover:text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {checkpoint.timestamp.toLocaleString()}
                    </p>
                    {checkpoint.description && (
                      <p className="text-xs text-gray-500 mt-1">{checkpoint.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No checkpoints yet</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => console.log('Create checkpoint')}
                >
                  Create Checkpoint
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
