import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LogViewer from '@/components/admin/LogViewer';

export default async function LogsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="admin-page">
      <h1>Admin System Logs</h1>
      <div className="admin-content">
        <LogViewer />
      </div>
    </div>
  );
}