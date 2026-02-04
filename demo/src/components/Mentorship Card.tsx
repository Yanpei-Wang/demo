import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MentorshipParticipation } from '../types/dashboard';
import { GraduationCap, User, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mentorshipRounds } from '../utils/mockData';

interface MentorshipCardProps {
  participations: MentorshipParticipation[];
}

export function MentorshipCard({ participations }: MentorshipCardProps) {
  const [selectedRound, setSelectedRound] = useState(mentorshipRounds[0].id);

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
    return participations.filter(p => p.roundId === selectedRound);
  }, [participations, selectedRound]);

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
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            meeting.isCompleted 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm">{meeting.date}</div>
                              <div className="text-xs text-gray-600">{meeting.time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {meeting.isCompleted ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-green-600">Completed</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-500">Not Completed</span>
                              </>
                            )}
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
    </Card>
  );
}
