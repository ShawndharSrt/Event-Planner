# Event Planner API Specification

Base URL: `/api`

## Events

### List Events
- **Endpoint**: `GET /events`
- **Response**: `Event[]`

### Get Event Details
- **Endpoint**: `GET /events/{id}`
- **Response**: `Event`

### Create Event
- **Endpoint**: `POST /events`
- **Body**: `Omit<Event, 'id'>`
- **Response**: `Event` (created)

### Update Event
- **Endpoint**: `PATCH /events/{id}`
- **Body**: `Partial<Event>`
- **Response**: `Event` (updated)

### Delete Event
- **Endpoint**: `DELETE /events/{id}`
- **Response**: `void` (204 No Content)

---

## Guests

### List Guests for Event
- **Endpoint**: `GET /events/{eventId}/guests`
- **Response**: `Guest[]`

### Add Guest to Event
- **Endpoint**: `POST /events/{eventId}/guests`
- **Body**: `Omit<Guest, 'id' | 'eventId'>`
- **Response**: `Guest` (created)

### Update Guest
- **Endpoint**: `PATCH /guests/{id}`
- **Body**: `Partial<Guest>`
- **Response**: `Guest` (updated)

### Remove Guest
- **Endpoint**: `DELETE /guests/{id}`
- **Response**: `void` (204 No Content)

---

## Tasks

### List Tasks for Event
- **Endpoint**: `GET /events/{eventId}/tasks`
- **Response**: `Task[]`

### Add Task
- **Endpoint**: `POST /events/{eventId}/tasks`
- **Body**: `Omit<Task, 'id' | 'eventId'>`
- **Response**: `Task` (created)

### Update Task
- **Endpoint**: `PATCH /tasks/{id}`
- **Body**: `Partial<Task>`
- **Response**: `Task` (updated)

### Delete Task
- **Endpoint**: `DELETE /tasks/{id}`
- **Response**: `void` (204 No Content)
