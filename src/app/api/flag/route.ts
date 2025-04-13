// app/api/flag/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { isFlagEnabled } from '@/utils/flagChecker';

export async function GET(request: NextRequest) {
  if (!isFlagEnabled()) {
    return NextResponse.json(
      { success: false, error: 'Not found' },
      { status: 404 }
    );
  }
  
  const flagCookie = request.cookies.get('flagcookie')?.value;
  
  if (flagCookie === 'hoih1io4ho2i14') {
    try {
      const flag = fs.readFileSync('/tmp/flag.txt', 'utf8');
      
      return NextResponse.json({ success: true, flag });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Could not read flag' },
        { status: 500 }
      );
    }
  }
  
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}