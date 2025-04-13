// src/utils/flagChecker.ts
'use server';

import { promises as fs } from 'fs';

export async function isFlagEnabled(): Promise<boolean> {
  try {
    // Log for debugging
    console.log("Checking flag status...");
    
    // Read the flag file
    const flagData = await fs.readFile('/tmp/.flag_activated', 'utf8');
    const flagStatus = flagData.trim();
    
    // Log the actual value found
    console.log(`Flag status: "${flagStatus}"`);
    
    // Strict comparison
    const isEnabled = flagStatus === '1';
    console.log(`Flag enabled: ${isEnabled}`);
    
    return isEnabled;
  } catch (error) {
    // If error occurs, log it and return false
    console.error("Error checking flag:", error);
    return false;
  }
}