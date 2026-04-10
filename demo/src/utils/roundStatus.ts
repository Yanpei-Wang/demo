import { MentorshipRound } from '../types/dashboard';

/**
 * Calculate the status of a mentorship round based on current time and matching phase dates
 * 
 * Rules:
 * - Completed: Current time > Matching phase participantDDL
 * - Active: Current time is between Matching phase adminAction and participantDDL
 * - Upcoming: All other cases (before Matching phase starts)
 */
export function getRoundStatus(round: MentorshipRound): 'active' | 'completed' | 'upcoming' {
  const now = new Date();
  const matchingStart = new Date(round.phases.matching.adminAction);
  const matchingEnd = new Date(round.phases.matching.participantDDL);

  if (now > matchingEnd) {
    return 'completed';
  }

  if (now >= matchingStart && now <= matchingEnd) {
    return 'active';
  }

  return 'upcoming';
}

/**
 * Check if registration is currently open for a round
 * Registration is open during the signUp phase
 */
export function isRegistrationOpen(round: MentorshipRound): boolean {
  const now = new Date();
  const signUpStart = new Date(round.phases.signUp.adminAction);
  const signUpEnd = new Date(round.phases.signUp.participantDDL);

  return now >= signUpStart && now <= signUpEnd;
}

/**
 * Get a label for the round status
 */
export function getStatusLabel(status: 'active' | 'completed' | 'upcoming'): string {
  const labels = {
    active: 'Active',
    completed: 'Completed',
    upcoming: 'Upcoming',
  };
  return labels[status];
}
