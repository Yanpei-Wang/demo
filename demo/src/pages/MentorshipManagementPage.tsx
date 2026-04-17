import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Pencil, Trash2, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { toast } from 'sonner';
import { MentorshipRound } from '../types/dashboard';
import { mentorshipRounds as initialRounds } from '../utils/mockData';
import { getRoundStatus } from '../utils/roundStatus';
import { ParticipantSearchPanel } from '../components/ParticipantSearchPanel';
import { AdminLeavePanel } from '../components/AdminLeavePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';


const PHASE_CONFIG = [
  { key: 'signUp' as const, label: 'Sign-up', color: 'bg-blue-500', mandatory: true, adminHint: 'Date to send recruitment email', ddlHint: 'Application deadline' },
  { key: 'onboarding' as const, label: 'Onboarding', color: 'bg-purple-500', mandatory: false, adminHint: 'Date to send onboarding email', ddlHint: 'Completion deadline' },
  { key: 'matching' as const, label: 'Matching', color: 'bg-green-500', mandatory: true, adminHint: 'Date to publish matching email', ddlHint: 'First contact with mentor' },
  { key: 'reminder' as const, label: 'Reminder', color: 'bg-orange-500', mandatory: false, adminHint: 'Mid-term reminder email', ddlHint: 'Complete required meetings' },
  { key: 'feedback' as const, label: 'Feedback', color: 'bg-red-500', mandatory: false, adminHint: 'Send feedback email', ddlHint: 'Feedback submission deadline' },
];

// Default timeline dates for different round types
const DEFAULT_TIMELINES = {
  spring: {
    signUp: { adminAction: '12/18', participantDDL: '12/25' },
    onboarding: { adminAction: '02/02', participantDDL: '02/09' },
    matching: { adminAction: '02/12', participantDDL: '02/26' },
    reminder: { adminAction: '04/02', participantDDL: '04/30' },
    feedback: { adminAction: '05/02', participantDDL: '05/09' },
  },
  summer: {
    signUp: { adminAction: '04/18', participantDDL: '04/25' },
    onboarding: { adminAction: '05/02', participantDDL: '05/09' },
    matching: { adminAction: '05/12', participantDDL: '05/26' },
    reminder: { adminAction: '07/02', participantDDL: '08/31' },
    feedback: { adminAction: '09/02', participantDDL: '09/09' },
  },
  fall: {
    signUp: { adminAction: '08/18', participantDDL: '08/25' },
    onboarding: { adminAction: '09/02', participantDDL: '09/09' },
    matching: { adminAction: '09/12', participantDDL: '09/26' },
    reminder: { adminAction: '11/02', participantDDL: '11/30' },
    feedback: { adminAction: '12/02', participantDDL: '12/09' },
  },
};

