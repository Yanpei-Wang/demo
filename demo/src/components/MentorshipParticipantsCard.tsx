import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { UserData } from '../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface MentorshipParticipantsCardProps {
  allUsers: UserData[];
  selectedRound: string; // 'all' or specific round id
}

interface ParticipantInfo {
  id: string;
  name: string;
  ldap: string;
  userType: string;
  isInternal: boolean;
  roles: Set<'mentor' | 'mentee'>;
  mentorCount: number;
  menteeCount: number;
}

export function MentorshipParticipantsCard({ allUsers, selectedRound }: MentorshipParticipantsCardProps) {
  // Calculate participant statistics
  const participantData = useMemo(() => {
    const participantMap = new Map<string, ParticipantInfo>();
    
    allUsers.forEach(user => {
      user.mentorshipParticipation.forEach(participation => {
        // Filter by selected round
        const isRoundMatch = selectedRound === 'all' || participation.roundId === selectedRound;
        
        if (isRoundMatch && (participation.status === 'active' || participation.status === 'completed')) {
          if (!participantMap.has(user.id)) {
            // Only circlecat_* roles are internal
            const isInternal = user.role.startsWith('circlecat_');
            const userType = isInternal ? 'Internal' : 'External';

            participantMap.set(user.id, {
              id: user.id,
              name: user.name,
              ldap: user.ldap,
              userType,
              isInternal,
              roles: new Set(),
              mentorCount: 0,
              menteeCount: 0,
            });
          }

          const participant = participantMap.get(user.id)!;
          participant.roles.add(participation.role);
          
          if (participation.role === 'mentor') {
            participant.mentorCount++;
          } else {
            participant.menteeCount++;
          }
        }
      });
    });

    return Array.from(participantMap.values());
  }, [allUsers, selectedRound]);

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const stats = {
      internalMentor: 0,
      externalMentor: 0,
      internalMentee: 0,
      externalMentee: 0,
      totalInternal: 0,
      totalExternal: 0,
    };

    participantData.forEach(participant => {
      if (participant.isInternal) {
        stats.totalInternal++;
        if (participant.roles.has('mentor')) stats.internalMentor++;
        if (participant.roles.has('mentee')) stats.internalMentee++;
      } else {
        stats.totalExternal++;
        if (participant.roles.has('mentor')) stats.externalMentor++;
        if (participant.roles.has('mentee')) stats.externalMentee++;
      }
    });

    return stats;
  }, [participantData]);

  // Chart data - Stacked bar chart
  const chartData = [
    { 
      name: 'Mentor', 
      Internal: categoryStats.internalMentor, 
      External: categoryStats.externalMentor 
    },
    { 
      name: 'Mentee', 
      Internal: categoryStats.internalMentee, 
      External: categoryStats.externalMentee 
    },
  ];

  // Color scheme - harmonious with brand purple
  const COLORS = {
    internal: '#6035F3',      // Brand purple
    external: '#F59E0B',      // Warm amber/orange
    internalLight: '#8B6EF7', // Light purple
    externalLight: '#FCD34D', // Light amber
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>导师活动参与者分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart - Stacked Bar Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Internal" stackId="a" fill={COLORS.internal} radius={[0, 0, 0, 0]} />
              <Bar dataKey="External" stackId="a" fill={COLORS.external} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Participants Table */}
        <div>
          <h3 className="mb-3">参与者列表</h3>
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>LDAP</TableHead>
                  <TableHead>用户类型</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead className="text-right">Mentor 次数</TableHead>
                  <TableHead className="text-right">Mentee 次数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      暂无参与者数据
                    </TableCell>
                  </TableRow>
                ) : (
                  participantData.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>{participant.name}</TableCell>
                      <TableCell>{participant.ldap}</TableCell>
                      <TableCell>
                        <Badge 
                          style={{ 
                            backgroundColor: participant.isInternal ? COLORS.internal : COLORS.external,
                            color: 'white',
                            fontWeight: '600'
                          }}
                        >
                          {participant.userType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {participant.roles.has('mentor') && (
                            <Badge style={{ 
                              backgroundColor: COLORS.internalLight, 
                              color: 'white',
                              fontWeight: '600'
                            }}>
                              Mentor
                            </Badge>
                          )}
                          {participant.roles.has('mentee') && (
                            <Badge style={{ 
                              backgroundColor: '#7C5CF5', 
                              color: 'white',
                              fontWeight: '600'
                            }}>
                              Mentee
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{participant.mentorCount}</TableCell>
                      <TableCell className="text-right">{participant.menteeCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
