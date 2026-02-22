
# Kazistack - Modern Task Management System

<div align="center">
  <img src="/public/kazistacklogo.png" alt="Kazistack Logo" width="120" height="120" />
  <p><strong>Stack your tasks. Stack your wins.</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://kazistack.vercel.app)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38b2ac?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## 📋 Overview

Kazistack is a sophisticated, feature-rich task management application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. It provides users with a seamless experience for organizing, tracking, and completing tasks across multiple views with beautiful animations and a customizable interface.

**Live Demo:** [https://kazistack.vercel.app](https://kazistack.vercel.app)  
**Author:** [Allan Kiprop](https://allan-k.vercel.app)

---

## ✨ Key Features

### 📊 Multiple View Modes
| View | Description |
|------|-------------|
| **Dashboard** | Overview of productivity stats, due today tasks, and recent activity |
| **Tasks** | Comprehensive list of all tasks with search functionality |
| **Board** | Kanban-style board for visual task management |
| **Calendar** | Calendar-based task organization by due dates |
| **Notifications** | Centralized notification center for alerts |
| **Settings** | Extensive customization options |

### 🔔 Smart Notifications System
- Browser push notifications for task reminders
- Due soon alerts (30 minutes before deadline)
- Overdue task notifications
- Daily digest at 8 AM
- Customizable sound preferences with 6 sound options
- Notification center with categorized alerts (Overdue, Due Soon, High Priority)

### 🎨 Customizable Appearance
- **Theme Support:** Light, Dark, and System themes
- **Accent Colors:** 7 vibrant color options
  - Cyan | Indigo | Violet | Emerald | Rose | Amber | Orange
- **Compact Mode:** Toggle for reduced spacing
- Real-time preview of color changes
- Persistent preferences via localStorage

### ⏱️ Time Tracking
- Log time spent on tasks
- Track active timers
- View total time logged per task
- Time estimates and progress tracking

### 🔍 Powerful Search
- Global search across all tasks
- Search by title, description, and tags
- Real-time filtering
- Search results persist across views

### 📱 Responsive Design
- Mobile-optimized sidebar drawer
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Smooth animations with Framer Motion

### 💾 Data Management
- Local storage persistence (no server required)
- Export data to JSON or CSV
- Import/backup functionality
- Clear all tasks with confirmation

### 🔧 Browser Extension Support
- Downloadable browser extension
- Floating task counter on any webpage
- Quick task completion without opening the app
- Cross-browser support (Chrome, Edge, Brave)

---

## 🏗️ Architecture

### Tech Stack
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety and developer experience |
| **Tailwind CSS v4** | Styling and utilities |
| **Framer Motion** | Smooth animations and transitions |
| **Sonner** | Toast notifications |
| **Web Notifications API** | Browser push notifications |
| **date-fns** | Date manipulation and formatting |
| **Lucide React** | Beautiful icons |
| **React Hooks + Context** | State management |
| **localStorage** | Data persistence |

### Project Structure
kazistack/
├── app/
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Sidebar.tsx
│ │ │ ├── Header.tsx
│ │ │ ├── Footer.tsx
│ │ │ └── ThemeToggle.tsx
│ │ ├── tasks/
│ │ │ ├── TaskCard.tsx
│ │ │ ├── TaskDialog.tsx
│ │ │ └── TaskDetailPopup.tsx
│ │ ├── views/
│ │ │ ├── DashboardView.tsx
│ │ │ ├── TasksView.tsx
│ │ │ ├── BoardView.tsx
│ │ │ ├── CalendarView.tsx
│ │ │ ├── NotificationsView.tsx
│ │ │ └── SettingsView.tsx
│ │ ├── ui/
│ │ │ ├── Button.tsx
│ │ │ ├── input.tsx
│ │ │ ├── label.tsx
│ │ │ ├── select.tsx
│ │ │ └── calendar.tsx
│ │ └── hooks/
│ │ ├── useTaskStore.ts
│ │ ├── useTaskReminders.ts
│ │ ├── useNotifications.ts
│ │ └── useAccentColor.ts
│ ├── contexts/
│ │ └── TutorialContext.tsx
│ ├── providers/
│ │ └── theme-provider.tsx
│ ├── types/
│ │ └── task.ts
│ ├── utils/
│ │ └── index.ts
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
├── public/
│ ├── kazistacklogo.png
│ ├── favicon.ico
│ ├── kazistack.svg
│ ├── notification.mp3
│ └── sounds/
│ ├── chime.mp3
│ ├── pop.mp3
│ ├── ding.mp3
│ ├── whoosh.mp3
│ └── marimba.mp3
├── package.json
└── README.md

text

---

## 🧩 Core Components

### Sidebar (`Sidebar.tsx`)
- Persistent navigation with active state indicators
- Mobile-responsive drawer with animations
- Notification badge for urgent tasks
- Smooth hover effects and transitions
- Kazistack logo integration

### Header (`Header.tsx`)
- Dynamic title and subtitle based on active view
- Global search with mobile expansion
- Theme toggle integration
- Notification bell with dropdown menu
- Quick task creation button

### Footer (`Footer.tsx`)
- Professional 4-column layout
- Kazistack branding with gradient text
- Built by Allan Kiprop link to portfolio
- Quick navigation links
- Social media connections
- Scroll-to-top button
- Legal links and version info

### TaskDialog (`TaskDialog.tsx`)
- Create and edit tasks
- Priority selection (Low, Medium, High, Urgent)
- Status selection (Backlog, To Do, In Progress, Done)
- Due date picker with time selection
- Full-day toggle for deadlines
- Animated form elements

### TaskDetailPopup (`TaskDetailPopup.tsx`)
- Detailed task view with animations
- Priority and status indicators
- Time tracking display
- Tags visualization
- Complete/Incomplete toggle
- Edit and delete actions
- Three-dot menu with additional options:
  - Duplicate task
  - Copy link
  - Bookmark
  - Archive
  - Set reminder
  - Share
  - Print
  - Assign
  - Move to project

### TaskCard (`TaskCard.tsx`)
- Compact task representation
- Priority color coding
- Due date with overdue indicator
- Time tracking badge
- Quick status toggle
- Click to open detailed view

---

## 🎯 Key Functionality

### Task Management
```typescript
// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  project?: string;
  assignee?: string;
  timeTracking?: TimeTracking;
}
Notification System
Real-time due date monitoring

30-minute advance alerts

Overdue task notifications

Daily digest at 8 AM

Custom sound selection (6 options)

Browser permission management

In-app toast notifications with action buttons

Data Persistence
All tasks stored in localStorage

User preferences saved (theme, accent color, notification settings)

Export/Import functionality

Automatic state hydration

Keyboard Shortcuts
Shortcut	Action
⌘D / Ctrl+D	Bookmark page
⌘K	Quick task creation
Esc	Close modals/popups
🎨 Design System
Color Scheme
Color	Usage
Primary	Dynamic accent color (user-selectable)
Background	Adaptive light/dark mode
Secondary	Subtle backgrounds for cards
Destructive	Red for dangerous actions
Success	Green for completed tasks
Typography
Element	Size	Weight
Headings	32px (2xl)	Black (900)
Subheadings	24px (xl)	Bold (700)
Body	16px (base)	Medium (500)
Small	14px (sm)	Regular (400)
Tiny	12px (xs)	Regular (400)
Font Family: Inter (with system font stack fallback)

Animations
Page transitions with Framer Motion

Staggered list animations

Hover scale effects

Spring physics for natural motion

Loading skeletons

🚀 Getting Started
Prerequisites
Node.js 18+

npm or yarn

Installation
bash
# Clone the repository
git clone https://github.com/all3n0/taskflow.git

# Navigate to project directory
cd kazistack

# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
yarn dev
Build for Production
bash
npm run build
npm start
# or
yarn build
yarn start
🔧 Configuration
Environment Variables
Create a .env.local file:

env
NEXT_PUBLIC_APP_URL=http://localhost:3000
Adding Custom Sounds
Place .mp3 files in /public/sounds/

Update the SOUND_OPTIONS array in SettingsView.tsx

📊 Performance
Metric	Score
Lighthouse	95+ across all categories
Code Splitting	Automatic by Next.js
Image Optimization	Next.js Image component
Bundle Size	Optimized with tree shaking
Caching	Service worker ready for PWA
🔒 Privacy & Security
No User Accounts: All data stored locally

No Tracking: Zero analytics or tracking scripts

No External Servers: Complete privacy

Local Storage Only: Data never leaves your device

Export Control: Full data ownership

📱 PWA Support
Kazistack is configured as a Progressive Web App:

✅ Installable on desktop and mobile

✅ Offline support

✅ Push notifications

✅ Home screen icon

🧪 Testing
bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Check types
npm run type-check
🤝 Contributing
Fork the repository

Create feature branch (git checkout -b feature/amazing-feature)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing-feature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author
Allan Kiprop

Portfolio: https://allan-k.vercel.app

GitHub: @all3n0


LinkedIn: Allan Kiprop

🙏 Acknowledgments
Next.js team for the amazing framework

Tailwind CSS for utility-first styling

Framer Motion for butter-smooth animations

Lucide for beautiful icons

All contributors and users

📞 Support
For support, email support@kazistack.com or open an issue on GitHub.

<div align="center"> <br /> <sub>© 2025 Kazistack. All rights reserved.</sub> </div> ```