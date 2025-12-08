export interface Event {
    id: string;
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
    organizerId: string;
    capacity?: number;
    stats?: EventStats;
    createdAt?: string;
    updatedAt?: string;
}


export interface TimelineItem {
    time: string;
    title: string;
    location: string;
}



export interface EventStats {
    totalGuests: number;
    confirmed: number;
    pending: number;
    declined: number;
}

export interface BudgetSummary {
    planned: number;
    actual: number;
}

