export type UserRole = 
  | 'circlecat_employee' 
  | 'circlecat_intern' 
  | 'circlecat_volunteer' 
  | 'googler' 
  | 'external_mentee' 
  | 'admin';

export interface ActivityMetrics {
  jiraTickets: number;
  mergedCLs: number;
  mergedLoc: number;
  meetingHours: number;
  chatMessages: number;
}

export interface MentorshipMeeting {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  partnerEmail: string; // Email of the mentor/mentee
  partnerName: string; // Name of the mentor/mentee
  isCompleted: boolean;
}

export interface MentorshipRegistration {
  industry: string; // For mentees: interested industry; For mentors: current industry
  skillsets: string[]; // Up to 3 skillsets to focus on
  menteeCapacity?: number; // Only for mentors: how many mentees they can mentor
  goal?: string; // Personal goal for this round (max 200 chars)
}

export interface MentorshipParticipation {
  programName: string;
  roundId: string;
  role: 'mentor' | 'mentee';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  partnerNames: string[]; // For mentors: array of mentee names; For mentees: single mentor name in array
  meetings: MentorshipMeeting[];
  registration?: MentorshipRegistration; // Registration info for this round
}

export interface UserData {
  id: string;
  name: string;
  ldap: string;
  role: UserRole;
  isTerminated: boolean;
  activityMetrics: ActivityMetrics;
  mentorshipParticipation: MentorshipParticipation[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface MentorshipRound {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
  requiredMeetings: number; // Number of meetings required to complete this round
}

export interface MentorshipPair {
  mentorName: string;
  menteeName: string;
  programName: string;
  completedMeetings: number;
  totalMeetings: number;
  totalHours: number;
}
