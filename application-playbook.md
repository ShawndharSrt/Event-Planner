# Event Planner Application Playbook

## 1. Application Overview
**Event Planner** is a modern, comprehensive web application designed to streamline the complex process of organizing events. From intimate gatherings to large-scale corporate conferences, this tool provides a centralized hub for managing every detail—guests, tasks, schedules, and budgets.

## 2. Target Audience
*   **Professional Event Planners**: Managing multiple client events simultaneously.
*   **Corporate Coordinators**: Organizing internal meetings, retreats, and conferences.
*   **Individuals**: Planning weddings, parties, or reunions.

## 3. Core Features
*   **Centralized Dashboard**: Real-time insights into upcoming events and tasks.
*   **Event Management**: Full lifecycle management (Create, Read, Update, Delete) of events.
*   **Guest Management**: Track RSVPs, dietary restrictions, and guest groups.
*   **Task Management**: Kanban-style board for tracking progress and assignments.
*   **Interactive Calendar**: Visual monthly view of all event schedules.
*   **Responsive Design**: Works seamlessly on desktop and tablet.

---

## 4. User Guide: Step-by-Step

### 4.1. Authentication
*   **Login Page**: Secure entry point. Users enter their credentials to access their personalized workspace.
*   **Sign Up**: New users can register for an account.

### 4.2. Dashboard (`/dashboard`)
The command center of the application.
*   **Stats Overview**: View total events, upcoming events, and pending tasks at a glance.
*   **Recent Activity**: See the latest updates across all your projects.
*   **Quick Actions**: One-click access to create new events or tasks.

### 4.3. Event Management
#### Events List (`/events`)
*   **View All**: A grid or list view of all your events.
*   **Search & Filter**: Quickly find events by name, date, or status.
*   **Create Event**: Click the "Create Event" button to start a new project.

#### Event Details (`/events/:id`)
The heart of the application. Clicking an event opens this detailed view, divided into tabs:
1.  **Overview Tab**:
    *   View key details: Date, Time, Location, Description.
    *   Edit event information.
2.  **Guests Tab**:
    *   **Data Table**: A powerful table listing all guests.
    *   **Sort & Page**: Click headers to sort by Name or Status. Use pagination to navigate large lists.
    *   **Export**: Download the guest list as a CSV (feature coming soon).
3.  **Tasks Tab**:
    *   View tasks specific to this event.
    *   Track progress from "Todo" to "Done".
4.  **Budget Tab**:
    *   (Coming Soon) Track expenses against your allocated budget.

### 4.4. Task Board (`/tasks`)
A global view of all tasks across all events.
*   **Kanban Board**: Visual columns for **Todo**, **In Progress**, and **Done**.
*   **Drag & Drop**: (Coming Soon) Move tasks between columns to update status.
*   **Add Task**: Create new tasks, assign them to team members, and set due dates.
*   **Filtering**: Filter tasks by priority (High, Medium, Low) or Assignee.

### 4.5. Calendar (`/calendar`)
A visual timeline of your schedule.
*   **Monthly View**: See all events mapped out on a calendar grid.
*   **Navigation**: Use "Previous" and "Next" buttons to jump between months.
*   **Today Button**: Quickly return to the current date.
*   **Event Indicators**: Color-coded markers show events on specific days.

### 4.6. Profile & Settings
*   **Profile**: Update your personal information and avatar.
*   **Settings**: Configure application preferences, notifications, and display themes.

---

## 5. Technical Architecture
*   **Frontend**: Angular (Latest Version) with Signals for high performance.
*   **Styling**: SCSS with a custom design system (Variables, Mixins).
*   **State Management**: Angular Signals.
*   **Backend Integration**: Service-based architecture ready for REST API integration.
*   **Database**: MongoDB (Schema defined for Users, Events, Guests, Tasks).
