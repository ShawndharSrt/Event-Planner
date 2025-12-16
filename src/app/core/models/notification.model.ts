export interface Notification {
    _id: string;
    eventId?: string;
    userId: string;
    code: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    triggerType: 'ONLINE' | 'OFFLINE';
    message: string;
    read: boolean;
    createdAt: string; // ISO Date string
    closedAt?: string; // ISO Date string
}
