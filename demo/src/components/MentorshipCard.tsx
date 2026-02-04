import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MentorshipParticipation, MentorshipMeeting } from '../types/dashboard';
import { GraduationCap, User, Calendar, CheckCircle2, XCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mentorshipRounds } from '../utils/mockData';
import { MeetingSubmissionModal } from './MeetingSubmissionModal';

interface MentorshipCardProps {
  participations: MentorshipParticipation[];
}

export function MentorshipCard({ participations }: MentorshipCardProps) {
  const [selectedRound, setSelectedRound] = useState(mentorshipRounds[0].id);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [localParticipations, setLocalParticipations] = useState<MentorshipParticipation[]>(participations);

  // Sync with props if they change
  useEffect(() => {
    setLocalParticipations(participations);
  }, [participations]);

  const handleMeetingSubmit = (data: { timezone: string; slots: { date: Date; startTime: string; endTime: string }[] }) => {

    setLocalParticipations(prev => prev.map(p => {
      if (p.roundId === selectedRound) {
        // Create new meeting objects
        const newMeetings: MentorshipMeeting[] = data.slots.map(slot => {
          const meetingDate = slot.date.toISOString().split('T')[0];

          // Calculate duration in minutes
          const startParts = slot.startTime.split(':').map(Number);
          const endParts = slot.endTime.split(':').map(Number);
          const startMinutes = startParts[0] * 60 + startParts[1];
          const endMinutes = endParts[0] * 60 + endParts[1];
          let duration = endMinutes - startMinutes;
          if (duration < 0) duration += 24 * 60; // Handle overnight

          return {
            id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            date: meetingDate,
            time: `${slot.startTime} - ${slot.endTime}`, // Display string
            startTime: slot.startTime,
            endTime: slot.endTime,
            timezone: data.timezone,
            duration: duration,
            partnerEmail: "partner@example.com", // Placeholder
            partnerName: p.partnerNames.length > 0 ? p.partnerNames[0] : "Partner",
            isCompleted: true,
          };
        });

        return {
          ...p,
          meetings: [...newMeetings, ...p.meetings] // Add all new meetings to top
        };
      }
      return p;
    }));

    setIsMeetingModalOpen(false);
  };

  const handleDeleteMeeting = (roundId: string, meetingId: string) => {
    if (confirm("Are you sure you want to delete this meeting record?")) {
      setLocalParticipations(prev => prev.map(p => {
        if (p.roundId === roundId) {
          return {
            ...p,
            meetings: p.meetings.filter(m => m.id !== meetingId)
          };
        }
        return p;
      }));
    }
  };

  // Get the selected round details
  const selectedRoundDetails = useMemo(() => {
    return mentorshipRounds.find(r => r.id === selectedRound);
  }, [selectedRound]);

  // Check if the selected round is a future round
  const isFutureRound = useMemo(() => {
    if (!selectedRoundDetails) return false;
    const currentDate = new Date();
    const roundStartDate = new Date(selectedRoundDetails.startDate);
    return roundStartDate > currentDate;
  }, [selectedRoundDetails]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Filter participations based on selected round
  const filteredParticipations = useMemo(() => {
    return localParticipations.filter(p => p.roundId === selectedRound);
  }, [localParticipations, selectedRound]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      completed: 'secondary',
      pending: 'outline',
    };

    const labels: Record<string, string> = {
      active: 'Active',
      completed: 'Completed',
      pending: 'Pending',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getRoleIcon = (role: string) => {
    return role === 'mentor' ? <GraduationCap className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const calculateStats = (participation: MentorshipParticipation) => {
    const totalMeetings = participation.meetings.length;
    const completedMeetings = participation.meetings.filter(m => m.isCompleted).length;
    const completionRate = totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0;

    return {
      totalMeetings,
      completedMeetings,
      completionRate,
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mentorship Participation</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsMeetingModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Meeting Info
            </Button>
            <Select value={selectedRound} onValueChange={setSelectedRound}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mentorshipRounds.map((round) => {
                  const isFuture = new Date(round.startDate) > new Date();
                  const isCurrent = round.status === 'active' && !isFuture;
                  return (
                    <SelectItem key={round.id} value={round.id}>
                      {round.name} {isCurrent && '(Current)'} {isFuture && '(Upcoming)'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Future Round Notice */}
        {isFutureRound && selectedRoundDetails && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  Next Round Mentorship Starting Soon
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    {selectedRoundDetails.name}
                  </Badge>
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    Start Date: {formatDate(selectedRoundDetails.startDate)}
                  </p>
                  <p className="text-gray-600 mt-2">
                    The next round of mentorship has not started yet. Please complete your registration information before the round begins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredParticipations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>You have not participated in the mentorship program in this round</p>
            {isFutureRound && (
              <p className="text-sm text-amber-600 mt-2">This round has not started yet</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredParticipations.map((participation, index) => {
              const stats = calculateStats(participation);

              return (
                <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="flex items-center gap-2 mb-2">
                        {getRoleIcon(participation.role)}
                        {participation.programName}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {participation.role === 'mentor' ? 'Mentor' : 'Mentee'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Duration:</span> {participation.startDate} to {participation.endDate}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">
                            {participation.role === 'mentor' ? 'Mentees:' : 'Mentor:'}
                          </span>{' '}
                          {participation.partnerNames.join(', ')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(participation.status)}
                  </div>

                  {/* Meeting Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Required Meetings</div>
                      <div className="text-2xl">{stats.totalMeetings}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Completed</div>
                      <div className="text-2xl text-green-600">{stats.completedMeetings}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                      <div className="text-2xl text-[#6035F3]">{stats.completionRate}%</div>
                    </div>
                  </div>

                  {/* Meeting List */}
                  <div className="space-y-2">
                    <h5 className="text-sm text-gray-600 mb-2">Meeting List</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {participation.meetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${meeting.isCompleted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm">{meeting.date}</div>
                              <div className="text-xs text-gray-600">
                                {meeting.time}
                                {meeting.timezone && ` (${meeting.timezone.split('/')[1] || meeting.timezone})`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                          {/*   {meeting.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                                */}
                          </div>
                        
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <MeetingSubmissionModal
        open={isMeetingModalOpen}
        onOpenChange={setIsMeetingModalOpen}
        onSubmit={handleMeetingSubmit}
      />
    </Card>
  );
}
