export interface Guest {
    id: number;
    eventId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    group?: 'vip' | 'family' | 'friends' | 'colleagues' | 'speaker' | 'sponsor' | 'media' | 'attendee' | 'none';
    status: 'confirmed' | 'pending' | 'declined';
    dietary?: string;
    notes?: string;
}
