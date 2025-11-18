import { useState, useMemo } from 'react';
import { UserData } from '../types/dashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Search, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';

interface UserDataTableProps {
  users: UserData[];
}

type SortField = 'ldap' | 'name' | 'role' | 'jiraTickets' | 'mergedCLs' | 'meetingHours';
type SortDirection = 'asc' | 'desc';
type UserGroup = 'employees' | 'interns' | 'volunteers';

export function UserDataTable({ users }: UserDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('role');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedGroups, setSelectedGroups] = useState<UserGroup[]>(['employees', 'interns', 'volunteers']);
  const [includeTerminated, setIncludeTerminated] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleGroup = (group: UserGroup) => {
    setSelectedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const filteredAndSortedUsers = useMemo(() => {
    // Filter by selected groups and terminated status
    let filtered = users.filter((user) => {
      // Filter by terminated status
      if (!includeTerminated && user.isTerminated) return false;

      const roleMatch = 
        (selectedGroups.includes('employees') && user.role === 'circlecat_employee') ||
        (selectedGroups.includes('interns') && user.role === 'circlecat_intern') ||
        (selectedGroups.includes('volunteers') && user.role === 'circlecat_volunteer');
      
      if (!roleMatch) return false;

      // Filter by search term
      return (
        user.ldap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'ldap':
          aValue = a.ldap;
          bValue = b.ldap;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'jiraTickets':
          aValue = a.activityMetrics.jiraTickets;
          bValue = b.activityMetrics.jiraTickets;
          break;
        case 'mergedCLs':
          aValue = a.activityMetrics.mergedCLs;
          bValue = b.activityMetrics.mergedCLs;
          break;
        case 'meetingHours':
          aValue = a.activityMetrics.meetingHours;
          bValue = b.activityMetrics.meetingHours;
          break;
        default:
          aValue = a.role;
          bValue = b.role;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [users, searchTerm, sortField, sortDirection, selectedGroups, includeTerminated]);

  // Group users by role for display
  const groupedUsers = useMemo(() => {
    const groups = {
      employees: filteredAndSortedUsers.filter(u => u.role === 'circlecat_employee'),
      interns: filteredAndSortedUsers.filter(u => u.role === 'circlecat_intern'),
      volunteers: filteredAndSortedUsers.filter(u => u.role === 'circlecat_volunteer'),
    };
    return groups;
  }, [filteredAndSortedUsers]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      jiraTickets: 0,
      mergedCLs: 0,
      mergedLoc: 0,
      meetingHours: 0,
      chatMessages: 0,
    };

    filteredAndSortedUsers.forEach(user => {
      stats.jiraTickets += user.activityMetrics.jiraTickets;
      stats.mergedCLs += user.activityMetrics.mergedCLs;
      stats.mergedLoc += user.activityMetrics.mergedLoc;
      stats.meetingHours += user.activityMetrics.meetingHours;
      stats.chatMessages += user.activityMetrics.chatMessages;
    });

    return stats;
  }, [filteredAndSortedUsers]);

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      circlecat_employee: { label: 'Employee', variant: 'default' },
      circlecat_intern: { label: 'Intern', variant: 'secondary' },
      circlecat_volunteer: { label: 'Volunteer', variant: 'outline' },
      googler: { label: 'Googler', variant: 'default' },
      external_mentee: { label: 'Ext. Mentee', variant: 'secondary' },
    };

    const config = roleMap[role] || { label: role, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 px-2"
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  const renderUserRows = (userList: UserData[]) => {
    if (userList.length === 0) return null;

    return userList.map((user) => (
      <TableRow key={user.id} className={user.isTerminated ? 'opacity-50' : ''}>
        <TableCell>
          {user.ldap}
          {user.isTerminated && (
            <Badge variant="destructive" className="ml-2 text-xs">
              已离职
            </Badge>
          )}
        </TableCell>
        <TableCell>{user.name}</TableCell>
        <TableCell>{getRoleBadge(user.role)}</TableCell>
        <TableCell className="text-right">{user.activityMetrics.jiraTickets}</TableCell>
        <TableCell className="text-right">{user.activityMetrics.mergedCLs}</TableCell>
        <TableCell className="text-right">
          {user.activityMetrics.mergedLoc.toLocaleString()}
        </TableCell>
        <TableCell className="text-right">{user.activityMetrics.meetingHours}</TableCell>
        <TableCell className="text-right">{user.activityMetrics.chatMessages}</TableCell>
        <TableCell className="text-center">
          {user.mentorshipParticipation.length > 0 ? (
            <Badge variant="outline">
              {user.mentorshipParticipation.length} 个项目
            </Badge>
          ) : (
            <span className="text-gray-400 text-sm">无</span>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户详细数据表</CardTitle>
        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索 LDAP 或用户名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">显示分组:</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="employees" 
                    checked={selectedGroups.includes('employees')}
                    onCheckedChange={() => toggleGroup('employees')}
                  />
                  <Label htmlFor="employees" className="text-sm cursor-pointer">
                    Employees ({groupedUsers.employees.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="interns" 
                    checked={selectedGroups.includes('interns')}
                    onCheckedChange={() => toggleGroup('interns')}
                  />
                  <Label htmlFor="interns" className="text-sm cursor-pointer">
                    Interns ({groupedUsers.interns.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="volunteers" 
                    checked={selectedGroups.includes('volunteers')}
                    onCheckedChange={() => toggleGroup('volunteers')}
                  />
                  <Label htmlFor="volunteers" className="text-sm cursor-pointer">
                    Volunteers ({groupedUsers.volunteers.length})
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-terminated" 
                checked={includeTerminated}
                onCheckedChange={(checked) => setIncludeTerminated(checked as boolean)}
              />
              <Label htmlFor="include-terminated" className="text-sm cursor-pointer">
                Include Terminated Members
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Statistics */}
        {filteredAndSortedUsers.length > 0 && (
          <div className="mb-4 p-4 bg-[#6035F3]/5 rounded-lg border border-[#6035F3]/20">
            <h4 className="text-sm mb-3 text-[#6035F3]">工作活动汇总</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-xs text-gray-600">Jira Tickets</div>
                <div className="text-xl mt-1">{summaryStats.jiraTickets}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Merged CLs</div>
                <div className="text-xl mt-1">{summaryStats.mergedCLs}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Merged LOC</div>
                <div className="text-xl mt-1">{summaryStats.mergedLoc.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Meeting Hours</div>
                <div className="text-xl mt-1">{summaryStats.meetingHours}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Chat Messages</div>
                <div className="text-xl mt-1">{summaryStats.chatMessages}</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="ldap">LDAP</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="name">用户名</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="role">角色</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="jiraTickets">Jira Tickets</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="mergedCLs">Merged CLs</SortButton>
                </TableHead>
                <TableHead className="text-right">Merged LOC</TableHead>
                <TableHead className="text-right">
                  <SortButton field="meetingHours">Meeting Hours</SortButton>
                </TableHead>
                <TableHead className="text-right">Chat Messages</TableHead>
                <TableHead className="text-center">导师项目</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    没有找到匹配的用户
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {selectedGroups.includes('employees') && groupedUsers.employees.length > 0 && (
                    <>
                      <TableRow className="bg-[#6035F3]/10">
                        <TableCell colSpan={9} className="py-2">
                          <span className="text-sm text-[#6035F3]">
                            Employees ({groupedUsers.employees.length})
                          </span>
                        </TableCell>
                      </TableRow>
                      {renderUserRows(groupedUsers.employees)}
                    </>
                  )}
                  
                  {selectedGroups.includes('interns') && groupedUsers.interns.length > 0 && (
                    <>
                      <TableRow className="bg-[#7C5CF5]/10">
                        <TableCell colSpan={9} className="py-2">
                          <span className="text-sm text-[#7C5CF5]">
                            Interns ({groupedUsers.interns.length})
                          </span>
                        </TableCell>
                      </TableRow>
                      {renderUserRows(groupedUsers.interns)}
                    </>
                  )}
                  
                  {selectedGroups.includes('volunteers') && groupedUsers.volunteers.length > 0 && (
                    <>
                      <TableRow className="bg-[#9883F7]/10">
                        <TableCell colSpan={9} className="py-2">
                          <span className="text-sm text-[#9883F7]">
                            Volunteers ({groupedUsers.volunteers.length})
                          </span>
                        </TableCell>
                      </TableRow>
                      {renderUserRows(groupedUsers.volunteers)}
                    </>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          显示 {filteredAndSortedUsers.length} / {users.length} 个用户
        </div>
      </CardContent>
    </Card>
  );
}
