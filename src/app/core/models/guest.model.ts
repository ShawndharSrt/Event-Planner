export interface Guest {
    _id: string;
    guestId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface GuestEvent {
    _id: string;
    guestId: string;
    eventId: string;
    group: 'vip' | 'family' | 'friends' | 'colleagues' | 'speaker' | 'sponsor' | 'media' | 'attendee' | 'none';
    status: 'confirmed' | 'pending' | 'declined';
    dietary?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EventGuest extends Guest {
    guestEventId: string;
    eventId: string;
    group: 'vip' | 'family' | 'friends' | 'colleagues' | 'speaker' | 'sponsor' | 'media' | 'attendee' | 'none';
    status: 'confirmed' | 'pending' | 'declined';
    dietary?: string;
    notes?: string;
}
