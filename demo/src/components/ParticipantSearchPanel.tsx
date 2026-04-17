import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Search, Download, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { generateMockDataset, mentorshipRounds } from '../utils/mockData';
import { MentorshipMeeting, UserData } from '../types/dashboard';

interface ParticipantRow {
  userId: string;
  name: string;
  email: string;
  matchedUser: string;
  role: 'mentor' | 'mentee';
  roundId: string;
  roundName: string;
  matchingStatus: 'matched' | 'unmatched';
  onboardingStatus: 'completed' | 'incomplete';
  completedMeetings: number;
  requiredMeetings: number;
  meetings: MentorshipMeeting[];
}

function getMeetingLabel(index: number, total: number): string {
  const num = index + 1;
  if (index === 0) return `Meeting ${num}`;
  if (index === Math.floor((total - 1) / 2)) return `Meeting ${num} `;
  if (index === total - 1) return `Meeting ${num}`;
  return `Meeting ${num}`;
}

const PAST_NOTES = [
  'Insufficient duration',
  'Unknown absence',
  null, // partner absent — filled with name
  'Unknown late arrival',
  null, // partner late — filled with name
];

function getMeetingNote(meeting: MentorshipMeeting, index: number): string {
  if ((meeting as any).note) return (meeting as any).note;
  if (meeting.isCompleted) return '';
  const now = new Date();
  if (new Date(meeting.date) > now) return 'Not yet scheduled';
  const pattern = index % PAST_NOTES.length;
  if (pattern === 2) return `${meeting.partnerName} absent`;
  if (pattern === 4) return `${meeting.partnerName} late arrival`;
  return PAST_NOTES[pattern] as string;
}

function buildRows(users: UserData[]): ParticipantRow[] {
  const roundMap = new Map((mentorshipRounds as any[]).map((r) => [r.id, r]));
  const rows: ParticipantRow[] = [];

  for (const user of users) {
    const email = `${user.ldap}@circlecat.org`;
    for (const p of user.mentorshipParticipation) {
      const round = roundMap.get(p.roundId);
      rows.push({
        userId: user.id,
        name: user.name,
        email,
        matchedUser: p.partnerNames.join(', '),
        role: p.role,
        roundId: p.roundId,
        roundName: round?.name ?? p.programName,
        matchingStatus: p.status !== 'pending' ? 'matched' : 'unmatched',
        onboardingStatus: p.status !== 'pending' ? 'completed' : 'incomplete',
        completedMeetings: p.meetings.filter((m) => m.isCompleted).length,
        requiredMeetings: round?.requiredMeetings ?? p.meetings.length,
        meetings: p.meetings,
      });
    }
  }
  return rows;
}

const EMPTY_FILTERS = {
  name: '',
  email: '',
  matchedUser: '',
  role: 'all',
  roundId: 'all',
  onboardingStatus: 'all',
  matchingStatus: 'all',
};

type SortKey = 'name' | 'matchedUser' | 'roundName' | 'matchingStatus' | 'onboardingStatus';
type SortDir = 'asc' | 'desc';

