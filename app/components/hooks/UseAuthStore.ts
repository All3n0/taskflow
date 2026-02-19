// 'use client';

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// interface User {
//   id: string;
//   email: string;
//   username: string;
//   created_at: string;
// }

// interface AuthStore {
//   user: User | null;
//   token: string | null;
//   isGuest: boolean;
//   isAuthenticated: boolean;
  
//   // Actions
//   setUser: (user: User | null) => void;
//   setToken: (token: string | null) => void;
//   setGuest: (isGuest: boolean) => void;
//   logout: () => void;
//   syncWithGuestData: () => Promise<void>;
// }

// export const useAuthStore = create<AuthStore>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       token: null,
//       isGuest: true,
//       isAuthenticated: false,
      
//       setUser: (user) => {
//         set({ user, isAuthenticated: !!user, isGuest: !user });
//       },
      
//       setToken: (token) => {
//         set({ token });
//         localStorage.setItem('access_token', token || '');
//       },
      
//       setGuest: (isGuest) => {
//         if (isGuest) {
//           set({ isGuest: true, user: null, token: null, isAuthenticated: false });
//         } else {
//           set({ isGuest: false });
//         }
//       },
      
//       logout: () => {
//         // Clear everything
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         set({ 
//           user: null, 
//           token: null, 
//           isGuest: true, 
//           isAuthenticated: false 
//         });
        
//         // Keep local tasks for guest mode
//         // Redirect to home
//         window.location.href = '/';
//       },
      
//       syncWithGuestData: async () => {
//         // When user logs in, sync local tasks to backend
//         const localTasks = JSON.parse(localStorage.getItem('taskflow-tasks') || '[]');
//         const { user, token } = get();
        
//         if (user && token && localTasks.length > 0) {
//           try {
//             // Upload local tasks to backend
//             // We'll implement this in task-sync.ts
//             localStorage.removeItem('taskflow-tasks');
//           } catch (error) {
//             console.error('Failed to sync guest data:', error);
//           }
//         }
//       },
//     }),
//     {
//       name: 'taskflow-auth',
//     }
//   )
// );