import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shield, User, Settings } from 'lucide-react';
import { cn } from './ui/utils';
import { UserRole } from '../types/dashboard';

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const isAdmin = userRole === 'admin';

  const navigationItems = [
    {
      title: 'Personal Dashboard',
      href: '/dashboard',
      icon: User,
      show: true, // All users including admin can see personal dashboard
    },
    {
      title: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: Shield,
      show: isAdmin, // Only admin can see admin dashboard
    },
    {
      title: 'Mentorship 管理',
      href: '/admin/mentorship',
      icon: Settings,
      show: isAdmin, // Only admin can see mentorship management
    },
  ];

  const visibleItems = navigationItems.filter((item) => item.show);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-10 shadow-sm">
      <nav className="p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium',
                isActive
                  ? 'bg-[#6035F3] text-white shadow-md shadow-[#6035F3]/20'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
