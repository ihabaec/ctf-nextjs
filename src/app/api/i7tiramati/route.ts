// app/api/flag/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { isFlagEnabled } from '@/utils/flagChecker';

export async function GET(request: NextRequest) {
  // Need to await the async function
  const flagEnabled = await isFlagEnabled();
  
  if (!flagEnabled) {
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
      const err = error as Error;
      return NextResponse.json(
        { success: false, error: 'Could not read flag', message: err.message },
        { status: 500 }
      );
    }
  }
  
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}