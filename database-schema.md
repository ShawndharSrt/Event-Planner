# MongoDB Database Schema

This document outlines the MongoDB collections and their schema definitions for the Event Planner application.

## Overview

The database consists of the following collections:
1.  **`users`**: Stores user information.
2.  **`events`**: Stores event details.
3.  **`guests`**: Stores guest lists associated with events.
4.  **`tasks`**: Stores tasks associated with events.

---

## Collections

### 1. Users Collection (`users`)
Stores application users.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Unique identifier (Auto-generated). |
| `name` | `String` | Yes | Full name of the user. |
| `email` | `String` | Yes | User's email address (Unique). |
| `role` | `String` | Yes | User role (e.g., 'admin', 'planner', 'viewer'). |
| `avatar` | `String` | No | URL to the user's avatar image. |
| `createdAt` | `Date` | Yes | Timestamp of creation. |
| `updatedAt` | `Date` | Yes | Timestamp of last update. |

### 2. Events Collection (`events`)
Stores event details.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Unique identifier (Auto-generated). |
| `title` | `String` | Yes | Title of the event. |
| `type` | `String` | Yes | Type of event (e.g., 'conference', 'wedding'). |
| `status` | `String` | Yes | Current status (e.g., 'planning', 'active'). |
| `startDate` | `Date` | Yes | Start date of the event. |
| `startTime` | `String` | No | Start time (e.g., "09:00"). |
| `endDate` | `Date` | No | End date of the event. |
| `endTime` | `String` | No | End time (e.g., "17:00"). |
| `location` | `String` | Yes | Physical location or venue. |
| `description` | `String` | No | Detailed description. |
| `coverImage` | `String` | No | URL to cover image. |
| `organizerId` | `ObjectId` | Yes | Reference to `users` collection (User who created/owns the event). |
| `createdAt` | `Date` | Yes | Timestamp of creation. |
| `updatedAt` | `Date` | Yes | Timestamp of last update. |

### 3. Guests Collection (`guests`)
Stores guests invited to specific events.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Unique identifier (Auto-generated). |
| `eventId` | `ObjectId` | Yes | **Foreign Key**: Reference to `events` collection. |
| `firstName` | `String` | Yes | Guest's first name. |
| `lastName` | `String` | Yes | Guest's last name. |
| `email` | `String` | Yes | Guest's email address. |
| `phone` | `String` | No | Guest's phone number. |
| `group` | `String` | No | Group category (e.g., 'vip', 'family'). |
| `status` | `String` | Yes | RSVP status ('confirmed', 'pending', 'declined'). |
| `dietary` | `String` | No | Dietary restrictions. |
| `notes` | `String` | No | Additional notes. |
| `createdAt` | `Date` | Yes | Timestamp of creation. |
| `updatedAt` | `Date` | Yes | Timestamp of last update. |

### 4. Tasks Collection (`tasks`)
Stores tasks related to planning an event.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Unique identifier (Auto-generated). |
| `eventId` | `ObjectId` | Yes | **Foreign Key**: Reference to `events` collection. |
| `title` | `String` | Yes | Task title. |
| `description` | `String` | No | Task description. |
| `assignee` | `String` | No | Name or ID of the person assigned (could be linked to `users`). |
| `dueDate` | `Date` | No | Due date for the task. |
| `priority` | `String` | Yes | Priority level ('high', 'medium', 'low'). |
| `status` | `String` | Yes | Task status ('todo', 'in-progress', 'done'). |
| `createdAt` | `Date` | Yes | Timestamp of creation. |
| `updatedAt` | `Date` | Yes | Timestamp of last update. |

---

## Relationships & Mappings

### Event -> Guests
- **Relationship**: One-to-Many
- **Mapping**: The `guests` collection contains an `eventId` field that references the `_id` of a document in the `events` collection.
- **Query**: To get all guests for an event: `db.guests.find({ eventId: ObjectId("...") })`

### Event -> Tasks
- **Relationship**: One-to-Many
- **Mapping**: The `tasks` collection contains an `eventId` field that references the `_id` of a document in the `events` collection.
- **Query**: To get all tasks for an event: `db.tasks.find({ eventId: ObjectId("...") })`

### User -> Events
- **Relationship**: One-to-Many
- **Mapping**: The `events` collection contains an `organizerId` field that references the `_id` of a document in the `users` collection.
- **Query**: To get all events created by a user: `db.events.find({ organizerId: ObjectId("...") })`
