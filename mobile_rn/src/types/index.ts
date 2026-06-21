export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'STUDENT' | 'ALUMNI' | 'FACULTY' | 'ADMIN' | 'admin' | 'student' | 'alumni';
  department?: string;
  collegeId?: string;
  reputationScore?: number;
  tierLevel?: string;
  targetRole?: string;
  careerStage?: string;
  completionRatio?: number;
  interests?: string[];
  phone?: string;
  linkedIn?: string;
  isOnboarded: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_STARTED';
  is_verified?: boolean;
  verificationLevel?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'IDEA' | 'DEVELOPMENT' | 'LAUNCHED';
  hypeScore: number;
  ownerId: string;
  owner: User;
  tags?: string[];
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  type: 'general' | 'opportunity' | 'event' | 'achievement';
  authorId: string;
  author: User;
  hasAppreciated: boolean;
  hasBoosted: boolean;
  _count: {
    likes: number;
    comments: number;
  };
  metadata?: any;
  createdAt: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  description: string; // Used for GPA/Percentage
}

export interface Certification {
  id: string;
  title: string;
  organization: string;
  credentialUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  mediaUrl?: string; // Parity with web's media_url
}

export interface Conversation {
  id: string;
  users: User[];
  lastMessage?: Message;
  messages: Message[];
  updatedAt: string;
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  user: User;
  createdAt: string;
}
