export interface College {
    id: string;
    name: string;
    domain: string;
    subdomain: string;
    logo?: string;
    primaryColor: string;
    location?: string;
    website?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    avatar?: string;
    reputationScore: number;
    tierLevel: string;
    role: 'student' | 'alumni' | 'admin' | 'user';
    is_verified: boolean;
    verificationLevel?: string;
    pulse?: string | null;
    pulseEmoji?: string | null;
    colleges?: {
        id: string; // collegeId
        role: string;
        status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    }[];
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
}

export interface ProjectMilestone {
    id: string;
    title: string;
    isCompleted: boolean;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'IDEA' | 'BUILDING' | 'MVP' | 'SCALING';
    ownerId: string;
    collegeId: string;
    repoUrl?: string;
    demoUrl?: string;
    lookingFor?: string;
    createdAt: string;
    updatedAt: string;
    owner: {
        name: string;
        avatar?: string;
        reputationScore: number;
    };
    milestones: ProjectMilestone[];
    hypeScore: number;
    hasHyped?: boolean;
}

export interface PostMedia {
    id: string;
    url: string;
    type: 'image' | 'video' | 'pdf';
}

export interface Post {
    id: string;
    content: string;
    post_type: 'general' | 'opportunity' | 'event' | 'achievement';
    author: {
        id: string;
        name: string;
        avatar?: string;
        reputationScore: number;
        tierLevel: string;
        is_verified?: boolean;
        connectionStatus?: {
            status: 'pending' | 'accepted' | 'declined' | 'self';
            isSender?: boolean;
        } | null;
    };
    collegeId: string;
    metadata?: any;
    createdAt: string;
    media?: PostMedia[];
    comments?: {
        id: string;
        content: string;
        user: {
            name: string;
            avatar?: string;
        };
        createdAt: string;
    }[];
    _count: {
        likes: number;
        comments: number;
    };
}
