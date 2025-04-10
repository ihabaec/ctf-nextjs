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

    const body = await request.json();
    const { name, email, message } = body as ContactRequest;
    
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
    
    // Get user info
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${name}: (${email}) - User-Agent: ${userAgent}\n\n`;
    
    const logsDir = path.join(process.cwd(), 'logs');
    await fs.appendFile(path.join(logsDir, 'contact.log'), logEntry);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error processing contact:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process contact request' },
      { status: 500 }
    );
  }
}