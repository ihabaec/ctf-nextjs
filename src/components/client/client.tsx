// app/flag/client.tsx (Client Component)
"use client";

import { useEffect, useState } from 'react';

export default function FlagClient() {
  const [flag, setFlag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkFlag = async () => {
      try {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!flag) return <div>No flag found</div>;
  
  return (
    <div>
      <h1>FLAG CAPTURED!</h1>
      <p>{flag}</p>
    </div>
  );
}