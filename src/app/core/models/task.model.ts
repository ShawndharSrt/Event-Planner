export interface Task {
    id: number;
    eventId?: number;
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in-progress' | 'done';
}
