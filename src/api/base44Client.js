import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "69067876c48ddc1c6ff5fd7c", 
  requiresAuth: true // Ensure authentication is required for all operations
});
