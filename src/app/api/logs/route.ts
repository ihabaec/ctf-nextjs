import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}

export async function GET(request: NextRequest) {
  console.log("GET request received");
  return handleLogRequest(request);
}

async function handleLogRequest(request: NextRequest) {
  // Use searchParams instead of query in App Router
  const url = new URL(request.url);
  const file = url.searchParams.get('file');
  
  console.log("API route called with file param:", file);

  if (!file) {
    return NextResponse.json(
      { success: false, error: "File parameter is required" },
      { status: 400 }
    );
  }

  const logsDir = path.join(process.cwd(), 'logs/filtered');
  
  try {
    // Check if logs directory exists
    const dirExists = existsSync(logsDir);
    
    if (!dirExists) {
      console.log(`Logs directory '${logsDir}' does not exist`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Logs directory does not exist`,
        },
        { status: 500 }
      );
    }

    // SECURITY IMPROVEMENTS:
    
    // 1. Sanitize the filename - only allow alphanumeric characters, hyphens, and .log extension
    const filenameRegex = /^[a-zA-Z0-9-_]+\.log$/;
    if (!filenameRegex.test(file)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid file format. Only log files with alphanumeric names are allowed."
        },
        { status: 400 }
      );
    }
    
    // 2. Resolve the absolute paths to ensure no directory traversal
    const logPath = path.resolve(logsDir, file);
    const normalizedLogsDir = path.resolve(logsDir);
    
    // 3. Verify the resolved path starts with the logs directory path (prevent path traversal)
    if (!logPath.startsWith(normalizedLogsDir)) {
      console.error('Attempted directory traversal:', {
        requestedFile: file,
        resolvedPath: logPath,
        logsDir: normalizedLogsDir
      });
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }
    
    try {
      const data = await fs.readFile(logPath, 'utf8');
      
      // Return JSON response
      return NextResponse.json({ 
        success: true, 
        content: data 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (err) {
      console.error('Error reading log file:', err);
      return NextResponse.json(
        { 
          success: false, 
          error: `File not found or couldn't be read`,
        },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: "An unexpected error occurred",
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}