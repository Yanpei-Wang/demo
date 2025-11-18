import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MentorshipManagementPage } from './pages/MentorshipManagementPage';
import ProfilePage from './pages/ProfilePage';
import { UserRole } from './types/dashboard';
import { currentUserData } from './utils/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Label } from './components/ui/label';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('circlecat_employee');

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'circlecat_employee', label: 'CircleCat Employee' },
    { value: 'circlecat_intern', label: 'CircleCat Intern' },
    { value: 'circlecat_volunteer', label: 'CircleCat Volunteer' },
    { value: 'googler', label: 'Googler' },
    { value: 'external_mentee', label: 'External Mentee' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <BrowserRouter>
      <Layout userRole={currentRole} userName={currentUserData.name}>
        {/* Role Switcher - For demo purposes */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <Label htmlFor="role-select" className="text-sm font-semibold text-gray-700">Switch Role (Demo):</Label>
            <Select value={currentRole} onValueChange={(value) => setCurrentRole(value as UserRole)}>
              <SelectTrigger id="role-select" className="w-[220px] border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Routes>
          <Route
            path="/dashboard"
            element={<DashboardPage userRole={currentRole} />}
          />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboardPage userRole={currentRole} />}
          />
          <Route
            path="/admin/mentorship"
            element={<MentorshipManagementPage />}
          />
          <Route
            path="/profile"
            element={<ProfilePage userRole={currentRole} />}
          />
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  );
}
