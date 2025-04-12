import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  // Get cookies from the request
  const flagCookie = request.cookies.get('flagcookie')?.value;
  
  // Check if the cookie exists and has the correct value
  if (flagCookie === 'hoih1io4ho2i14') {
    try {
      // Read the flag from the file - this happens server-side only
      const flag = fs.readFileSync('/tmp/flag.txt', 'utf8');
      
      // Return the flag to the client
      return NextResponse.json({ success: true, flag });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Could not read flag' },
        { status: 500 }
      );
    }
  }
  
  // If cookie isn't correct, return unauthorized
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}