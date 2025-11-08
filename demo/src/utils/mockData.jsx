// Mock data for frontend display only

// Mock Users
export const mockUsers = [
  {
    id: '1',
    email: 'admin@purrf.com',
    name: '张管理员（内部账号）',
    role: ['circlecat_employee', 'admin'],
    participant_role:'mentor'
  },
  {
    id: '2',
    email: 'mentor1@purrf.com',
    name: '李导师（内部账号）',
    role: ['circlecat_volunteer'],
    participant_role:'mentor'
  },
  {
    id: '3',
    email: 'mentor2@purrf.com',
    name: '王导师',
    role: ['external'],
    participant_role:'mentor'
  },
  {
    id: '4',
    email: 'mentee1@purrf.com',
    name: '陈学员',
    role: ['external'],
    participant_role:'mentee'
  },
  {
    id: '5',
    email: 'mentee2@purrf.com',
    name: '刘学员（内部账号）',
    role: ['circlecat_intern'],
    participant_role:'mentee'
  },
    {
    id: '6',
    email: 'mentee3@purrf.com',
    name: '员工A（内部账号）',
    role: ['circlecat_intern'],
    participant_role:''
  },
];

// Mock Profiles
export const mockProfiles = [
  {
    id: 'p1',
    user_id: '2',
    bio: '拥有10年软件开发经验，专注于前端架构和团队管理',
    phone: '138-0000-0001',
    areas_of_expertise: ['前端开发', 'React', '团队管理', '职业规划'],
    availability: {
      '周一': ['下午', '晚上'],
      '周三': ['下午'],
      '周五': ['晚上'],
    },
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'p2',
    user_id: '3',
    bio: '资深产品经理，曾在多家互联网公司工作',
    phone: '138-0000-0002',
    areas_of_expertise: ['产品设计', '用户研究', '项目管理'],
    availability: {
      '周二': ['上午', '下午'],
      '周四': ['下午'],
    },
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'p3',
    user_id: '4',
    bio: '刚毕业的前端工程师，希望提升技术能力',
    phone: '138-0000-0003',
    areas_of_interest: ['前端开发', 'React', '职业发展'],
    availability: {
      '周一': ['晚上'],
      '周三': ['晚上'],
      '周五': ['晚上'],
    },
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'p4',
    user_id: '5',
    bio: '应届毕业生，对产品方向感兴趣',
    phone: '138-0000-0004',
    areas_of_interest: ['产品设计', '用户研究', '职业规划'],
    availability: {
      '周二': ['晚上'],
      '周四': ['晚上'],
    },
    updated_at: '2024-01-15T00:00:00Z',
  },
];

// Mock Program Cycles
export const mockProgramCycles = [
  {
    id: 'pc1',
    name: '2024春季导师项目',
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    status: 'active',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'pc2',
    name: '2023秋季导师项目',
    start_date: '2023-09-01',
    end_date: '2023-12-31',
    status: 'completed',
    created_at: '2023-08-01T00:00:00Z',
  },
];

// Mock Matches
export const mockMatches = [
  {
    id: 'm1',
    mentor_id: '2',
    mentee_id: '4',
    program_cycle_id: 'pc1',
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'm2',
    mentor_id: '3',
    mentee_id: '5',
    program_cycle_id: 'pc1',
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
  },
];

// Mock Meetings
export const mockMeetings = [
  {
    id: 'mt1',
    match_id: 'm1',
    scheduled_date: '2024-03-15T14:00:00Z',
    duration_minutes: 60,
    notes: '讨论前端架构设计和最佳实践',
    status: 'completed',
    created_by: '2',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-15T15:00:00Z',
  },
  {
    id: 'mt2',
    match_id: 'm1',
    scheduled_date: '2024-03-22T14:00:00Z',
    duration_minutes: 60,
    notes: 'React性能优化讨论',
    status: 'completed',
    created_by: '4',
    created_at: '2024-03-16T00:00:00Z',
    updated_at: '2024-03-22T15:00:00Z',
  },
  {
    id: 'mt3',
    match_id: 'm1',
    scheduled_date: '2024-11-15T14:00:00Z',
    duration_minutes: 60,
    notes: '职业规划和技术路线讨论',
    status: 'scheduled',
    created_by: '4',
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-11-01T00:00:00Z',
  },
  {
    id: 'mt4',
    match_id: 'm2',
    scheduled_date: '2024-03-16T10:00:00Z',
    duration_minutes: 90,
    notes: '产品思维培养和用户研究方法',
    status: 'completed',
    created_by: '3',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-16T11:30:00Z',
  },
  {
    id: 'mt5',
    match_id: 'm2',
    scheduled_date: '2024-11-20T10:00:00Z',
    duration_minutes: 60,
    notes: '项目管理工具和方法论',
    status: 'scheduled',
    created_by: '5',
    created_at: '2024-11-05T00:00:00Z',
    updated_at: '2024-11-05T00:00:00Z',
  },
];

// Helper functions
export function getUserById(id) {
  return mockUsers.find((u) => u.id === id);
}

export function getProfileByUserId(userId) {
  return mockProfiles.find((p) => p.user_id === userId);
}

export function getMatchesByUserId(userId) {
  return mockMatches.filter((m) => m.mentor_id === userId || m.mentee_id === userId);
}

export function getMeetingsByMatchIds(matchIds) {
  return mockMeetings.filter((m) => matchIds.includes(m.match_id));
}

export function getProgramCycleById(id) {
  return mockProgramCycles.find((pc) => pc.id === id);
}
