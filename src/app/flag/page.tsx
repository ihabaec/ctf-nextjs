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
        const response = await fetch('/api/flag');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFlag(data.flag);
          } else {
            setError(data.error || 'Unknown error');
          }
        } else {
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

  if (loading) return null;
  if (!flag && !error) return null;
  
  if (error) return null;
  
  return (
    <div>
      <h1>FLAG CAPTURED!</h1>
      <p>{flag}</p>
    </div>
  );
}
