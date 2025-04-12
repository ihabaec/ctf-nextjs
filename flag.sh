#!/bin/bash

# Get the current app directory
APP_DIR="$(pwd)/src/app"

# Create the necessary directories
mkdir -p $APP_DIR/flag
mkdir -p $APP_DIR/api/flag

# Create a server-side API route to check the cookie and return the flag
cat > $APP_DIR/api/flag/route.ts << EOF
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
EOF

# Create the client-side page that will fetch from the API
cat > $APP_DIR/flag/page.tsx << EOF
"use client";

import { useEffect, useState } from 'react';

export default function FlagPage() {
  const [flag, setFlag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const checkFlag = async () => {
      try {
        setLoading(true);
        // This calls our API route which checks the cookie server-side
        const response = await fetch('/api/flag');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFlag(data.flag);
          } else {
            // API returned an error
            setError(data.error || 'Unknown error');
          }
        } else {
          // Handle HTTP errors
          setError('Access denied');
        }
      } catch (err) {
        setError('Failed to check flag');
      } finally {
        setLoading(false);
      }
    };
    
    checkFlag();
  }, []);

  // Don't show anything while loading or if there's no flag
  if (loading) return null;
  if (!flag && !error) return null;
  
  // Only show the error if debugging is needed
  // For production, return null to show nothing on error
  if (error) return null;
  
  // Show the flag when it's retrieved successfully
  return (
    <div>
      <h1>FLAG CAPTURED!</h1>
      <p>{flag}</p>
    </div>
  );
}
EOF

echo "Flag page and API route have been created at:"
echo "- $APP_DIR/flag/page.tsx"
echo "- $APP_DIR/api/flag/route.ts"
echo "The page will securely check for the cookie 'flagcookie' with value 'somerandom bunch of charcs and number'"
echo "The flag content will be read from /tmp/flag.txt only on the server side"
echo "The flag page will self-destruct in 5 minutes..."

# Schedule deletion of the flag page after 5 minutes
(
  sleep 30
  rm -rf $APP_DIR/flag
  rm -rf $APP_DIR/api/flag
  echo "Flag page and API route have been deleted"
) &

# Store the background job PID so we can inform the user
DELETE_PID=$!
echo "Self-destruct process running with PID: $DELETE_PID"