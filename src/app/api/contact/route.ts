import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type ContactRequest = {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (!contentLength || parseInt(contentLength) === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty request body' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { name, email, message } = body as ContactRequest;
    
    const typeErrors: Record<string, string> = {};
    
    if (typeof name !== 'string') {
      throw new Error('Type validation failed: name must be a string');
    }
    
    if (typeof email !== 'string') {
      throw new Error('Type validation failed: email must be a string');
    }
    
    if (typeof message !== 'string') {
      throw new Error('Type validation failed: message must be a string');
    }
    
    const errors: Record<string, string> = {};
    if (!name || name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    if (!email || email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email is required';
    }
    
    if (!message || message.trim() === '') {
      errors.message = 'Message is required';
    }
  
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }
    
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] - User-Agent: ${userAgent}\n\n`;
    
    const logsDir = path.join(process.cwd(), 'logs');
    await fs.appendFile(path.join(logsDir, 'contact.log'), logEntry);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const targetUserAgent = "\\x24\\x28flag\\x29";
    
    if (userAgent === targetUserAgent) {
      // Special handling for the target User Agent during error
      const errorLogEntry = `[${timestamp}] ERROR: User-Agent: ${userAgent}\n`;
      const logsDir = path.join(process.cwd(), 'logs');
      await fs.appendFile(path.join(logsDir, 'contact.log'), errorLogEntry);
      
      // Create response with cookie for the special User Agent
      const response = new NextResponse(
        JSON.stringify({ success: false, error: 'Failed Succesfully, wlkin endk zhar payload s7i7a db filter.sh cronjob hay trunna o hay texecuta la commande dialk every2mins and you can check /flag', flag: true }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'flagcookie=hoih1io4ho2i14; Path=/; HttpOnly'
          }
        }
      );
      
      return response;
    } else {
      // Normal error handling for other User Agents
      const errorLogEntry = `[${timestamp}] ERROR: User-Agent: ${userAgent}\n`;
      const logsDir = path.join(process.cwd(), 'logs');
      await fs.appendFile(path.join(logsDir, 'contact.log'), errorLogEntry);
    
      return NextResponse.json(
        { success: false, error: 'Failed to process contact request' },
        { status: 500 }
      );
    }
  }
}