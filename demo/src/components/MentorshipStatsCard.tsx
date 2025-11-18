import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, UserCheck, Calendar, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { UserData } from '../types/dashboard';
import { mentorshipRounds } from '../utils/mockData';

interface MentorshipStatsCardProps {
  allUsers: UserData[];
  selectedRound: string;
  onRoundChange: (roundId: string) => void;
}

export function MentorshipStatsCard({ allUsers, selectedRound, onRoundChange }: MentorshipStatsCardProps) {

  // Calculate mentorship statistics based on selected round
  const mentorshipStats = useMemo(() => {
    const participants = new Set<string>();
    let pairs = 0;
    let completedMeetings = 0;
    let totalMeetingHours = 0;

    allUsers.forEach(user => {
      user.mentorshipParticipation.forEach(participation => {
        // Filter by selected round (or include all if 'all' is selected)
        const isRoundMatch = selectedRound === 'all' || participation.roundId === selectedRound;
        
        if (isRoundMatch && 
            (participation.status === 'active' || participation.status === 'completed')) {
          participants.add(user.id);
          
          // Count pairs (each pair is counted once from mentor side)
          if (participation.role === 'mentor') {
            pairs++;
          }

          // Count completed meetings
          participation.meetings.forEach(meeting => {
            if (meeting.isCompleted) {
              completedMeetings++;
              // Assume each meeting is 1 hour
              totalMeetingHours += 1;
            }
          });
        }
      });
    });

    return {
      totalParticipants: participants.size,
      totalPairs: pairs,
      completedMeetings,
      totalMeetingHours,
    };
  }, [allUsers, selectedRound]);
  const stats = [
    {
      label: '参与人数',
      value: mentorshipStats.totalParticipants,
      icon: Users,
      color: 'bg-[#6035F3]',
    },
    {
      label: '导师学员匹配对',
      value: mentorshipStats.totalPairs,
      icon: UserCheck,
      color: 'bg-[#7C5CF5]',
    },
    {
      label: 'Completed会议',
      value: mentorshipStats.completedMeetings,
      icon: Calendar,
      color: 'bg-[#9883F7]',
    },
    {
      label: '累计会议时长（小时）',
      value: mentorshipStats.totalMeetingHours,
      icon: Clock,
      color: 'bg-[#4E2AC4]',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>导师活动统计</CardTitle>
          <div className="flex items-center gap-3">
            <Label htmlFor="round-select" className="text-sm">选择轮次:</Label>
            <Select value={selectedRound} onValueChange={onRoundChange}>
              <SelectTrigger id="round-select" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有轮次</SelectItem>
                {mentorshipRounds.map((round) => (
                  <SelectItem key={round.id} value={round.id}>
                    {round.name} {round.status === 'active' && '(当前)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-2xl mt-1">{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
