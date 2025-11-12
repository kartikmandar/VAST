# Custom React Hooks

This directory contains custom React hooks for shared logic across components.

## Examples

- `useAuth.ts` - Authentication state and methods
- `useApi.ts` - API call wrapper with loading/error states
- `useDebounce.ts` - Debounce values
- `useLocalStorage.ts` - Persistent state in localStorage

## Usage Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth logic here

  return { user, loading, login, logout };
};
```
