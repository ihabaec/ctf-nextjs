import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import { getSession } from "next-auth/react";

type ContactRequest = {
  name: string;
  email: string;
  message: string;
}

type ContactResponse = {
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }
  
  const { name, email, message } = req.body as ContactRequest;
  const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.socket.remoteAddress || 
                     'Unknown';

  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}]${name}:(${email}) using ${ipAddress}- User-Agent: ${userAgent}\n`;
  
  try {
    await fs.appendFile('/var/logs/contact.log', logEntry);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to log contact request' });
  }
}