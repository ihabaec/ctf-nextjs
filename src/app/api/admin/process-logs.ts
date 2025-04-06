import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { getSession } from 'next-auth/react';

type ProcessLogRequest = {
  logFile: string;
}

type ProcessLogResponse = {
  processed?: boolean;
  results?: string;
  errors?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessLogResponse>
) {
    const session = await getSession({ req });
        if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
  
  const { logFile } = req.body as ProcessLogRequest;
  if (!logFile) {
    return res.status(400).json({ error: 'Log file parameter required' });
  }
  
  const command = `grep "ERROR" /var/logs/${logFile}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.status(200).json({
      processed: true,
      results: stdout,
      errors: stderr
    });
  });
}