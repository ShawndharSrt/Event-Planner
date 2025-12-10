export interface Guest {
    id?: string;  // Added: API returns 'id' field
    _id: string;
    guestId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    group?: 'vip' | 'family' | 'friends' | 'colleagues' | 'speaker' | 'sponsor' | 'media' | 'attendee' | 'none';
    status?: 'confirmed' | 'pending' | 'declined';
    dietary?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Embedded object in Event collection (Aligned with EventGuestList in event.model.ts)
// This interface is mainly for type compatibility if needed, but EventGuestList in event.model is the source of truth for the event structure.

export interface EventGuest extends Guest {
    // Combined type for UI
    eventId: string;
    name?: string;
    group: 'vip' | 'family' | 'friends' | 'colleagues' | 'speaker' | 'sponsor' | 'media' | 'attendee' | 'none';
    status: 'confirmed' | 'pending' | 'declined';
    dietary?: string;
    notes?: string;
}
