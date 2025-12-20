export interface Event {
    _id?: string;
    id?: string;
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
    guests?: EventGuestList[];
    createdAt?: string;
    updatedAt?: string;
}

export interface EventGuestList {
    guestId: string;
    name: string;
    status: 'confirmed' | 'pending' | 'declined';
    group: 'vip' | 'family' | 'friends' | 'colleagues' | 'speaker' | 'sponsor' | 'media' | 'attendee' | 'none';
    dietary?: string;
    notes?: string;
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

