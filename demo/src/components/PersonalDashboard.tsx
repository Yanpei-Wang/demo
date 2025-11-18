import { useState } from 'react';
import { UserData, MentorshipParticipation, MentorshipRegistration } from '../types/dashboard';
import { ActivityMetricsCard } from './ActivityMetricsCard';
import { MentorshipCard } from './MentorshipCard';
import { MeetingManagementDialog } from './MeetingManagementDialog';
import { MentorshipRegistrationDialog } from './MentorshipRegistrationDialog';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Target, ExternalLink } from 'lucide-react';
import { mentorshipRounds } from '../utils/mockData';

interface PersonalDashboardProps {
  userData: UserData;
}

export function PersonalDashboard({ userData }: PersonalDashboardProps) {
  const [participations, setParticipations] = useState(userData.mentorshipParticipation);

  const handleScheduleMeeting = (
    partnerEmail: string,
    partnerName: string,
    date: Date,
    time: string,
    duration: number
  ) => {
    setParticipations((prev) =>
      prev.map((p) => {
        // Find the participation that has this partner
        if (p.partnerNames.includes(partnerName)) {
          return {
            ...p,
            meetings: [
              ...p.meetings,
              {
                id: `meeting-${Date.now()}`,
                date: date.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).replace(/\//g, '-'),
                time: time,
                duration: duration,
                partnerEmail: partnerEmail,
                partnerName: partnerName,
                isCompleted: false,
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const handleCancelMeeting = (meetingId: string) => {
    setParticipations((prev) =>
      prev.map((p) => ({
        ...p,
        meetings: p.meetings.filter((m) => m.id !== meetingId),
      }))
    );
  };

  const handleSaveRegistration = (registration: MentorshipRegistration) => {
    setParticipations((prev) =>
      prev.map((p) => {
        if (p.status === 'active') {
          return { ...p, registration };
        }
        return p;
      })
    );
  };

  // Find active participation
  const activeParticipation = participations.find((p) => p.status === 'active');

  // Check if we're in the registration period (between rounds)
  const isInRegistrationPeriod = !activeParticipation || activeParticipation.status !== 'active';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Personal Dashboard</h1>
          <p className="text-gray-600">Welcome back，{userData.name}</p>
        </div>
        
        <MeetingManagementDialog
          participations={participations}
          onScheduleMeeting={handleScheduleMeeting}
          onCancelMeeting={handleCancelMeeting}
        />
      </div>

      {/* Mentorship Info Banner */}
      {activeParticipation && (
        <Card className="border-gray-200 shadow-sm bg-gradient-to-r from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Goal Display */}
              {activeParticipation.registration?.goal && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Target className="h-5 w-5 text-[#6035F3]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Current Round Mentorship Goal</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {activeParticipation.registration.goal}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <MentorshipRegistrationDialog
                  role={activeParticipation.role}
                  currentRegistration={activeParticipation.registration}
                  isLocked={!isInRegistrationPeriod}
                  onSave={handleSaveRegistration}
                />
                
                <Button
                  variant="outline"
                  className="border-[#6035F3] text-[#6035F3] hover:bg-purple-50"
                  asChild
                >
                  <a
                    href="https://forms.google.com/mentorship-feedback"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Submit Mentorship Feedback
                  </a>
                </Button>

                {activeParticipation.registration && (
                  <div className="ml-auto flex items-center gap-2">
                    <Badge className="bg-purple-100 text-[#6035F3] border-purple-200">
                      {activeParticipation.role === 'mentor' ? '导师' : '学员'}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {activeParticipation.registration.industry}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <MentorshipCard participations={participations} />
      
      <ActivityMetricsCard metrics={userData.activityMetrics} />
    </div>
  );
}
