export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  headline?: string;
  countryCode: string;
  city?: string;
  university?: string;
  school?: string;
  organization?: string;
  profession?: string;
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number; // 0=Country, 1=City, 2=Univ/Org, 3=Major, 4=Interest Group
  createdAt: Date;
}

export interface Membership {
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
}

export interface Skill {
  id: number;
  name: string;
}

export interface UserSkill {
  userId: string;
  skillId: number;
  type: 'teach' | 'learn';
}

export interface Channel {
  id: string;
  communityId: string;
  name: string;
  type: 'text' | 'voice';
  createdAt: Date;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
