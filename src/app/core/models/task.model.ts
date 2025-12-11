export interface Task {
    id: string;
    eventId: string;
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in-progress' | 'done';
    createdAt?: string;
    updatedAt?: string;
}
