import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { UserRole } from '../types/dashboard';

interface LayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName?: string;
}

export function Layout({ children, userRole, userName }: LayoutProps) {
  const getRoleLabel = (role: UserRole): string => {
    const roleLabels: Record<UserRole, string> = {
      circlecat_employee: 'Employee',
      circlecat_intern: 'Intern',
      circlecat_volunteer: 'Volunteer',
      googler: 'Googler',
      external_mentee: 'External Mentee',
      admin: 'Administrator',
    };
    return roleLabels[role];
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header userName={userName} userRole={getRoleLabel(userRole)} />
      <Sidebar userRole={userRole} />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  );
}
