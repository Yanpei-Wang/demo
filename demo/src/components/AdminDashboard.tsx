import { useState } from 'react';
import { UserData } from '../types/dashboard';
import { UserDataTable } from './UserDataTable';
import { MentorshipStatsCard } from './MentorshipStatsCard';
import { MentorshipParticipantsCard } from './MentorshipParticipantsCard';

interface AdminDashboardProps {
  allUsers: UserData[];
}

export function AdminDashboard({ allUsers }: AdminDashboardProps) {
  const [selectedRound, setSelectedRound] = useState('all');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">View all users' mentorship activity data</p>
      </div>

      {/* Mentorship Stats */}
      <MentorshipStatsCard 
        allUsers={allUsers} 
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
      />

      {/* Mentorship Participants Analysis */}
      <MentorshipParticipantsCard 
        allUsers={allUsers}
        selectedRound={selectedRound}
      />

      {/* User Data Table */}
      <UserDataTable users={allUsers} />
    </div>
  );
}
