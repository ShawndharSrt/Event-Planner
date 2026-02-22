# PlanIt - Event Planning Application

Welcome to **PlanIt**, a modern, luxury-styled event planning application designed to streamline the organization of high-end events. Built with Angular 21, PlanIt offers a comprehensive suite of tools to manage guests, track budgets, and handle seamless communication through email and WhatsApp notifications.

## 🌟 Key Features

- **Dynamic Dashboard**: View an overview of your event's status, recent activities, and key metrics.
- **Budget & Expense Tracking**: Keep finances in check with an intuitive budget tracker, complete with expense adding, editing, and deleting capabilities, visualized using Chart.js.
- **Guest Management**: Effortlessly manage event attendees, configure user-based filtering, and track RSVPs.
- **Automated Notifications**: Send invitations and updates to guests via dual-channel notifications (Email & WhatsApp integrations).
- **Premium UI/UX**: Experience a responsive, carefully crafted interface featuring a sleek, luxury design system, complete with micro-animations and a bespoke icon-only logo.
- **Secure Authentication**: Includes role-based access control (Admin/User), JWT token expiration logic, and secure password recovery mechanisms.

## 🛠 Tech Stack

- **Frontend Framework**: [Angular 21](https://angular.dev/)
- **UI Components**: [Angular Material](https://material.angular.io/) & Angular CDK
- **Styling**: Vanilla CSS with a bespoke luxury design system
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) & [ng2-charts](https://valor-software.com/ng2-charts/)
- **Reactive Programming**: [RxJS](https://rxjs.dev/)
- **Testing**: Vitest & JSdom

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.13.0 or later recommended)
- npm (v10 or later)

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd event-planner
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run start
   # or
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 🏗 Build & Deployment

To compile the project for production, run:
```bash
npm run build
```
This will compile the project and store the optimized build artifacts in the `dist/event-planner/` directory.

## 🧪 Testing

To execute unit tests using Vitest, run:
```bash
npm run test
```

## 🆕 Recent Updates & Enhancements

- **Notifications Redesign**: The notifications page now features a premium UI matching high-end mockups, complete with CDK Virtual Scroll for the feed, smooth micro-animations, soft shadows, and gold accent styling.
- **Budget Tracker UI Refresh**: Updated the Budget layout to ensure consistent, elegant styling with the application's forms, modals, and overarching luxury design system.
- **Enhanced Authentication Flow**: Added a dedicated password recovery flow (`Forgot Password` page), dynamic JWT token expiration handling (redirecting to login), and improved UI visibility on login/signup cards (glassmorphism tweaks). 
- **User-Based Filtering & Security**: Expanded backend user filtering across key APIs (`/api/dashboard`, `/api/tasks`, `/api/guests`) to ensure rigorous data privacy and precise scoping based on authentication roles (Admin/User).
- **Localization**: Standardized currency formatting to Indian Rupees (₹ INR) across all dashboard and financial data components.
- **Communication Integrations**: Extended the event invitation functionality to go beyond standard emails by integrating automated **WhatsApp notifications** via custom backend services.
- **Performance & State Management**: Integrated efficient caching solutions and refined component states, including the removal of deprecated features (e.g., legacy Activities module) for a cleaner codebase.

