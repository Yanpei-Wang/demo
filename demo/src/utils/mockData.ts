import { UserData, UserRole, MentorshipMeeting, MentorshipRound, PartnerDetails } from '../types/dashboard';

const generateMeetings = (startDateStr: string, partnerName: string, isCompleted: boolean = false): MentorshipMeeting[] => {
  const meetings: MentorshipMeeting[] = [];
  const totalMeetings = Math.floor(Math.random() * 8) + 4; // 4-12 meetings
  const startDate = new Date(startDateStr);
  
  // Generate email from partner name
  const partnerEmail = `${partnerName.toLowerCase().replace(/\s/g, '')}@company.com`;
  
  for (let i = 0; i < totalMeetings; i++) {
    const meetingDate = new Date(startDate);
    meetingDate.setDate(startDate.getDate() + (i * 7)); // Weekly meetings
    
    const hours = Math.floor(Math.random() * 4) + 14; // 14:00-17:00
    const minutes = Math.random() > 0.5 ? '00' : '30';
    const duration = Math.random() > 0.5 ? 30 : 60; // 30 or 60 minutes
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    
    // Calculate end time
    const startTotalMinutes = hours * 60 + (minutes === '30' ? 30 : 0);
    const endTotalMinutes = startTotalMinutes + duration;
    const endHours = Math.floor(endTotalMinutes / 60);
    const endMinutes = endTotalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    meetings.push({
      id: `meeting-${i + 1}`,
      date: meetingDate.toISOString().split('T')[0],
      time: `${startTime} - ${endTime}`,
      startTime: startTime,
      endTime: endTime,
      timezone: 'America/Los_Angeles',
      duration: duration,
      partnerEmail: partnerEmail,
      partnerName: partnerName,
      isCompleted: isCompleted ? true : Math.random() > 0.3, // 70% completion rate for active, 100% for completed
    });
  }
  
  return meetings;
};

// Helper function to determine if a role can be a mentor
const canBeMentor = (role: UserRole): boolean => {
  return role === 'circlecat_volunteer' || role === 'googler';
};

// Helper function to determine if a role must be a mentee
const mustBeMentee = (role: UserRole): boolean => {
  return role === 'circlecat_employee' || role === 'circlecat_intern' || role === 'external_mentee';
};

// Name pools for generating partner names
const mentorNames = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones', 'Dr. Garcia', 'Dr. Miller', 'Dr. Davis', 'Dr. Rodriguez', 'Dr. Martinez'];
const menteeNames = ['Alice Chen', 'Bob Lee', 'Carol Wang', 'David Zhang', 'Emma Liu', 'Frank Wu', 'Grace Kim', 'Henry Park', 'Iris Tang', 'Jack Yang', 'Kate Lin', 'Leo Huang', 'Maya Chen', 'Noah Wei'];

