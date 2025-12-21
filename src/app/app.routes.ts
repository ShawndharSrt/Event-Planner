import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { HomeComponent } from './features/home/home';
import { DashboardComponent } from './features/dashboard/dashboard';
import { EventListComponent } from './features/events/event-list/event-list';
import { EventFormComponent } from './features/events/event-form/event-form';
import { EventDetailsComponent } from './features/events/event-details/event-details';
import { GuestListComponent } from './features/guests/guest-list/guest-list';
import { GuestFormComponent } from './features/guests/guest-form/guest-form';
import { TaskBoardComponent } from './features/tasks/task-board/task-board';
import { CalendarComponent } from './features/calendar/calendar';
import { LoginComponent } from './features/auth/login/login';
import { ProfileComponent } from './features/profile/profile';
import { SettingsComponent } from './features/settings/settings';
import { NotificationListComponent } from './features/notifications/notification-list/notification-list.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./features/auth/sign-up/sign-up.component').then(m => m.SignUpComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'events', component: EventListComponent },
            { path: 'events/new', component: EventFormComponent },
            { path: 'events/:id', component: EventDetailsComponent },
            { path: 'events/:id/edit', component: EventFormComponent },
            { path: 'guests', component: GuestListComponent },
            { path: 'guests/new', component: GuestFormComponent },
            { path: 'guests/:id/edit', component: GuestFormComponent },
            { path: 'tasks', component: TaskBoardComponent },
            { path: 'calendar', component: CalendarComponent },
            { path: 'notifications', component: NotificationListComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'settings', component: SettingsComponent }
        ]
    },
    { path: 'home', component: HomeComponent },
    { path: '**', redirectTo: 'dashboard' }
];
