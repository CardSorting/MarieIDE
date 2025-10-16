import React, { useState, useRef } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useAppStore } from '../stores/appStore';
import { Button } from './ui/Button';
import { X, Save, FileText } from 'lucide-react';

export const Editor: React.FC = () => {
  const { activeFile, openFiles, setActiveFile, removeOpenFile } = useAppStore();
  const [editorValue, setEditorValue] = useState('');
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    setEditorValue(value || '');
    // TODO: Mark file as modified
  };

  const handleSave = async () => {
    if (!activeFile) return;
    
    try {
      // TODO: Implement file save functionality
      console.log('Saving file:', activeFile.path, editorValue);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const handleCloseTab = (fileId: string) => {
    removeOpenFile(fileId);
  };

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'txt': 'plaintext',
    };
    return languageMap[extension || ''] || 'plaintext';
  };

  return (
    <div className="editor-container bg-gray-900 flex flex-col h-full">
      {/* Tab Bar */}
      {openFiles.length > 0 && (
        <div className="tab-bar bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
          {openFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center px-3 py-2 border-r border-gray-700 cursor-pointer min-w-0 ${
                activeFile?.id === file.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
              }`}
              onClick={() => setActiveFile(file)}
            >
              <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate max-w-32">{file.name}</span>
              {file.isModified && (
                <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
              )}
              <button
                className="ml-2 p-1 hover:bg-gray-600 rounded flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(file.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor Content */}
      <div className="editor-content flex-1 relative">
        {activeFile ? (
          <div className="h-full flex flex-col">
            {/* Editor Toolbar */}
            <div className="editor-toolbar bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">
                  {activeFile.path}
                </span>
                {activeFile.isModified && (
                  <span className="text-xs text-yellow-400">• Modified</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  className="text-gray-300 hover:text-white"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language={getLanguageFromPath(activeFile.path)}
                value={editorValue}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  lineNumbers: 'on',
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 2,
                  insertSpaces: true,
                  renderWhitespace: 'selection',
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                }}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No file open</h3>
              <p className="text-sm">Open a file from the sidebar to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
