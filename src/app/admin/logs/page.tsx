import LogViewer from '@/components/admin/LogViewer';

export default async function LogsPage() {
  
  return (
    <div className="admin-page">
      <h1>Admin System Logs</h1>
      <div className="admin-content">
        <LogViewer />
      </div>
    </div>
  );
}