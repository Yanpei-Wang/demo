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
  time: string; // Legacy field or display string
  startTime?: string;
  endTime?: string;
  timezone?: string;
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
  // Question 1: Continue with current round partners?
  continueCurrentPartners?: boolean; // Whether to continue with current partners
  discontinuePartnerNames?: string[]; // Partners from current round they don't want to continue with
  // Question 2: Preferred historical partners for next round
  preferredHistoricalPartnerNames?: string[]; // Historical partners they'd like to continue with in next round
}

export interface PartnerDetails {
  name: string;
  email: string;
  matchReason: string;
}

export interface MentorshipParticipation {
  programName: string;
  roundId: string;
  role: 'mentor' | 'mentee';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  partnerNames: string[]; // For mentors: array of mentee names; For mentees: single mentor name in array
  partnerDetails?: PartnerDetails[];
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
  phases: {
    registration: string; // Registration deadline
    matching: string; // Matching deadline
    inProgress: string; // In Progress (mentorship period) deadline
    summary: string; // Summary deadline
    completed: string; // Completion deadline
  };
}

export interface MentorshipPair {
  mentorName: string;
  menteeName: string;
  programName: string;
  completedMeetings: number;
  totalMeetings: number;
  totalHours: number;
}