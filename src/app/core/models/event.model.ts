export interface Event {
    id: number;
    title: string;
    type: 'conference' | 'wedding' | 'party' | 'meeting' | 'other';
    status: 'planning' | 'active' | 'draft' | 'completed';
    startDate: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    location: string;
    description?: string;
    coverImage?: string;
}

export interface TimelineItem {
    time: string;
    title: string;
    location: string;
}

export interface TeamMember {
    name: string;
    role: string;
    avatar: string; // Initials or URL
    isSecondary?: boolean;
}

export interface EventStats {
    totalGuests: number;
    confirmed: number;
    pending: number;
    declined: number;
}
