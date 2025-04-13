import { redirect } from 'next/navigation';
import { isFlagEnabled } from '@/utils/flagChecker';
import FlagClient from '@/components/client/client';

export default async function FlagPage() {
  // Check flag on the server
  const flagEnabled = await isFlagEnabled();
  
  // If flag is not enabled, redirect
  if (!flagEnabled) {
    redirect('/');
  }
  
  // If flag is enabled, render the client component
  return <FlagClient />;
}