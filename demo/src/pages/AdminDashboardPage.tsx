import { AdminDashboard } from '../components/AdminDashboard';
import { generateMockDataset } from '../utils/mockData';
import { UserRole } from '../types/dashboard';
import { Shield } from 'lucide-react';

interface AdminDashboardPageProps {
  userRole: UserRole;
}

export function AdminDashboardPage({ userRole }: AdminDashboardPageProps) {
  const allUsers = generateMockDataset();

  if (userRole !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl mb-2">权限不足</h2>
        <p className="text-gray-600">
          您没有权限访问Admin Dashboard。
          <br />
          请使用管理员账号登录。
        </p>
      </div>
    );
  }

  return <AdminDashboard allUsers={allUsers} />;
}
