import { mockData } from "./mockData.js";

// Simulated async access patterns so callers can be drop-in replaced by the SDK
// later without restructuring data flow.
export const userService = {
  list: async () => mockData.users,
  listInvitations: async () => mockData.invitations,
  listDomains: async () => mockData.domains,
  currentUser: () => mockData.currentUser,
  org: () => mockData.org,
  orgs: () => mockData.orgs,
  activity: () => mockData.activity,
};
