import { PersonalDashboard } from '../components/PersonalDashboard';
import { MentorshipOnlyDashboard } from '../components/MentorshipOnlyDashboard';
import { UserRole } from '../types/dashboard';
import { currentUserData } from '../utils/mockData';
import { Shield } from 'lucide-react';

interface DashboardPageProps {
  userRole: UserRole;
}

export function DashboardPage({ userRole }: DashboardPageProps) {
  // Admin can also view personal dashboard, along with circlecat_* roles
  const canViewPersonal = ['circlecat_employee', 'circlecat_intern', 'circlecat_volunteer', 'admin'].includes(userRole);
  const canViewMentorshipOnly = ['googler', 'external_mentee'].includes(userRole);

  const userData = {
    ...currentUserData,
    role: userRole,
  };

  if (canViewPersonal) {
    return <PersonalDashboard userData={userData} />;
  }

  if (canViewMentorshipOnly) {
    return <MentorshipOnlyDashboard userData={userData} />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl mb-2">权限不足</h2>
      <p className="text-gray-600">
        当前角色 ({userRole}) 没有访问仪表盘的权限。
        <br />
        请联系管理员获取相应权限。
      </p>
    </div>
  );
}