export const generateMockUserData = (role: UserRole, isCurrentUser: boolean = false, index?: number): UserData => {
  const baseMetrics = {
    jiraTickets: Math.floor(Math.random() * 50) + 5,
    mergedCLs: Math.floor(Math.random() * 30) + 3,
    mergedLoc: Math.floor(Math.random() * 5000) + 500,
    meetingHours: Math.floor(Math.random() * 40) + 10,
    chatMessages: Math.floor(Math.random() * 200) + 50,
  };

  const names = ['Alex Smith', 'Brian Johnson', 'Catherine Lee', 'Daniel Wong', 'Emily Chen', 'Frank Liu', 'Grace Kim', 'Henry Zhang'];
  const randomId = Math.random().toString(36).substr(2, 9);
  
  // Generate participation for multiple rounds
  const participations = [];
  
  // Determine role for each round based on user's role type
  const getMentorshipRole = (): 'mentor' | 'mentee' => {
    if (mustBeMentee(role)) return 'mentee';
    if (canBeMentor(role)) {
      // For current user (demo purposes), make them mentor to show mentor features
      if (isCurrentUser) return 'mentor';
      // For other volunteers and Googlers, 70% chance to be mentor
      return Math.random() > 0.3 ? 'mentor' : 'mentee';
    }
    return 'mentee'; // Default to mentee
  };
  
  const getPartnerNames = (mentorshipRole: 'mentor' | 'mentee'): string[] => {
    if (mentorshipRole === 'mentor') {
      // A mentor can have 1-3 mentees
      const numMentees = Math.floor(Math.random() * 3) + 1;
      const partners: string[] = [];
      for (let i = 0; i < numMentees; i++) {
        partners.push(menteeNames[Math.floor(Math.random() * menteeNames.length)]);
      }
      return partners;
    } else {
      // A mentee has exactly one mentor
      return [mentorNames[Math.floor(Math.random() * mentorNames.length)]];
    }
  };

  const getPartnerDetails = (names: string[], mentorshipRole: 'mentor' | 'mentee'): PartnerDetails[] => {
    return names.map(name => ({
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@circlecat.org`,
      matchReason: mentorshipRole === 'mentor' 
        ? "Matched based on shared interest in Frontend Development and Career Growth." 
        : "Matched based on your goal to improve Technical Skills and their expertise in Large Scale Systems."
    }));
  };
  
  // Current round (2024 Fall) - everyone has this
  const role2024Fall = getMentorshipRole();
  const partners2024Fall = getPartnerNames(role2024Fall);
  participations.push({
    programName: 'Fall 2024 Mentorship Program',
    roundId: 'round-2024-fall',
    role: role2024Fall,
    status: 'active' as const,
    partnerNames: partners2024Fall,
    partnerDetails: getPartnerDetails(partners2024Fall, role2024Fall),
    meetings: generateMeetings('2026-04-06', partners2024Fall[0], false),
    registration: {
      industry: role2024Fall === 'mentor' ? 'SWE' : 'UI / UX',
      skillsets: ['Career Path Guidance', 'Technical Skills Development', 'Networking'],
      menteeCapacity: role2024Fall === 'mentor' ? 2 : undefined,
      goal: role2024Fall === 'mentor' 
        ? 'Through this round of mentorship, I hope to help mentees improve their technical skills and career planning awareness, while also learning new perspectives from them.'
        : 'In this round, I hope to improve my technical interview skills, learn about the latest industry trends, and receive guidance on career development directions.',
    },
  });
  
  // Some users registered for Spring 2026 (upcoming)
  if (Math.random() > 0.7) {
    const role2026Spring = getMentorshipRole();
    const partners2026Spring = getPartnerNames(role2026Spring);
    participations.push({
      programName: 'Spring 2026 Mentorship Program',
      roundId: 'round-2026-spring',
      role: role2026Spring,
      status: 'pending' as const,
      partnerNames: partners2026Spring,
      partnerDetails: getPartnerDetails(partners2026Spring, role2026Spring),
      meetings: [],
    });
  }
  
  // Some users participated in Spring 2024
  if (Math.random() > 0.4) {
    const role2024Spring = getMentorshipRole();
    const partners2024Spring = getPartnerNames(role2024Spring);
    participations.push({
      programName: 'Spring 2024 Mentorship Program',
      roundId: 'round-2024-spring',
      role: role2024Spring,
      status: 'completed' as const,
      partnerNames: partners2024Spring,
      partnerDetails: getPartnerDetails(partners2024Spring, role2024Spring),
      meetings: generateMeetings('2024-03-01', partners2024Spring[0], true),
    });
  }
  
  return {
    id: isCurrentUser ? 'current-user' : `user-${randomId}`,
    name: isCurrentUser ? 'Current User' : names[Math.floor(Math.random() * names.length)],
    ldap: isCurrentUser ? 'current_user' : `user_${randomId.substr(0, 6)}`,
    role,
    isTerminated: !isCurrentUser && Math.random() > 0.8,
    activityMetrics: baseMetrics,
    mentorshipParticipation: participations,
  };
};

export const generateMockDataset = (): UserData[] => {
  const data: UserData[] = [];
  
  // Generate employees (must be mentees)
  for (let i = 0; i < 15; i++) {
    data.push(generateMockUserData('circlecat_employee'));
  }
  
  // Generate interns (must be mentees)
  for (let i = 0; i < 10; i++) {
    data.push(generateMockUserData('circlecat_intern'));
  }
  
  // Generate volunteers (can be mentors)
  for (let i = 0; i < 8; i++) {
    data.push(generateMockUserData('circlecat_volunteer'));
  }
  
  // Generate googlers (can be mentors)
  for (let i = 0; i < 5; i++) {
    data.push(generateMockUserData('googler'));
  }
  
  // Generate external mentees (must be mentees)
  for (let i = 0; i < 7; i++) {
    data.push(generateMockUserData('external_mentee'));
  }

  // Fixed demo user — covers all meeting log note cases
  data.push({
    id: 'user-frank-liu',
    name: 'Frank Liu',
    ldap: 'frank_liu',
    role: 'circlecat_employee',
    isTerminated: false,
    activityMetrics: { jiraTickets: 18, mergedCLs: 12, mergedLoc: 1800, meetingHours: 24, chatMessages: 130 },
    mentorshipParticipation: [
      {
        programName: 'Fall 2024 Mentorship Program',
        roundId: 'round-2024-fall',
        role: 'mentee',
        startDate: '2026-03-10',
        endDate: '2026-07-09',
        status: 'active',
        partnerNames: ['Dr. Garcia'],
        partnerDetails: [{ name: 'Dr. Garcia', email: 'dr.garcia@circlecat.org', matchReason: 'Matched based on shared interest in Frontend Development.' }],
        meetings: [
          // idx 0 — Completed (no note)
          { id: 'm1', date: '2026-03-10', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', timezone: 'America/Los_Angeles', duration: 60, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: true },
          // idx 1 — Unknown absence
          { id: 'm2', date: '2026-03-17', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', timezone: 'America/Los_Angeles', duration: 60, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: false },
          // idx 2 — Completed but Dr. Garcia arrived late
          { id: 'm3', date: '2026-03-24', time: '14:15 - 15:00', startTime: '14:15', endTime: '15:00', timezone: 'America/Los_Angeles', duration: 45, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: true, note: 'Dr. Garcia late arrival' },
          // idx 3 — Completed, unknown late arrival
          { id: 'm4', date: '2026-03-31', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', timezone: 'America/Los_Angeles', duration: 60, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: true, note: 'Unknown late arrival' },
          // idx 4 — Not Completed, Frank absent
          { id: 'm5', date: '2026-04-07', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', timezone: 'America/Los_Angeles', duration: 60, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: false, note: 'Frank Liu absent' },
          // idx 5 — Insufficient duration
          { id: 'm6', date: '2026-04-14', time: '14:00 - 14:20', startTime: '14:00', endTime: '14:20', timezone: 'America/Los_Angeles', duration: 20, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: false },
          // idx 6 — Not yet scheduled
          { id: 'm7', date: '2026-04-21', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', timezone: 'America/Los_Angeles', duration: 60, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: false },
          // idx 7 — Not yet scheduled
          { id: 'm8', date: '2026-04-28', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', timezone: 'America/Los_Angeles', duration: 60, partnerName: 'Dr. Garcia', partnerEmail: 'dr.garcia@circlecat.org', isCompleted: false },
        ],
      } as any,
    ],
  } as any);

  return data;
};

export const currentUserData = generateMockUserData('circlecat_employee', true);

// Function to get user data based on role
export const getUserDataByRole = (role: UserRole): UserData => {
  return generateMockUserData(role, true);
};

export const mentorshipRounds: MentorshipRound[] = [
  {
    id: 'round-2026-spring',
    name: 'Spring 2026',
    requiredMeetings: 8,
    participants: 0,
    completedMeetings: 0,
    mentorRating: null,
    menteeRating: null,
    phases: {
      signUp: {
        adminAction: '2026-05-18',
        participantDDL: '2026-05-25',
      },
      onboarding: {
        adminAction: '2026-06-02',
        participantDDL: '2026-06-09',
      },
      matching: {
        adminAction: '2026-06-12',
        participantDDL: '2026-06-26',
      },
      reminder: {
        adminAction: '2026-08-02',
        participantDDL: '2026-08-30',
      },
      feedback: {
        adminAction: '2026-09-02',
        participantDDL: '2026-09-09',
      },
    },
  },
  {
    id: 'round-2024-fall',
    name: 'Fall 2024',
    requiredMeetings: 8,
    participants: 42,
    completedMeetings: 89,
    mentorRating: null,
    menteeRating: null,
    phases: {
      signUp: {
        adminAction: '2026-03-18',
        participantDDL: '2026-03-25',
      },
      onboarding: {
        adminAction: '2026-04-01',
        participantDDL: '2026-04-05',
      },
      matching: {
        adminAction: '2026-04-06',
        participantDDL: '2026-04-30',
      },
      reminder: {
        adminAction: '2026-06-02',
        participantDDL: '2026-06-30',
      },
      feedback: {
        adminAction: '2026-07-02',
        participantDDL: '2026-07-09',
      },
    },
  },
  {
    id: 'round-2024-spring',
    name: 'Spring 2024',
    requiredMeetings: 6,
    participants: 38,
    completedMeetings: 102,
    mentorRating: 4.3,
    menteeRating: 4.6,
    phases: {
      signUp: {
        adminAction: '2023-12-18',
        participantDDL: '2023-12-25',
      },
      onboarding: {
        adminAction: '2024-02-02',
        participantDDL: '2024-02-09',
      },
      matching: {
        adminAction: '2024-02-12',
        participantDDL: '2024-02-26',
      },
      reminder: {
        adminAction: '2024-04-02',
        participantDDL: '2024-04-30',
      },
      feedback: {
        adminAction: '2024-05-02',
        participantDDL: '2024-05-09',
      },
    },
  },
  {
    id: 'round-2023-fall',
    name: 'Fall 2023',
    requiredMeetings: 8,
    participants: 35,
    completedMeetings: 124,
    mentorRating: 4.1,
    menteeRating: 4.5,
    phases: {
      signUp: {
        adminAction: '2023-08-18',
        participantDDL: '2023-08-25',
      },
      onboarding: {
        adminAction: '2023-09-02',
        participantDDL: '2023-09-09',
      },
      matching: {
        adminAction: '2023-09-12',
        participantDDL: '2023-09-26',
      },
      reminder: {
        adminAction: '2023-11-02',
        participantDDL: '2023-11-30',
      },
      feedback: {
        adminAction: '2023-12-02',
        participantDDL: '2023-12-09',
      },
    },
  },
];