import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { Button } from './ui/Button';
import { 
  Terminal as TerminalIcon, 
  Plus, 
  X, 
  Trash2,
  Play,
  Square
} from 'lucide-react';

export const Terminal: React.FC = () => {
  const { terminalSessions, activeTerminalSession, addTerminalSession, removeTerminalSession, setActiveTerminalSession } = useAppStore();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleCreateSession = () => {
    const newSession = {
      id: Date.now().toString(),
      name: `Terminal ${terminalSessions.length + 1}`,
      cwd: '/',
      isActive: true,
      history: [],
    };
    addTerminalSession(newSession);
    setActiveTerminalSession(newSession.id);
  };

  const handleExecuteCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to output
    setOutput(prev => [...prev, `$ ${command}`]);
    
    try {
      // TODO: Implement actual terminal command execution
      // For now, just simulate some output
      const response = `Command executed: ${command}`;
      setOutput(prev => [...prev, response]);
    } catch (error) {
      setOutput(prev => [...prev, `Error: ${error}`]);
    }
    
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteCommand(input);
    }
  };

  const handleClearTerminal = () => {
    setOutput([]);
  };

  const currentSession = terminalSessions.find(s => s.id === activeTerminalSession);

  return (
    <div className="terminal bg-gray-900 border-t border-gray-700 flex flex-col h-full">
      {/* Terminal Header */}
      <div className="terminal-header bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Terminal</span>
          {currentSession && (
            <span className="text-xs text-gray-400">({currentSession.name})</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateSession}
            className="text-gray-400 hover:text-white"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={handleClearTerminal}
            className="text-gray-400 hover:text-white"
          />
        </div>
      </div>

      {/* Terminal Tabs */}
      {terminalSessions.length > 1 && (
        <div className="terminal-tabs bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
          {terminalSessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center px-3 py-2 border-r border-gray-700 cursor-pointer min-w-0 ${
                activeTerminalSession === session.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
              }`}
              onClick={() => setActiveTerminalSession(session.id)}
            >
              <TerminalIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate max-w-24">{session.name}</span>
              <button
                className="ml-2 p-1 hover:bg-gray-600 rounded flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTerminalSession(session.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="terminal-output flex-1 overflow-y-auto p-4 font-mono text-sm"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {output.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <TerminalIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Terminal ready. Type a command to get started.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {output.map((line, index) => (
              <div key={index} className="text-gray-300">
                {line.startsWith('$ ') ? (
                  <span className="text-green-400">{line}</span>
                ) : line.startsWith('Error:') ? (
                  <span className="text-red-400">{line}</span>
                ) : (
                  <span className="text-gray-300">{line}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <div className="terminal-input bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Play className="w-4 h-4" />}
            onClick={() => handleExecuteCommand(input)}
            className="text-gray-400 hover:text-white"
          />
        </div>
      </div>
    </div>
  );
};
