# UI Data Field Mapping

This document describes every field that is rendered in the Angular UI, the service/component that consumes it, the API endpoint that supplies it, and any transformations or placeholder values that currently exist. All API calls return the shared envelope defined in `ApiResponse<T>`.

---

## Dashboard (`DashboardComponent`)

### GET `/api/dashboard/overview`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "Dashboard overview fetched",
  "data": {
    "totalEvents": 0,
    "totalGuests": 0,
    "totalTasks": 0
  }
}
```

Notes:
- Component maps `totalEvents -> upcomingEvents`, `totalGuests -> totalGuests`, `totalTasks -> pendingTasks`.
- `completedTasks` currently hard-coded to `0`.

### GET `/api/dashboard/recent-events`

Request Body: _None_

Response Body (array example):
```json
{
  "success": true,
  "message": "Recent events fetched",
  "data": [
    {
      "id": 1,
      "title": "Tech Summit",
      "date": "2025-12-01",
      "time": "10:00",
      "location": "SF",
      "status": "active",
      "month": "Dec",
      "day": "01"
    }
  ]
}
```

Notes:
- `month` and `day` must be supplied or computed.

### GET `/api/dashboard/tasks`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "Dashboard tasks fetched",
  "data": [
    { "id": 1, "title": "Book venue", "priority": "high", "completed": false }
  ]
}
```

---

## Events

### Event List (`EventListComponent`)

#### GET `/api/events`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "Events fetched",
  "data": [
    {
      "id": 1,
      "title": "Tech Conference",
      "type": "conference",
      "status": "active",
      "startDate": "2025-11-25",
      "startTime": "09:00",
      "endDate": "2025-11-27",
      "endTime": "18:00",
      "location": "Moscone Center",
      "description": "..."
    }
  ]
}
```

Notes:
- Component displays title, type, status, dates, and location directly from `data`.

### Event Details (`EventDetailsComponent`)

#### GET `/api/events/:id`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "Event fetched",
  "data": {
    "id": 1,
    "title": "Tech Conference",
    "type": "conference",
    "status": "active",
    "startDate": "2025-11-25",
    "startTime": "09:00",
    "endDate": "2025-11-27",
    "endTime": "18:00",
    "location": "Moscone Center",
    "description": "...",
    "team": [],
    "timeline": []
  }
}
```

Notes:
- Used for the overview header content.

#### GET `/api/events/:id/guests`

Response Body:
```json
{
  "success": true,
  "message": "Guests fetched",
  "data": [
    {
      "id": 1,
      "eventId": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "group": "vip",
      "status": "confirmed",
      "phone": "...",
      "dietary": "",
      "notes": ""
    }
  ]
}
```

#### GET `/api/events/:id/tasks`

Response Body:
```json
{
  "success": true,
  "message": "Tasks fetched",
  "data": [
    {
      "id": 10,
      "eventId": 1,
      "title": "Book venue",
      "description": "...",
      "assignee": "JD",
      "dueDate": "2025-11-20",
      "priority": "high",
      "status": "todo"
    }
  ]
}
```

#### GET `/api/events/:id/timeline`

Response Body:
```json
{
  "success": true,
  "message": "Timeline fetched",
  "data": [
    { "id": 1, "label": "Kickoff", "date": "2025-10-01", "status": "done", "description": "..." }
  ]
}
```

#### GET `/api/events/:id/team`

Response Body:
```json
{
  "success": true,
  "message": "Team fetched",
  "data": [
    { "id": 2, "name": "Jane", "role": "Coordinator", "avatarUrl": "" }
  ]
}
```

#### GET `/api/events/:id/stats`

Response Body:
```json
{
  "success": true,
  "message": "Event stats fetched",
  "data": {
    "progress": 75,
    "tasksCompleted": 12,
    "guestsConfirmed": 80
  }
}
```

---

## Guests

### Guest List (`GuestListComponent`)

#### GET `/api/guests`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "Guests fetched",
  "data": [
    {
      "id": 1,
      "eventId": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "group": "vip",
      "status": "confirmed",
      "phone": "",
      "dietary": "",
      "notes": ""
    }
  ]
}
```

#### DELETE `/api/guests/:id`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "Guest deleted",
  "data": null
}
```

### Guest Form (`GuestFormComponent`)

#### GET `/api/guests/:id`

