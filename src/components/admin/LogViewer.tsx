"use client";

import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertCircle, Terminal } from 'lucide-react';

const LogViewer: React.FC = () => {
  const [logFile, setLogFile] = useState('system.log');
  const [logContent, setLogContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [requestUrl, setRequestUrl] = useState<string>('');

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Listen for changes in the color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const fetchLog = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    // Build the API URL
    const apiUrl = `/api/logs?file=${encodeURIComponent(logFile)}`;
    setRequestUrl(apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      let responseStatus = `${response.status} ${response.statusText}`;
      
      try {
        const data = await response.json();
        
        // Store debug info regardless of success/failure
        setDebugInfo({
          apiUrl,
          responseStatus,
          responseData: data
        });
        
        if (!response.ok || !data.success) {
          // Handle error response
          const errorMessage = data.error || `Failed to fetch log (${responseStatus})`;
          setError(errorMessage);
          setLogContent('');
        } else {
          // Handle successful response
          setLogContent(data.content || '');
        }
      } catch (jsonError) {
        setError(`Failed to parse response: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`);
        setDebugInfo({
          apiUrl,
          responseStatus,
          responseText: await response.text()
        });
        setLogContent('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setDebugInfo({
        apiUrl,
        error: err instanceof Error ? err.toString() : 'Unknown error'
      });
      setLogContent('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, []);

  // Common log file options
  const commonLogs = [
    { id: 'system', name: 'system.log' },
    { id: 'access', name: 'access.log' },
    { id: 'error', name: 'error.log' },
    { id: 'contact', name: 'contact.log' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} transition-colors duration-200`} style={{ contain: 'content' }}>
      <div className="container mx-auto py-8 px-4" style={{ contain: 'content', width: '100%' }}>
        <div className={`rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`} style={{ contain: 'content', width: '100%' }}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center`}>
            <Terminal className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h2 className="text-xl font-bold">System Log Viewer</h2>
          </div>
          
          <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-grow">
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Log Filename
                </label>
                <input 
                  type="text" 
                  value={logFile} 
                  onChange={(e) => setLogFile(e.target.value)} 
                  placeholder="Enter log filename"
                  className={`w-full px-3 py-2 rounded-md shadow-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } transition-colors`}
                />
              </div>
              <div className="mt-6">
                <button 
                  onClick={fetchLog} 
                  disabled={loading} 
                  className={`flex items-center justify-center px-4 py-2 rounded-md font-medium ${
                    theme === 'dark'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-800 disabled:text-gray-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300'
                  } transition-colors`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      View Log
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {commonLogs.map(log => (
                <button
                  key={log.id}
                  onClick={() => {
                    setLogFile(log.name);
                    setTimeout(fetchLog, 0);
                  }}
                  className={`text-sm px-3 py-1 rounded-full ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } transition-colors`}
                >
                  {log.name}
                </button>
              ))}
            </div>
          </div>
          
          {error && (
            <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'} flex items-start`}>
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{error}</p>
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Request URL:</p>
                  <pre className="mt-1 p-2 rounded overflow-auto">{requestUrl}</pre>
                </div>
                {debugInfo && (
                  <div className="mt-2 text-sm">
                    <p className="font-semibold">Debug Information:</p>
                    <pre className="mt-1 p-2 rounded overflow-auto whitespace-pre-wrap break-all" style={{ maxHeight: '150px' }}>
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div 
            className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} p-4`}
          >
            <div 
              className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} rounded-md p-2 w-full`} 
              style={{ 
                backgroundColor: theme === 'dark' ? '#1a202c' : '#f8fafc',
                minHeight: '300px',
                maxHeight: '600px',
                overflow: 'auto'
              }}
            >
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
              ) : (
                logContent ? (
                  <pre 
                    style={{ 
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                      width: 'max-content',
                      minWidth: '100%'
                    }}
                  >
                    {logContent}
                  </pre>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    {error ? 'No log content available due to error' : 'No log content to display.'}
                  </div>
                )
              )}
            </div>
          </div>
          
          <div className={`p-4 text-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-400 border-t border-gray-700' : 'bg-white text-gray-500 border-t border-gray-200'}`}>
            <p className="mb-1">Common logs: system.log, access.log, error.log, contact.log</p>
            <p>For more advanced options, contact the system administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;