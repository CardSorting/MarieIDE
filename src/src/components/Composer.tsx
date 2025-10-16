import React, { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { Button } from './ui/Button';
import { 
  Send, 
  Bot, 
  Copy, 
  Download, 
  Settings,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const Composer: React.FC = () => {
  const { activeFile, aiResponses, isAIProcessing, addAIResponse, setAIProcessing } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSendPrompt = async () => {
    if (!prompt.trim() || isAIProcessing) return;

    setAIProcessing(true);
    
    try {
      // TODO: Implement AI request functionality
      const response = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        response: 'This is a placeholder response. AI integration will be implemented in the next phase.',
        timestamp: new Date(),
        model: 'gpt-4',
        context: {
          file: activeFile?.path,
        },
      };

      addAIResponse(response);
      setPrompt('');
    } catch (error) {
      console.error('Failed to send prompt:', error);
    } finally {
      setAIProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleCopyResponse = (response: string) => {
    navigator.clipboard.writeText(response);
  };

  const handleInsertIntoEditor = (response: string) => {
    // TODO: Implement inserting response into editor
    console.log('Inserting into editor:', response);
  };

  return (
    <div className={`composer bg-gray-900 border-l border-gray-700 flex flex-col h-full ${
      isExpanded ? 'w-96' : 'w-80'
    } transition-all duration-300`}>
      {/* Composer Header */}
      <div className="composer-header bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary-500" />
          <h3 className="font-medium text-white">AI Composer</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            className="text-gray-400 hover:text-white"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </div>

      {/* Context Information */}
      {activeFile && (
        <div className="context-info bg-gray-800 border-b border-gray-700 px-4 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">Context:</span>
            <span className="text-primary-400 truncate">{activeFile.name}</span>
          </div>
        </div>
      )}

      {/* AI Responses */}
      <div className="responses flex-1 overflow-y-auto p-4 space-y-4">
        {aiResponses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">Start a conversation</h4>
            <p className="text-sm">Ask me to help with your code, explain concepts, or generate new code.</p>
          </div>
        ) : (
          aiResponses.map((response) => (
            <div key={response.id} className="response bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="response-header flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-400">{response.model}</span>
                  <span className="text-xs text-gray-500">
                    {response.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Copy className="w-3 h-3" />}
                    onClick={() => handleCopyResponse(response.response)}
                    className="text-gray-400 hover:text-white"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-3 h-3" />}
                    onClick={() => handleInsertIntoEditor(response.response)}
                    className="text-gray-400 hover:text-white"
                  />
                </div>
              </div>
              
              <div className="response-content">
                <div className="prompt mb-3">
                  <div className="text-xs text-gray-500 mb-1">Prompt:</div>
                  <div className="text-sm text-gray-300 bg-gray-700 rounded p-2">
                    {response.prompt}
                  </div>
                </div>
                
                <div className="response-text">
                  <div className="text-xs text-gray-500 mb-1">Response:</div>
                  <div className="text-sm text-white whitespace-pre-wrap">
                    {response.response}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prompt Input */}
      <div className="prompt-input bg-gray-800 border-t border-gray-700 p-4">
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about your code... (Cmd+Enter to send)"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isAIProcessing}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {prompt.length} characters
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Send className="w-4 h-4" />}
              onClick={handleSendPrompt}
              loading={isAIProcessing}
              disabled={!prompt.trim() || isAIProcessing}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