export function MentorshipManagementPage() {
  const [rounds, setRounds] = useState<MentorshipRound[]>(initialRounds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<MentorshipRound | null>(null);
  const [editingRound, setEditingRound] = useState<MentorshipRound | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'fall' | ''>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState<number>(new Date().getFullYear() - 4);
  const [formData, setFormData] = useState<{
    name: string;
    requiredMeetings: number;
    phases: {
      signUp: {
        adminAction: string;
        participantDDL: string;
      };
      onboarding: {
        adminAction: string;
        participantDDL: string;
      };
      matching: {
        adminAction: string;
        participantDDL: string;
      };
      reminder: {
        adminAction: string;
        participantDDL: string;
      };
      feedback: {
        adminAction: string;
        participantDDL: string;
      };
    };
  }>({
    name: '',
    requiredMeetings: 8,
    phases: {
      signUp: {
        adminAction: '',
        participantDDL: '',
      },
      onboarding: {
        adminAction: '',
        participantDDL: '',
      },
      matching: {
        adminAction: '',
        participantDDL: '',
      },
      reminder: {
        adminAction: '',
        participantDDL: '',
      },
      feedback: {
        adminAction: '',
        participantDDL: '',
      },
    },
  });

  // Helper function to detect round type from name
  const detectRoundType = (name: string): 'spring' | 'summer' | 'fall' | null => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('spring')) return 'spring';
    if (lowerName.includes('summer')) return 'summer';
    if (lowerName.includes('fall')) return 'fall';
    return null;
  };

  // Helper function to convert MM/DD to full date format (YYYY-MM-DD)
  const convertToFullDate = (shortDate: string, year: number): string => {
    const [month, day] = shortDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Helper function to apply default timeline based on round type and year
  const applyDefaultTimeline = (roundType: 'spring' | 'summer' | 'fall', year: number) => {
    const timeline = DEFAULT_TIMELINES[roundType];
    
    const convertedPhases = {
      signUp: {
        adminAction: convertToFullDate(timeline.signUp.adminAction, roundType === 'spring' && timeline.signUp.adminAction.startsWith('12') ? year - 1 : year),
        participantDDL: convertToFullDate(timeline.signUp.participantDDL, roundType === 'spring' && timeline.signUp.participantDDL.startsWith('12') ? year - 1 : year),
      },
      onboarding: {
        adminAction: convertToFullDate(timeline.onboarding.adminAction, year),
        participantDDL: convertToFullDate(timeline.onboarding.participantDDL, year),
      },
      matching: {
        adminAction: convertToFullDate(timeline.matching.adminAction, year),
        participantDDL: convertToFullDate(timeline.matching.participantDDL, year),
      },
      reminder: {
        adminAction: convertToFullDate(timeline.reminder.adminAction, year),
        participantDDL: convertToFullDate(timeline.reminder.participantDDL, year),
      },
      feedback: {
        adminAction: convertToFullDate(timeline.feedback.adminAction, year),
        participantDDL: convertToFullDate(timeline.feedback.participantDDL, year),
      },
    };

    setFormData(prev => ({
      ...prev,
      phases: convertedPhases,
    }));
  };

  const generateSuggestedName = (season: string, year: string) => {
    if (!season) return `Mentorship ${year}`;
    const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1);
    return `Mentorship ${year} ${capitalizedSeason}`;
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setYearPickerOpen(false);
    // Replace year in round name
    setFormData(prev => ({
      ...prev,
      name: prev.name.replace(/\d{4}/, year.toString()),
    }));
    // Re-apply timeline if season is selected and not editing
    if (selectedSeason && !editingRound) {
      applyDefaultTimeline(selectedSeason, year);
    }
  };

  const handleSeasonChange = (season: 'spring' | 'summer' | 'fall' | 'setNull') => {
    if (season === 'setNull') {
      setSelectedSeason('');
      setFormData(prev => ({
        ...prev,
        name: `Mentorship ${selectedYear}`,
        phases: {
          signUp: { adminAction: '', participantDDL: '' },
          onboarding: { adminAction: '', participantDDL: '' },
          matching: { adminAction: '', participantDDL: '' },
          reminder: { adminAction: '', participantDDL: '' },
          feedback: { adminAction: '', participantDDL: '' },
        }
      }));
    } else {
      setSelectedSeason(season);
      if (!editingRound) {
        const newName = generateSuggestedName(season, selectedYear.toString());
        setFormData(prev => ({ ...prev, name: newName }));
        applyDefaultTimeline(season, selectedYear);
      }
    }
  };

  // Parse existing round name to extract season and year
  const parseRoundName = (name: string): { season: 'spring' | 'summer' | 'fall' | '', year: string } => {
    const lowerName = name.toLowerCase();
    let season: 'spring' | 'summer' | 'fall' | '' = '';
    if (lowerName.includes('spring')) season = 'spring';
    else if (lowerName.includes('summer')) season = 'summer';
    else if (lowerName.includes('fall')) season = 'fall';
    
    const yearMatch = name.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
    
    return { season, year };
  };

  const handleOpenDialog = (round?: MentorshipRound) => {
    if (round) {
      setEditingRound(round);
      const parsed = parseRoundName(round.name);
      setSelectedSeason(parsed.season);
      setFormData({
        name: round.name,
        requiredMeetings: round.requiredMeetings,
        phases: round.phases,
      });
    } else {
      setEditingRound(null);
      setSelectedSeason('');
      setFormData({
        name: '',
        requiredMeetings: 8,
        phases: {
          signUp: {
            adminAction: '',
            participantDDL: '',
          },
          onboarding: {
            adminAction: '',
            participantDDL: '',
          },
          matching: {
            adminAction: '',
            participantDDL: '',
          },
          reminder: {
            adminAction: '',
            participantDDL: '',
          },
          feedback: {
            adminAction: '',
            participantDDL: '',
          },
        },
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRound(null);
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter round name');
      return;
    }
    if (formData.requiredMeetings < 1) {
      toast.error('Required meetings must be greater than 0');
      return;
    }

    // Validate phase deadlines
    const phaseKeys = ['signUp', 'onboarding', 'matching', 'reminder', 'feedback'] as const;
    const phaseLabels: Record<typeof phaseKeys[number], string> = {
      signUp: 'Sign-up',
      onboarding: 'Onboarding',
      matching: 'Matching',
      reminder: 'Reminder',
      feedback: 'Feedback',
    };

    // Check if all mandatory phase dates are filled
    const mandatoryPhases: (typeof phaseKeys[number])[] = ['signUp', 'matching'];
    for (const key of mandatoryPhases) {
      if (!formData.phases[key].adminAction || !formData.phases[key].participantDDL) {
        toast.error(`Please set all dates for ${phaseLabels[key]} phase`);
        return;
      }
    }

    // Reject phases with only one date filled
    for (const key of phaseKeys) {
      const { adminAction, participantDDL } = formData.phases[key];
      if (Boolean(adminAction) !== Boolean(participantDDL)) {
        toast.error(`${phaseLabels[key]}: please fill both admin action date and participant DDL`);
        return;
      }
    }

    // Validate ordering for fully configured phases
    const configuredPhases = phaseKeys
      .filter(key => formData.phases[key].adminAction && formData.phases[key].participantDDL)
      .map(key => ({
        label: phaseLabels[key],
        adminDate: new Date(formData.phases[key].adminAction),
        ddlDate: new Date(formData.phases[key].participantDDL),
      }));

    for (let i = 0; i < configuredPhases.length; i++) {
      const { label, adminDate, ddlDate } = configuredPhases[i];

      if (ddlDate <= adminDate) {
        toast.error(`${label}: participant DDL must be after admin action date`);
        return;
      }

      if (i > 0 && adminDate <= configuredPhases[i - 1].ddlDate) {
        toast.error(`${label} must start after ${configuredPhases[i - 1].label} ends`);
        return;
      }
    }

    if (editingRound) {
      // Update existing round
      setRounds(rounds.map(round =>
        round.id === editingRound.id
          ? { ...round, ...formData }
          : round
      ));
      toast.success('Round information updated');
    } else {
      // Create new round
      const newRound: MentorshipRound = {
        id: `round-${Date.now()}`,
        ...formData,
      };
      setRounds([newRound, ...rounds]);
      toast.success('New round created');
    }

    handleCloseDialog();
  };

  const handleDelete = (round: MentorshipRound) => {
    setRoundToDelete(round);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (roundToDelete) {
      setRounds(rounds.filter(r => r.id !== roundToDelete.id));
      toast.success('Round deleted');
    }
    setIsDeleteDialogOpen(false);
  };

  {/* const handleDelete = (round: MentorshipRound) => {
    if (window.confirm(`Are you sure you want to delete "${round.name}"? This action cannot be undone.`)) {
      setRounds(rounds.filter(r => r.id !== round.id));
      toast.success('Round deleted');
    }
  }; */}

  const updatePhaseDate = (
    phase: keyof typeof formData.phases,
    type: 'adminAction' | 'participantDDL',
    value: string
  ) => {
    setFormData({
      ...formData,
      phases: {
        ...formData.phases,
        [phase]: {
          ...formData.phases[phase],
          [type]: value,
        },
      },
    });
  };

  const completedRounds = rounds.filter(r => getRoundStatus(r) === 'completed').length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mentorship">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="mentorship" className="data-[state=active]:bg-white data-[state=active]:text-[#6035F3]">导师匹配管理</TabsTrigger>
          <TabsTrigger value="leave" className="data-[state=active]:bg-white data-[state=active]:text-[#6035F3]">假期管理</TabsTrigger>
        </TabsList>

        <TabsContent value="mentorship" className="mt-4 space-y-6">
      {/* Rounds Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Mentorship Round Management</CardTitle>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Round
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Round Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Participants</TableHead>
                  <TableHead className="font-semibold text-gray-700">Required Meetings</TableHead>
                  <TableHead className="font-semibold text-gray-700">Meeting Log Completion</TableHead>
                  <TableHead className="font-semibold text-gray-700">Mentor Rating</TableHead>
                  <TableHead className="font-semibold text-gray-700">Mentee Rating</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                      No rounds data. Click the button above to create the first round
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {rounds.map((round) => (
                      <TableRow
                        key={round.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">{round.name}</TableCell>
                        <TableCell className="text-gray-900">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            {round.participants || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 font-semibold">
                          {round.requiredMeetings} times
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const r = round as any;
                            const pairs = Math.floor((r.participants || 0) / 2);
                            if (pairs === 0) return <span className="text-gray-400">—</span>;
                            const pct = Math.round((r.completedMeetings || 0) / (pairs * round.requiredMeetings) * 100);
                            const color = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
                            return <span className={`font-semibold ${color}`}>{pct}%</span>;
                          })()}
                        </TableCell>
                        <TableCell>
                          {(round as any).mentorRating != null
                            ? <span className="font-semibold text-gray-900">{(round as any).mentorRating.toFixed(1)}</span>
                            : <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell>
                          {(round as any).menteeRating != null
                            ? <span className="font-semibold text-gray-900">{(round as any).menteeRating.toFixed(1)}</span>
                            : <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(round)}
                              className="hover:bg-purple-50 hover:text-[#6035F3] transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(round)}
                              className="hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell colSpan={6} className="text-gray-900">
                        Total Completed Rounds: {completedRounds}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingRound ? 'Edit Round' : 'Create New Round'}
            </DialogTitle>
            <DialogDescription>
              {editingRound 
                ? 'Update the round information and phase timeline dates below.' 
                : 'Fill in the round information and set up the phase timeline.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Round Name */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">
                Round Name <span className="text-red-500">*</span>
              </Label>
              {/* Select Season and Year */}
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select value={selectedSeason} onValueChange={handleSeasonChange}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="setNull">
                          Reset Timeline
                        </SelectItem>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                        <SelectItem value="fall">Fall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Year picker */}
                  <Popover open={yearPickerOpen} onOpenChange={setYearPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-28 border-gray-300 font-semibold"
                      >
                        <Calendar className="h-4 w-4 mr-2 text-[#6035F3]" />
                        {selectedYear}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3" align="end">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setYearRangeStart((y: number) => y - 12)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-xs font-semibold text-gray-600">
                            {yearRangeStart} – {yearRangeStart + 11}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setYearRangeStart((y: number) => y + 12)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(year => (
                            <Button
                              key={year}
                              variant={year === selectedYear ? 'default' : 'ghost'}
                              size="sm"
                              className={`h-8 text-sm ${year === selectedYear ? 'bg-[#6035F3] hover:bg-[#4A28C4] text-white' : 'hover:bg-purple-50 hover:text-[#6035F3]'}`}
                              onClick={() => handleYearChange(year)}
                            >
                              {year}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {!editingRound && (
                  <p className="text-sm text-gray-500">
                    {selectedSeason 
                      ? `Timeline defaults for ${new Date().getFullYear()} have been auto-filled below.` 
                      : "Select season to auto-fill timeline with default values."}
                  </p>
                )}
              </div>
              
              {/* Final displayed round name */}
              <div className="space-y-2">
                <Label htmlFor="manualName" className="text-xs text-gray-500">Final Round Name</Label>
                <Input
                  id="manualName"
                  placeholder="e.g. Mentorship 2026 Spring"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-gray-300 font-semibold text-[#6035F3]"
                />
                <p className="text-sm text-gray-500">
                  This name is auto-generated, but you can manually override it as needed (e.g., 'Pilot Round' or '2025 3rd Round').
                </p>
              </div>
            </div>

            {/* Required Meetings */}
            <div className="space-y-2">
              <Label htmlFor="requiredMeetings" className="text-sm font-semibold text-gray-700">
                Required Meetings <span className="text-red-500">*</span>
              </Label>
              <Input
                id="requiredMeetings"
                type="number"
                min="1"
                placeholder="8"
                value={formData.requiredMeetings}
                onChange={(e) =>
                  setFormData({ ...formData, requiredMeetings: parseInt(e.target.value) || 0 })
                }
                className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
              />
              <p className="text-sm text-gray-500">
                Minimum number of meetings participants need to complete
              </p>
            </div>

            {/* Phase Timeline Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#6035F3]" />
                <Label className="text-sm font-semibold text-gray-700">
                  Phase Timeline
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Set the admin action date and participant deadline for each phase
              </p>
              
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700 w-1/4">Phase</TableHead>
                      <TableHead className="font-semibold text-gray-700 w-3/8">Admin Action</TableHead>
                      <TableHead className="font-semibold text-gray-700 w-3/8">Participant DDL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PHASE_CONFIG.map(({ key, label, color, mandatory, adminHint, ddlHint }) => (
                      <TableRow key={key} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color}`} />
                            {label}
                          </div>
                        </TableCell>
                        {(['adminAction', 'participantDDL'] as const).map((type) => (
                          <TableCell key={type}>
                            <div className="space-y-1">
                              {mandatory ? (
                                <>
                                  <div className="flex items-start">
                                    <Input
                                      type="date"
                                      value={formData.phases[key][type]}
                                      onChange={(e) => updatePhaseDate(key, type, e.target.value)}
                                      className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                                    />
                                    <span className="text-red-500 font-bold text-sm leading-none ml-0.5 mt-0.5 flex-shrink-0">*</span>
                                  </div>
                                  <p className="text-xs text-gray-500">{type === 'adminAction' ? adminHint : ddlHint}</p>
                                </>
                              ) : (
                                <>
                                  <Input
                                    type="date"
                                    value={formData.phases[key][type]}
                                    onChange={(e) => updatePhaseDate(key, type, e.target.value)}
                                    className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                                  />
                                  <p className="text-xs text-gray-500">{type === 'adminAction' ? adminHint : ddlHint}</p>
                                </>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-gray-500">
                Note: Each phase's Admin Action should be before its Participant DDL, and phases should be in chronological order
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md"
            >
              {editingRound ? 'Save Changes' : 'Create Round'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 text-center">
              Delete Round
            </DialogTitle>
            <DialogDescription className="text-center">
              This action cannot be undone. Please confirm you want to delete this round.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex-shrink-0 mt-0.5">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">{roundToDelete?.name}</span>?
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  All associated data will be permanently removed.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Round
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ParticipantSearchPanel />
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <AdminLeavePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}