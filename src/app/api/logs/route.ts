// File: app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}

// Handle POST requests (same as GET for this example)
export async function POST(request: NextRequest) {
  console.log("POST request received");
  return handleLogRequest(request);
}

// Handle GET requests
export async function GET(request: NextRequest) {
  console.log("GET request received");
  return handleLogRequest(request);
}

// Shared logic for both GET and POST
async function handleLogRequest(request: NextRequest) {
  // Use searchParams instead of query in App Router
  const url = new URL(request.url);
  const file = url.searchParams.get('file');
  
  console.log("API route called with file param:", file);

    const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 403 }
         );
     }

  if (!file) {
    return NextResponse.json(
      { success: false, error: "File parameter is required" },
      { status: 400 }
    );
  }

  // Use a relative path to logs directory
  const logsDir = path.join(process.cwd(), 'logs');
  
  try {
    // Check if the directory exists
    const dirExists = existsSync(logsDir);
    
    if (!dirExists) {
      console.log(`Logs directory '${logsDir}' does not exist`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Logs directory '${logsDir}' does not exist`,
          debug: { 
            requestedFile: file,
            attemptedPath: path.join(logsDir, file),
            cwd: process.cwd()
          }
        },
        { status: 500 }
      );
    }

    // Vulnerable: No proper path validation
    const logPath = path.join(logsDir, file);
    
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
          error: `File '${file}' not found or couldn't be read`,
          debug: {
            requestedFile: file,
            attemptedPath: logPath,
            error: (err as Error).message
          }
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
        debug: {
          error: (err as Error).message,
          stack: (err as Error).stack
        }
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