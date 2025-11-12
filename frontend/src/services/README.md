# Services

This directory contains service modules for external API calls and business logic.

## Structure

- API clients and service functions
- Data transformation utilities
- Third-party integrations

## Examples

- `authService.ts` - Authentication API calls
- `analysisService.ts` - Analysis-related API calls
- `dataService.ts` - Data file management API calls

## Usage Example

```typescript
// services/authService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
      username,
      password,
    });
    return response.data;
  },

  logout: async (token: string) => {
    await axios.post(`${API_BASE_URL}/auth/logout/`, {}, {
      headers: { Authorization: `Token ${token}` }
    });
  },
};
```
