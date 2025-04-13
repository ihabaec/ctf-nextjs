// src/utils/flagChecker.ts
'use server';

import { promises as fs } from 'fs';

export async function isFlagEnabled(): Promise<boolean> {
  const flagPath = '/tmp/.flag_activated';
  console.log(`[FLAG_CHECK] Attempting to read flag from ${flagPath}`);
  
  try {
    // Check if file exists first
    try {
      const stats = await fs.stat(flagPath);
      console.log(`[FLAG_CHECK] File stats: exists=${stats.isFile()}, size=${stats.size}, mode=${stats.mode.toString(8)}`);
    } catch (error) {
      const statErr = error as NodeJS.ErrnoException;
      console.error(`[FLAG_CHECK] File does not exist or cannot be accessed: ${statErr.message}`);
      return false;
    }
    
    // Read the flag file
    const flagData = await fs.readFile(flagPath, 'utf8');
    const flagStatus = flagData.trim();
    
    // Log the raw buffer and the trimmed value
    console.log(`[FLAG_CHECK] Raw flag data: "${flagData}" (length: ${flagData.length})`);
    console.log(`[FLAG_CHECK] Trimmed flag status: "${flagStatus}" (length: ${flagStatus.length})`);
    
    // Check both loose and strict comparison
    const isEnabledStrict = flagStatus === '1';
    const isEnabledLoose = flagStatus == '1';
    console.log(`[FLAG_CHECK] Flag enabled (strict): ${isEnabledStrict}, (loose): ${isEnabledLoose}`);
    
    // Try parsing as a number
    const flagNumber = parseInt(flagStatus, 10);
    console.log(`[FLAG_CHECK] Flag as number: ${flagNumber}, isNaN: ${isNaN(flagNumber)}`);
    
    return isEnabledStrict; // Keep original behavior
  } catch (error) {
    const readErr = error as Error;
    console.error(`[FLAG_CHECK] Error reading flag file: ${readErr.message}`);
    console.error(`[FLAG_CHECK] Error stack: ${readErr.stack}`);
    return false;
  }
}