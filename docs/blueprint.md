# **App Name**: Nebula Panel

## Core Features:

- Dashboard Overview: Display server status, CPU/RAM/Disk usage using mock data.
- Server Console: Provide a terminal-style UI for displaying mock server logs and accepting commands.
- File Manager: Simulate file management with a folder tree UI, mock file list, and upload/delete/rename actions.
- Settings Persistence: Allow users to modify server settings (general, network, startup, schedules) and save them in LocalStorage.
- Backend Configuration: Admin panel to select backend (Firebase, Supabase, REST API, Self-hosted) and enter configuration values, stored in LocalStorage.
- Enable Backend Toggle: Simulate enabling the backend with a toggle, persisting the state in LocalStorage.  Shows a mock connection status.
- Backend Adapter: Implements a backend-adapter pattern so Firebase/Supabase can be added later without refactoring UI.

## Style Guidelines:

- Primary color: Dark blue (#1E293B) for a professional, server-focused look.
- Background color: Very dark gray (#0F172A).
- Accent color: Cyan (#22D3EE) for interactive elements and status indicators.
- Body and headline font: 'Inter', a grotesque-style sans-serif, to offer a modern, machined look; suitable for headlines and body text.
- Code font: 'Source Code Pro' for the server console and any displayed code snippets.
- Use minimalist icons representing server management tasks, resources, and settings.
- Desktop-first, using a left sidebar navigation with a top bar for server selection and notifications. Utilize cards, tables, and tabs for content organization.