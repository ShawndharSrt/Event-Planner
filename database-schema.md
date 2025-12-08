# Event Planner Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ EVENT : organizes
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ SETTING : has

    EVENT ||--o{ TASK : contains
    EVENT ||--|| BUDGET : has
    EVENT ||--o{ EXPENSE : contains

    BUDGET ||--o{ BUDGET_CATEGORY : contains
    BUDGET_CATEGORY ||--o{ EXPENSE : categorizes

    GUEST ||--o{ GUEST_EVENT : attends
    EVENT ||--o{ GUEST_EVENT : includesGuest

    USER {
        ObjectId _id PK
        string userId UK
        string firstName
        string lastName
        string email UK
        string password
        string role "admin, planner, viewer"
        string avatar
        datetime createdAt
        datetime updatedAt
    }

    EVENT {
        ObjectId _id PK
        string title
        string type "conference, wedding, party, meeting, other"
        string status "planning, active, draft, completed"
        datetime startDate
        string startTime
        datetime endDate
        string endTime
        string location
        string description
        string coverImage
        string organizerId FK "links to USER.userId"
        datetime createdAt
        datetime updatedAt
    }

    TASK {
        ObjectId _id PK
        ObjectId eventId FK
        string title
        string description
        string assignee
        datetime dueDate
        string priority "high, medium, low"
        string status "todo, in-progress, done"
        datetime createdAt
        datetime updatedAt
    }

    GUEST {
        ObjectId _id PK
        string guestId UK "UUID used in mappings"
        string firstName
        string lastName
        string email
        string phone
        datetime createdAt
        datetime updatedAt
    }

    GUEST_EVENT {
        ObjectId _id PK
        string guestId FK "links to GUEST.guestId"
        ObjectId eventId FK
        string group "vip, family, friends, colleagues, speaker, sponsor, media, attendee, none"
        string status "confirmed, pending, declined"
        string dietary
        string notes
        datetime createdAt
        datetime updatedAt
    }

    BUDGET {
        ObjectId _id PK
        ObjectId eventId FK
        number totalBudget
        string currency
        datetime createdAt
        datetime updatedAt
    }

    BUDGET_CATEGORY {
        ObjectId _id PK
        ObjectId budgetId FK
        string name
        number allocatedAmount
        number spentAmount
        string color
        string icon
    }

    EXPENSE {
        ObjectId _id PK
        ObjectId eventId FK
        ObjectId categoryId FK
        string categoryName
        string description
        string vendor
        number amount
        datetime date
        string status "pending, paid, overdue"
        string notes
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId eventId FK
        string userId FK "links to USER.userId"
        string message
        boolean read
        datetime createdAt
    }

    SETTING {
        ObjectId _id PK
        string userId FK "links to USER.userId"
        string preferencesJson
        datetime createdAt
        datetime updatedAt
    }
```

## Collection Details

### Users Collection
- **Purpose**: Store user accounts and authentication data
- **Key Fields**:
  - `userId`: UUID used for linking to other entities
  - `role`: Defines user permissions (admin, planner, viewer)
  - `email`: Unique identifier for login
  - `avatar`: Profile picture URL

### Events Collection
- **Purpose**: Core event information and metadata
- **Key Fields**:
  - `type`: Event category for filtering and organization
  - `status`: Workflow state tracking
  - `organizerId`: Links to the user who created the event (USER.userId)
  - `coverImage`: Visual representation for the event
  - `startTime`/`endTime`: Specific time details

### Guests Collection
- **Purpose**: Store unique guest profiles independent of events
- **Key Fields**:
  - `guestId`: UUID used for linking to events
  - `email`: Contact information

### Guest Events Collection
- **Purpose**: Link guests to specific events with event-specific details
- **Key Fields**:
  - `guestId`: Link to Guest profile
  - `eventId`: Link to Event
  - `group`: Categorization within the event
  - `status`: RSVP status
  - `dietary`: Event-specific dietary needs

### Tasks Collection
- **Purpose**: Project management and task tracking per event
- **Key Fields**:
  - `eventId`: Links task to specific event
  - `assignee`: Person responsible for completion
  - `priority`: Urgency level
  - `status`: Progress tracking

### Budgets Collection
- **Purpose**: Financial planning and tracking for events
- **Key Fields**:
  - `eventId`: One-to-one relationship with events
  - `totalBudget`: Overall budget cap

### Budget Categories
- **Purpose**: Organize budget into spending categories
- **Key Fields**:
  - `budgetId`: Link to parent budget
  - `allocatedAmount`: Planned spending
  - `spentAmount`: Actual spending

### Expenses
- **Purpose**: Track individual transactions and payments
- **Key Fields**:
  - `eventId`: Link to event
  - `categoryId`: Link to budget category
  - `vendor`: Payment recipient
  - `status`: Payment state tracking

### Notifications Collection
- **Purpose**: User notifications
- **Key Fields**:
  - `userId`: Recipient user
  - `eventId`: Related event (optional)
  - `read`: Read status

### Settings Collection
- **Purpose**: User preferences
- **Key Fields**:
  - `userId`: Link to user
  - `preferencesJson`: JSON string storing various preferences

## Indexes Recommendations

```javascript
// Users
db.users.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })

// Events
db.events.createIndex({ organizerId: 1 })
db.events.createIndex({ status: 1 })
db.events.createIndex({ startDate: 1 })

// Guests
db.guests.createIndex({ guestId: 1 }, { unique: true })
db.guests.createIndex({ email: 1 })

// Guest Events
db.guest_events.createIndex({ eventId: 1 })
db.guest_events.createIndex({ guestId: 1 })
db.guest_events.createIndex({ eventId: 1, guestId: 1 }, { unique: true })

// Tasks
db.tasks.createIndex({ eventId: 1 })
db.tasks.createIndex({ assignee: 1 })

// Budgets
db.budgets.createIndex({ eventId: 1 }, { unique: true })

// Budget Categories
db.budget_categories.createIndex({ budgetId: 1 })

// Expenses
db.expenses.createIndex({ eventId: 1 })
db.expenses.createIndex({ categoryId: 1 })

// Notifications
db.notifications.createIndex({ userId: 1 })
db.notifications.createIndex({ read: 1 })

// Settings
db.settings.createIndex({ userId: 1 }, { unique: true })
```
