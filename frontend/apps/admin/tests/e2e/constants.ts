export const TEST_ADMIN_CREDENTIALS = {
  email: "admin@halyoontok.com",
  password: "admin123",
};

export const TEST_PARENT_CREDENTIALS = {
  email: "parent@halyoontok.com",
  password: "parent123",
};

// API endpoints (relative to baseURL which proxies to backend)
export const API = {
  AUTH_LOGIN: "/api/auth/login",
  AUTH_REGISTER: "/api/auth/register",
  ADMIN_CONTENT_VIDEOS: "/api/admin/content/videos",
  ADMIN_MODERATION_QUEUE: "/api/admin/moderation/queue",
  ADMIN_MODERATION_DECISIONS: "/api/admin/moderation/decisions",
  ADMIN_STUDIO_IDEAS: "/api/admin/studio/ideas",
  ADMIN_ANALYTICS: "/api/admin/analytics/overview",
  ADMIN_USERS: "/api/admin/users",
};
