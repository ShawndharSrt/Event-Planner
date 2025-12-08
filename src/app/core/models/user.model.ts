export interface User {
    _id: string;
    userId: string;
    name: string;
    email: string;
    password?: string;
    role: ['ADMIN', 'PLANNER', 'VIEWER'];
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
}