Response Body:
```json
{
  "success": true,
  "message": "Guest fetched",
  "data": {
    "id": 1,
    "eventId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "123",
    "group": "vip",
    "dietary": "",
    "notes": ""
  }
}
```

#### POST `/api/events/:eventId/guests`

Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "123",
  "group": "vip",
  "dietary": "",
  "notes": ""
}
```

Response Body:
```json
{
  "success": true,
  "message": "Guest created",
  "data": {
    "id": 15,
    "eventId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "123",
    "group": "vip",
    "dietary": "",
    "notes": ""
  }
}
```

#### PATCH `/api/guests/:id`

Request Body: same shape as POST but typically partial.

Response Body: same envelope returning updated guest.

---

## Tasks (`TaskBoardComponent`)

### GET `/api/events/:eventId/tasks`

Request Body: _None_

Response Body: see event-details section (`Task[]` inside `data`).

### POST `/api/events/:eventId/tasks`

Request Body:
```json
{
  "title": "New task",
  "description": "details",
  "assignee": "Me",
  "dueDate": "2025-11-25",
  "priority": "medium",
  "status": "todo"
}
```

Response Body: envelope containing created `Task`.

### PATCH `/api/tasks/:id`

Request Body:
```json
{
  "status": "in-progress"
}
```

Response Body: envelope containing updated `Task`.

---

## Budget Tracker (`BudgetTrackerComponent`)

### GET `/api/events/:eventId/budget`

Response Body:
```json
{
  "success": true,
  "message": "Budget fetched",
  "data": {
    "id": 1,
    "eventId": 1,
    "totalBudget": 50000,
    "currency": "USD",
    "categories": [
      { "id": 1, "name": "Venue", "allocatedAmount": 15000, "spentAmount": 12000, "color": "#6366f1", "icon": "location_on" }
    ],
    "expenses": [
      {
        "id": 1,
        "eventId": 1,
        "categoryId": 1,
        "categoryName": "Venue",
        "description": "Hall booking",
        "vendor": "Grand Hotel",
        "amount": 12000,
        "date": "2025-01-15",
        "status": "paid",
        "notes": ""
      }
    ]
  }
}
```

### POST `/api/events/:eventId/expenses`

Request Body:
```json
{
  "categoryId": 1,
  "categoryName": "Venue",
  "description": "Hall booking",
  "vendor": "Grand Hotel",
  "amount": 12000,
  "date": "2025-01-15",
  "status": "paid",
  "notes": ""
}
```

Response Body: envelope containing created `Expense`.

### PATCH `/api/expenses/:id`

Request Body: same as POST (partial updates allowed).

Response Body: envelope containing updated `Expense`.

### DELETE `/api/expenses/:id`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "Expense deleted",
  "data": null
}
```

---

## Profile (`ProfileComponent`)

### GET `/api/users/me/stats`

Request Body: _None_

Response Body:
```json
{
  "success": true,
  "message": "User stats fetched",
  "data": {
    "eventsCreated": 0,
    "tasksCompleted": 0,
    "guestsManaged": 0
  }
}
```

### PATCH `/api/users/:id`

Request Body:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "bio": "Event planner"
}
```

Response Body: envelope containing updated `User`.

Notes:
- `AuthService.currentUser()` still stores the active session user in memory/localStorage. Responses above should keep `data` in sync.

---

## Authentication

### POST `/api/auth/login`

Request Body:
```json
{
  "username": "admin",
  "password": "secret"
}
```

Response Body:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "admin",
    "avatarUrl": "",
    "bio": ""
  },
  "token": "optional-jwt-if-returned"
}
```

Notes:
- UI only consumes the `data` payload. If backend returns token separately, store it via interceptor or ApiService.

### POST `/api/auth/register`

Request Body:
```json
{
  "fullName": "Jane Doe",
  "username": "jane",
  "email": "jane@example.com",
  "password": "secret"
}
```

Response Body: same envelope structure containing created `User`.

---

## Other Screens

- **Calendar & Notifications** currently display mock/in-memory data. No API dependency yet.
- **Event form** and **Settings** are also mock implementations; they log form values and show snackbars without hitting the backend.

---

## How to Extend

1. Ensure every backend response includes `{ success, message, data }` so it aligns with `ApiResponse<T>`.
2. When adding new UI fields, document the exact API fields here and update the corresponding interface in `src/app/core/models`.
3. If a UI field is derived (e.g., `month`, `day` for events), note whether it should be computed client-side or supplied by the API to avoid future confusion.