export function ParticipantSearchPanel() {
  const allRows = useMemo(() => buildRows(generateMockDataset()), []);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [results, setResults] = useState<ParticipantRow[] | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [trackerRow, setTrackerRow] = useState<ParticipantRow | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMeetings, setEditedMeetings] = useState<Array<{
    id: string; isCompleted: boolean; date: string; startTime: string; endTime: string; note: string;
  }>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const set = (key: keyof typeof EMPTY_FILTERS) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedResults = useMemo(() => {
    if (!results || !sortKey) return results;
    return [...results].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [results, sortKey, sortDir]);

  const handleSearch = () => {
    const q = filters;
    setResults(
      allRows.filter((row) => {
        if (q.name && !row.name.toLowerCase().includes(q.name.toLowerCase())) return false;
        if (q.email && !row.email.toLowerCase().includes(q.email.toLowerCase())) return false;
        if (q.matchedUser && !row.matchedUser.toLowerCase().includes(q.matchedUser.toLowerCase())) return false;
        if (q.role !== 'all' && row.role !== q.role) return false;
        if (q.roundId !== 'all' && row.roundId !== q.roundId) return false;
        if (q.onboardingStatus !== 'all' && row.onboardingStatus !== q.onboardingStatus) return false;
        if (q.matchingStatus !== 'all' && row.matchingStatus !== q.matchingStatus) return false;
        return true;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const downloadCsv = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const escapeCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const handleExportSimple = () => {
    if (!results) return;
    const headers = ['Name', 'Email', 'Matched User', 'Role', 'Round', 'Matching Status', 'Onboarding Status', 'Completed Meetings', 'Required Meetings'];
    const rows = results.map((row) => [
      row.name, row.email, row.matchedUser || '',
      row.role === 'mentor' ? 'Mentor' : 'Mentee',
      row.roundName,
      row.matchingStatus === 'matched' ? 'Matched' : 'Unmatched',
      row.onboardingStatus === 'completed' ? 'Completed' : 'Incomplete',
      row.matchingStatus === 'unmatched' ? '' : String(row.completedMeetings),
      row.matchingStatus === 'unmatched' ? '' : String(row.requiredMeetings),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escapeCell).join(',')).join('\n');
    downloadCsv(csv, `participants_${new Date().toISOString().slice(0, 10)}.csv`);
    setExportDialogOpen(false);
  };

  const handleExportDetailed = () => {
    if (!results) return;
    const headers = ['Name', 'Email', 'Matched User', 'Role', 'Round', 'Matching Status', 'Onboarding Status', 'Meeting Stage', 'Complete Status', 'Datetime', 'Note'];
    const rows: string[][] = [];
    results.forEach((row) => {
      const total = row.requiredMeetings;
      Array.from({ length: total }, (_, i) => row.meetings[i] ?? null).forEach((meeting, idx) => {
        const label = getMeetingLabel(idx, total);
        const completed = meeting?.isCompleted ?? false;
        const datetime = meeting ? `${meeting.date} ${meeting.startTime ?? ''}-${meeting.endTime ?? ''}` : '';
        const note = meeting ? getMeetingNote(meeting, idx) : 'Not yet scheduled';
        rows.push([
          row.name, row.email, row.matchedUser || '',
          row.role === 'mentor' ? 'Mentor' : 'Mentee',
          row.roundName,
          row.matchingStatus === 'matched' ? 'Matched' : 'Unmatched',
          row.onboardingStatus === 'completed' ? 'Completed' : 'Incomplete',
          label,
          completed ? 'Completed' : 'Not Completed',
          completed ? datetime : '',
          note,
        ]);
      });
    });
    const csv = [headers, ...rows].map((r) => r.map(escapeCell).join(',')).join('\n');
    downloadCsv(csv, `participants_detailed_${new Date().toISOString().slice(0, 10)}.csv`);
    setExportDialogOpen(false);
  };

  // Meetings to show in tracker: up to requiredMeetings slots
  const trackerMeetings = useMemo(() => {
    if (!trackerRow) return [];
    const total = trackerRow.requiredMeetings;
    const slots = Array.from({ length: total }, (_, i) => trackerRow.meetings[i] ?? null);
    return slots;
  }, [trackerRow]);

  const getNoteOptions = (partnerName: string) => [
    { value: 'none',                           label: '(none — completed only)' },
    { value: 'Insufficient duration',         label: 'Insufficient duration' },
    { value: 'Unknown absence',               label: 'Unknown absence' },
    { value: `${partnerName} absent`,         label: `${partnerName} absent` },
    { value: 'Unknown late arrival',          label: 'Unknown late arrival' },
    { value: `${partnerName} late arrival`,   label: `${partnerName} late arrival` },
    { value: 'Not yet scheduled',             label: 'Not yet scheduled' },
  ];

  const handleEnterEdit = () => {
    setEditedMeetings(trackerMeetings.map((m, i) => ({
      id: m?.id ?? `slot-${i}`,
      isCompleted: m?.isCompleted ?? false,
      date: m?.date ?? '',
      startTime: m?.startTime ?? '',
      endTime: m?.endTime ?? '',
      note: (m as any)?.note ?? (m && !m.isCompleted ? getMeetingNote(m, i) : ''),
    })));
    setSelectedIds(new Set());
    setEditMode(true);
  };

  const handleCancelEdit = () => { setEditMode(false); setSelectedIds(new Set()); };

  const updateEditedMeeting = (id: string, field: string, value: string | boolean) => {
    setEditedMeetings((prev) => prev.map((m) => {
      if (m.id !== id) return m;
      const updated = { ...m, [field]: value };
      if (field === 'note' && value === '') updated.isCompleted = true;
      if (field === 'isCompleted' && value === false && m.note === '') updated.note = 'Unknown absence';
      return updated;
    }));
  };

  const handleDeleteMeeting = (id: string) => {
    setEditedMeetings((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleDeleteSelected = () => {
    setEditedMeetings((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.size === editedMeetings.length ? new Set() : new Set(editedMeetings.map((m) => m.id)));

  const handleSaveEdit = () => {
    if (!trackerRow || !results) return;
    const updatedMeetings = editedMeetings.map((em) => {
      const orig = trackerRow.meetings.find((m) => m.id === em.id);
      return { ...(orig ?? {}), id: em.id, isCompleted: em.isCompleted, date: em.date, startTime: em.startTime, endTime: em.endTime, time: `${em.startTime} - ${em.endTime}`, note: em.note, partnerName: orig?.partnerName ?? trackerRow.matchedUser, partnerEmail: orig?.partnerEmail ?? '', duration: orig?.duration ?? 60 };
    });
    const completedCount = updatedMeetings.filter((m) => m.isCompleted).length;
    const updatedRow = { ...trackerRow, meetings: updatedMeetings as any, completedMeetings: completedCount, requiredMeetings: updatedMeetings.length };
    setTrackerRow(updatedRow);
    setResults(results.map((r) => r.userId === trackerRow.userId && r.roundId === trackerRow.roundId ? updatedRow : r));
    setEditMode(false);
    setSelectedIds(new Set());
  };

  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Participant Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Filters */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <Input
                placeholder="Name"
                value={filters.name}
                onChange={(e) => set('name')(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-white border-gray-200"
              />
              <Input
                placeholder="Email"
                value={filters.email}
                onChange={(e) => set('email')(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-white border-gray-200"
              />
              <Input
                placeholder="Matched User"
                value={filters.matchedUser}
                onChange={(e) => set('matchedUser')(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-white border-gray-200"
              />
            </div>
            <div className="flex gap-3">
              <Select value={filters.role} onValueChange={set('role')}>
                <SelectTrigger className="w-32 bg-white border-gray-200">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="mentee">Mentee</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.roundId} onValueChange={set('roundId')}>
                <SelectTrigger className="flex-1 bg-white border-gray-200">
                  <SelectValue placeholder="Round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rounds</SelectItem>
                  {(mentorshipRounds as any[]).map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.onboardingStatus} onValueChange={set('onboardingStatus')}>
                <SelectTrigger className="w-44 bg-white border-gray-200">
                  <SelectValue placeholder="Onboarding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Onboarding</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.matchingStatus} onValueChange={set('matchingStatus')}>
                <SelectTrigger className="w-40 bg-white border-gray-200">
                  <SelectValue placeholder="Matching" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matching</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="unmatched">Unmatched</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className="bg-[#6035F3] hover:bg-[#4A28C4] text-white px-6 shrink-0"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Results */}
          {results !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {results.length === 0 ? 'No results found' : `${results.length} result${results.length > 1 ? 's' : ''} found`}
                </p>
                {results.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>

              {results.length > 0 && (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        {(
                          [
                            { key: 'name' as SortKey, label: 'Name' },
                            { key: null, label: 'Email' },
                            { key: 'matchedUser' as SortKey, label: 'Matched User' },
                            { key: null, label: 'Role' },
                            { key: 'roundName' as SortKey, label: 'Round' },
                            { key: 'matchingStatus' as SortKey, label: 'Matching Status' },
                            { key: 'onboardingStatus' as SortKey, label: 'Onboarding Status' },
                            { key: null, label: 'Meeting Log' },
                          ] as { key: SortKey | null; label: string }[]
                        ).map(({ key, label }) =>
                          key ? (
                            <TableHead
                              key={label}
                              className="font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-100"
                              onClick={() => handleSort(key)}
                            >
                              <div className="flex items-center gap-1">
                                {label}
                                {sortKey === key ? (
                                  sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-[#6035F3]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#6035F3]" />
                                ) : (
                                  <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
                                )}
                              </div>
                            </TableHead>
                          ) : (
                            <TableHead key={label} className="font-semibold text-gray-700">{label}</TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(sortedResults ?? results).map((row, i) => (
                        <TableRow key={`${row.userId}-${row.roundId}-${i}`} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{row.name}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{row.email}</TableCell>
                          <TableCell className="text-gray-900 text-sm">{row.matchedUser || '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                row.role === 'mentor'
                                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                                  : 'border-blue-200 bg-blue-50 text-blue-700'
                              }
                            >
                              {row.role === 'mentor' ? 'Mentor' : 'Mentee'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900 text-sm">{row.roundName}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                row.matchingStatus === 'matched'
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-500'
                              }
                            >
                              {row.matchingStatus === 'matched' ? 'Matched' : 'Unmatched'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                row.onboardingStatus === 'completed'
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : 'border-orange-200 bg-orange-50 text-orange-700'
                              }
                            >
                              {row.onboardingStatus === 'completed' ? 'Completed' : 'Incomplete'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {row.matchingStatus === 'unmatched' ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              <button
                                onClick={() => setTrackerRow(row)}
                                className="font-medium text-[#6035F3] hover:underline cursor-pointer"
                              >
                                {row.completedMeetings}/{row.requiredMeetings}
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Log Tracker Dialog */}
      <Dialog open={!!trackerRow} onOpenChange={(open) => { if (!open) { setTrackerRow(null); setEditMode(false); setSelectedIds(new Set()); } }}>
        <DialogContent className="sm:max-w-[860px] bg-white border-gray-200">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Meeting Log — {trackerRow?.name} · {trackerRow?.roundName}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {editMode && selectedIds.size > 0 && (
                  <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete ({selectedIds.size})
                  </Button>
                )}
                {!editMode ? (
                  <Button size="sm" variant="outline" onClick={handleEnterEdit} className="border-gray-300 text-gray-700 hover:bg-gray-50">Edit</Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</Button>
                    <Button size="sm" onClick={handleSaveEdit} className="bg-[#6035F3] hover:bg-[#4A28C4] text-white">Save</Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-lg border border-gray-200 overflow-hidden mt-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  {editMode && (
                    <TableHead className="w-10 pl-3">
                      <input type="checkbox" className="rounded border-gray-300 cursor-pointer"
                        checked={editedMeetings.length > 0 && selectedIds.size === editedMeetings.length}
                        onChange={toggleSelectAll} />
                    </TableHead>
                  )}
                  <TableHead className="font-semibold text-gray-700">Meeting Stage</TableHead>
                  <TableHead className="font-semibold text-gray-700">Complete Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Datetime</TableHead>
                  <TableHead className="font-semibold text-gray-700">Note</TableHead>
                  {editMode && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {editMode ? (
                  editedMeetings.map((em, idx) => {
                    const total = editedMeetings.length;
                    const label = getMeetingLabel(idx, total);
                    const partnerName = trackerRow?.matchedUser ?? '';
                    const noteOptions = getNoteOptions(partnerName);
                    return (
                      <TableRow key={em.id} className="align-top hover:bg-gray-50">
                        <TableCell className="pl-3 pt-3">
                          <input type="checkbox" className="rounded border-gray-300 cursor-pointer"
                            checked={selectedIds.has(em.id)} onChange={() => toggleSelect(em.id)} />
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 text-sm pt-3">{label}</TableCell>
                        <TableCell className="pt-2">
                          <Select
                            value={em.isCompleted ? 'completed' : 'not_completed'}
                            onValueChange={(v) => updateEditedMeeting(em.id, 'isCompleted', v === 'completed')}
                          >
                            <SelectTrigger className={`w-36 h-8 text-sm ${em.note === '' && !em.isCompleted ? 'border-red-400' : 'border-gray-300'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="not_completed">Not Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm pt-3">
                          {em.date ? `${em.date} · ${em.startTime} – ${em.endTime}` : '—'}
                        </TableCell>
                        <TableCell className="pt-2">
                          <Select value={em.note === '' ? 'none' : em.note} onValueChange={(v) => updateEditedMeeting(em.id, 'note', v === 'none' ? '' : v)}>
                            <SelectTrigger className="h-8 text-sm border-gray-300 w-48">
                              <SelectValue placeholder="Select note…" />
                            </SelectTrigger>
                            <SelectContent>
                              {noteOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="pt-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMeeting(em.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  trackerMeetings.map((meeting, idx) => {
                    const total = trackerRow?.requiredMeetings ?? trackerMeetings.length;
                    const label = getMeetingLabel(idx, total);
                    const completed = meeting?.isCompleted ?? false;
                    const datetime = meeting ? `${meeting.date} · ${meeting.startTime ?? ''} – ${meeting.endTime ?? ''}` : '—';
                    const note = meeting ? getMeetingNote(meeting, idx) : 'Not yet scheduled';
                    return (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900 text-sm">{label}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={completed ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}>
                            {completed ? 'Completed' : 'Not Completed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">{meeting ? datetime : '—'}</TableCell>
                        <TableCell className="text-gray-500 text-sm">{note}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export confirmation dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Export CSV</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm pt-1">
              Include detailed meeting log tracking for each participant?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleExportSimple} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
              No — summary only
            </Button>
            <Button onClick={handleExportDetailed} className="flex-1 bg-[#6035F3] hover:bg-[#4A28C4] text-white">
              Yes — include tracking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
