export interface Notification {
    id: string;
    eventId?: string;
    userId: string;
    code: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    triggerType: 'ONLINE' | 'OFFLINE';
    message: string;
    read: boolean;
    createdAt: string;
    closedAt?: string;
    status: string;
}
