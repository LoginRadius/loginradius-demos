import { mockData } from "./mockData.js";

export const roleService = {
  list: async () => mockData.roles,
  permissions: () => mockData.permissions,
};
