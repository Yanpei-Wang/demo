import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { cn } from "./ui/utils";
import { Label } from "./ui/label";

interface MeetingSlot {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
}

interface MeetingSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { timezone: string; slots: { date: Date; startTime: string; endTime: string }[] }) => void;
}

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "EST/EDT (Eastern Time)" },
  { value: "America/Chicago", label: "CST/CDT (Central Time)" },
  { value: "America/Denver", label: "MST/MDT (Mountain Time)" },
  { value: "America/Los_Angeles", label: "PST/PDT (Pacific Time)" },
  { value: "Europe/London", label: "GMT/BST (London)" },
  { value: "Europe/Paris", label: "CET/CEST (Paris)" },
  { value: "Asia/Shanghai", label: "CST (China Standard Time)" },
  { value: "Asia/Tokyo", label: "JST (Japan Standard Time)" },
  { value: "Australia/Sydney", label: "AEST/AEDT (Sydney)" },
];

const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    options.push(`${hour}:00`);
    options.push(`${hour}:30`);
  }
  return options;
};

const timeOptions = generateTimeOptions();

export function MeetingSubmissionModal({ open, onOpenChange, onSubmit }: MeetingSubmissionModalProps) {
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [meetingSlots, setMeetingSlots] = useState<MeetingSlot[]>([
    { id: '1', date: new Date(), startTime: "10:00", endTime: "11:00" }
  ]);

  const addSlot = () => {
    const newSlot: MeetingSlot = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      startTime: "10:00",
      endTime: "11:00"
    };
    setMeetingSlots([...meetingSlots, newSlot]);
  };

  const removeSlot = (id: string) => {
    if (meetingSlots.length > 1) {
      setMeetingSlots(meetingSlots.filter(slot => slot.id !== id));
    }
  };

  const updateSlot = (id: string, field: keyof MeetingSlot, value: any) => {
    setMeetingSlots(meetingSlots.map(slot => {
      if (slot.id === id) {
        return { ...slot, [field]: value };
      }
      return slot;
    }));
  };

  const handleSubmit = () => {
    // Validate that all slots have dates
    const validSlots = meetingSlots.filter(slot => slot.date !== undefined);

    if (validSlots.length > 0 && timezone) {
      const formattedSlots = validSlots.map(slot => ({
        date: slot.date!,
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

      onSubmit({ timezone, slots: formattedSlots });

      // Reset form (optional, but good practice if modal reopens without unmounting)
      onOpenChange(false);
      // We don't reset state here to keep user input if they reopen immediately, 
      // but usually the parent controls the mount/unmount or state reset.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Submit Meeting Info</DialogTitle>
          <DialogDescription>
            Please fill in the meeting information. You can add multiple meeting slots.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
          <div className="space-y-2">
            <Label>Meeting Instructions</Label>
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md border">
              Please record your mentorship meetings here. Ensure the date, start time, and end time are correct.
              You can add multiple meetings at once using the "+" button.
            </div>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Meeting Slots</Label>
              <Button onClick={addSlot} size="sm" variant="outline" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {meetingSlots.map((slot, index) => (
              <div key={slot.id} className="relative p-4 border rounded-lg bg-card text-card-foreground shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Meeting #{index + 1}</span>
                  {meetingSlots.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSlot(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !slot.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {slot.date ? format(slot.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={slot.date}
                        onSelect={(date) => updateSlot(slot.id, 'date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Start Time</Label>
                    <Select
                      value={slot.startTime}
                      onValueChange={(value) => updateSlot(slot.id, 'startTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs">End Time</Label>
                    <Select
                      value={slot.endTime}
                      onValueChange={(value) => updateSlot(slot.id, 'endTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
