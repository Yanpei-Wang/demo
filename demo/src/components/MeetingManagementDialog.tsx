import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CalendarIcon, Clock, Trash2, Plus, Check, Timer } from 'lucide-react';
import { MentorshipParticipation, MentorshipMeeting } from '../types/dashboard';
import { toast } from 'sonner@2.0.3';

interface MeetingManagementDialogProps {
  participations: MentorshipParticipation[];
  onScheduleMeeting: (partnerEmail: string, partnerName: string, date: Date, time: string, duration: number) => void;
  onCancelMeeting: (meetingId: string) => void;
  trigger?: React.ReactNode;
}

interface PartnerInfo {
  name: string;
  email: string;
  role: 'mentor' | 'mentee';
  programName: string;
}

export function MeetingManagementDialog({
  participations,
  onScheduleMeeting,
  onCancelMeeting,
  trigger,
}: MeetingManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPartnerEmail, setSelectedPartnerEmail] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  // Duration options in minutes
  const durationOptions = [15, 30, 45, 60, 90, 120];

  // Get all unique partners from active participations
  const getAllPartners = (): PartnerInfo[] => {
    const partners: PartnerInfo[] = [];
    const activeParticipations = participations.filter((p) => p.status === 'active');

    activeParticipations.forEach((participation) => {
      participation.partnerNames.forEach((partnerName) => {
        const partnerEmail = `${partnerName.toLowerCase().replace(/\s/g, '')}@company.com`;
        partners.push({
          name: partnerName,
          email: partnerEmail,
          role: participation.role === 'mentor' ? 'mentee' : 'mentor',
          programName: participation.programName,
        });
      });
    });

    return partners;
  };

  const allPartners = getAllPartners();

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !selectedPartnerEmail) {
      toast.error('请填写所有必填字段');
      return;
    }

    const partner = allPartners.find((p) => p.email === selectedPartnerEmail);
    if (!partner) {
      toast.error('未找到选中的联系人');
      return;
    }

    onScheduleMeeting(selectedPartnerEmail, partner.name, selectedDate, selectedTime, selectedDuration);
    toast.success('会议预约成功！');
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedPartnerEmail('');
    setSelectedDuration(30);
  };

  const handleCancel = (meetingId: string) => {
    onCancelMeeting(meetingId);
    toast.success('会议已Cancel');
  };

  // Get all meetings grouped by status
  const getAllMeetings = () => {
    const allMeetings: MentorshipMeeting[] = [];

    participations.forEach((participation) => {
      participation.meetings.forEach((meeting) => {
        allMeetings.push(meeting);
      });
    });

    return allMeetings;
  };

  const allMeetings = getAllMeetings();
  const upcomingMeetings = allMeetings.filter((m) => !m.isCompleted);
  const completedMeetings = allMeetings.filter((m) => m.isCompleted);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#6035F3] hover:bg-[#4d2ac2]">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Manage Meetings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>会议管理</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingMeetings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedMeetings.length})</TabsTrigger>
          </TabsList>

          {/* Schedule Meeting Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Select Mentor/Mentee Email</Label>
                <Select value={selectedPartnerEmail} onValueChange={setSelectedPartnerEmail}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个联系人" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPartners.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">暂无可预约的联系人</div>
                    ) : (
                      allPartners.map((partner, index) => (
                        <SelectItem key={`${partner.email}-${index}`} value={partner.email}>
                          <div className="flex items-center gap-2">
                            <span>{partner.name}</span>
                            <span className="text-gray-500 text-sm">({partner.email})</span>
                            <Badge variant="outline" className="ml-2">
                              {partner.role === 'mentor' ? '导师' : '学员'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-time">Select Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="meeting-time"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-duration">Meeting Duration (minutes)</Label>
                    <Select 
                      value={selectedDuration.toString()} 
                      onValueChange={(value) => setSelectedDuration(Number(value))}
                    >
                      <SelectTrigger id="meeting-duration">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((duration) => (
                          <SelectItem key={duration} value={duration.toString()}>
                            {duration} 分钟
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime || !selectedPartnerEmail}
                className="w-full bg-[#6035F3] hover:bg-[#4d2ac2]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            </div>
          </TabsContent>

          {/* Upcoming Meetings Tab */}
          <TabsContent value="upcoming" className="space-y-3">
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>暂无Upcoming的会议</p>
              </div>
            ) : (
              upcomingMeetings.map((meeting) => (
                <Card key={meeting.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4>{meeting.partnerName}</h4>
                        <span className="text-sm text-gray-500">({meeting.partnerEmail})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {meeting.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {meeting.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          {meeting.duration} 分钟
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(meeting.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Meetings Tab */}
          <TabsContent value="completed" className="space-y-3">
            {completedMeetings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Check className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>暂无Completed的会议</p>
              </div>
            ) : (
              completedMeetings.map((meeting) => (
                <Card key={meeting.id} className="p-4 bg-gray-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4>{meeting.partnerName}</h4>
                      <span className="text-sm text-gray-500">({meeting.partnerEmail})</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {meeting.duration} 分钟
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
