# NexusPanel - Modern Server Management Dashboard

NexusPanel is a full-featured, responsive server management dashboard built with Next.js, Firebase, and Tailwind CSS. It provides a dual-interface system: a comprehensive **Admin Panel** for infrastructure oversight and a streamlined **User View** for server owners to manage their instances.

![Admin Dashboard Screenshot](https://storage.googleapis.com/aida-outputs/project-screenshots/nexus-panel-dashboard.png)

## ✨ Key Features

### 👤 Admin Panel
- **Comprehensive Dashboard**: At-a-glance overview of server statistics, including active servers, CPU load, memory usage, and disk space.
- **Node Management**: Add new server nodes and monitor their health in real-time with live status, RAM, and Disk usage powered by WebSocket connections.
- **Container Deployment**: Deploy new Docker containers by specifying an image, assigning users, and mapping ports. The deployment process is initiated via a WebSocket connection to the node.
- **User Administration**: Create new user accounts with Firebase Authentication and manage user roles and profiles stored in Firestore.
- **Dynamic Locations**: Add and manage node locations by searching a global city database, with data saved directly to Firestore.

### 🚀 User View
- **My Servers**: A personalized dashboard for users to view and manage their assigned containers, presented as easy-to-understand "servers."
- **Live Server Console**: A real-time, interactive terminal for each container, providing live log streaming and command execution via WebSockets.
- **Detailed Server Management**: Dedicated pages for managing individual server settings, files, databases, and more (with a file manager already implemented).
- **Responsive Design**: A clean, modern UI that works seamlessly on desktop and mobile devices.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Real-time Communication**: [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) for live health checks and console logs.
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## 🚀 Getting Started

### 1. Configure Firebase

The application requires a Firebase project to run. The backend connection can be configured without writing any code using the built-in Admin UI.

1.  Navigate to the `/admin` page in your local development environment.
2.  Select "Firebase" as the backend provider.
3.  Paste your Firebase project's web configuration snippet into any input field. The form will automatically parse and fill the required fields.
4.  Enable the connection and save the configuration. The app will automatically save this to `src/lib/admin-config.json` and `src/firebase/config.ts` and reload.

### 2. Install Dependencies

Once the configuration is set, install the project dependencies:

```bash
npm install
```

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## 🗂️ Project Structure

- `src/app/(panel)`: Contains the routes and pages for the main Admin Panel.
- `src/app/(user)`: Contains the routes and pages for the User View.
- `src/app/server/[id]`: Routes for the detailed server management pages (console, files, etc.).
- `src/components`: Contains all React components, organized by feature (dashboard, nodes, users, etc.) and UI primitives (`/ui`).
- `src/firebase`: Includes all Firebase configuration, hooks, and providers.
- `src/lib`: Core utilities, mock data, and type definitions.
- `docs/backend.json`: Defines the data schemas used in Firestore.
- `firestore.rules`: Contains the security rules for the Firestore database.
