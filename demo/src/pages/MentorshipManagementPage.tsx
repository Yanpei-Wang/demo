import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Calendar, Users, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MentorshipRound } from '../types/dashboard';
import { mentorshipRounds as initialRounds } from '../utils/mockData';

export function MentorshipManagementPage() {
  const [rounds, setRounds] = useState<MentorshipRound[]>(initialRounds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<MentorshipRound | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed';
    requiredMeetings: number;
    phases: {
      registration: string;
      matching: string;
      inProgress: string;
      summary: string;
      completed: string;
    };
  }>({
    name: '',
    startDate: '',
    endDate: '',
    status: 'active',
    requiredMeetings: 8,
    phases: {
      registration: '',
      matching: '',
      inProgress: '',
      summary: '',
      completed: '',
    },
  });

  const handleOpenDialog = (round?: MentorshipRound) => {
    if (round) {
      setEditingRound(round);
      setFormData({
        name: round.name,
        startDate: round.startDate,
        endDate: round.endDate,
        status: round.status,
        requiredMeetings: round.requiredMeetings,
        phases: round.phases,
      });
    } else {
      setEditingRound(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        status: 'active',
        requiredMeetings: 8,
        phases: {
          registration: '',
          matching: '',
          inProgress: '',
          summary: '',
          completed: '',
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
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start date and end date');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }
    if (formData.requiredMeetings < 1) {
      toast.error('Required meetings must be greater than 0');
      return;
    }

    // Validate phase deadlines
    const phaseKeys = ['registration', 'matching', 'inProgress', 'summary', 'completed'] as const;
    const phaseLabels: Record<typeof phaseKeys[number], string> = {
      registration: 'Registration',
      matching: 'Matching',
      inProgress: 'In Progress',
      summary: 'Summary',
      completed: 'Completed',
    };

    for (const key of phaseKeys) {
      if (!formData.phases[key]) {
        toast.error(`Please set ${phaseLabels[key]} deadline`);
        return;
      }
    }

    // Validate phase deadlines are in order
    const phaseDates = phaseKeys.map(key => new Date(formData.phases[key]));
    for (let i = 1; i < phaseDates.length; i++) {
      if (phaseDates[i] <= phaseDates[i - 1]) {
        toast.error(`${phaseLabels[phaseKeys[i]]} deadline must be after ${phaseLabels[phaseKeys[i - 1]]} deadline`);
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
    if (window.confirm(`Are you sure you want to delete "${round.name}"? This action cannot be undone.`)) {
      setRounds(rounds.filter(r => r.id !== round.id));
      toast.success('Round deleted');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const updatePhaseDeadline = (phase: keyof typeof formData.phases, value: string) => {
    setFormData({
      ...formData,
      phases: {
        ...formData.phases,
        [phase]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#171717' }}>
            Mentorship Round Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all mentorship program rounds' basic information and requirements</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Round
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="h-6 w-6 text-[#6035F3]" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{rounds.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {rounds.filter(r => r.status === 'active').length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {rounds.filter(r => r.status === 'completed').length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rounds Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">All Rounds</CardTitle>
          <CardDescription>View and manage all Mentorship program rounds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Round Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Start Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">End Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Required Meetings</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      No rounds data. Click the button above to create the first round
                    </TableCell>
                  </TableRow>
                ) : (
                  rounds.map((round) => (
                    <TableRow
                      key={round.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">{round.name}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(round.startDate)}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(round.endDate)}</TableCell>
                      <TableCell className="text-gray-900 font-semibold">
                        {round.requiredMeetings} times
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="font-semibold"
                          style={{
                            backgroundColor: round.status === 'active' ? '#D1FAE5' : '#F5F5F5',
                            color: round.status === 'active' ? '#065F46' : '#525252',
                          }}
                        >
                          {round.status === 'active' ? 'Active' : 'Completed'}
                        </Badge>
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
                  ))
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
            <DialogDescription className="text-gray-600">
              {editingRound
                ? 'Modify the basic information of the Mentorship round'
                : 'Fill in the basic information for a new Mentorship round'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Round Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Round Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Spring-2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                />
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

            {/* Status */}
            {/* <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'completed') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Phase Deadlines Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#6035F3]" />
                <Label className="text-sm font-semibold text-gray-700">
                  Phase Deadlines <span className="text-red-500">*</span>
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Set the deadline for each phase of the mentorship round
              </p>
              
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700 w-1/3">Phase</TableHead>
                      <TableHead className="font-semibold text-gray-700">Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Registration
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formData.phases.registration}
                          onChange={(e) => updatePhaseDeadline('registration', e.target.value)}
                          className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          Matching
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formData.phases.matching}
                          onChange={(e) => updatePhaseDeadline('matching', e.target.value)}
                          className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          In Progress
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formData.phases.inProgress}
                          onChange={(e) => updatePhaseDeadline('inProgress', e.target.value)}
                          className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          Summary
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formData.phases.summary}
                          onChange={(e) => updatePhaseDeadline('summary', e.target.value)}
                          className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          Completed
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formData.phases.completed}
                          onChange={(e) => updatePhaseDeadline('completed', e.target.value)}
                          className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-gray-500">
                Note: Each phase deadline must be later than the previous phase
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
    </div>
  );
}
