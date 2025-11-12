# State Management

This directory contains global state management logic.

## Options

Choose a state management solution based on your needs:

- **Context API** - For simple global state (already used in App)
- **Zustand** - Lightweight state management
- **Redux Toolkit** - For complex state with middleware
- **Jotai** - Atomic state management

## Example Structure

```
store/
├── slices/           # Redux slices or state modules
│   ├── authSlice.ts
│   ├── dataSlice.ts
│   └── analysisSlice.ts
├── index.ts          # Store configuration
└── README.md
```

## Usage Example (Zustand)

```typescript
// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```
