export interface Notification {
    _id: string;
    eventId?: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: string;
}
