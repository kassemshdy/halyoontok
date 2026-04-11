// Custom fetchers
export { adminFetcher, frontFetcher, uploadFetcher, ApiError } from "./fetcher";

// Generated hooks and schemas — admin-api
export * from "./generated/admin/content/content";
export * from "./generated/admin/moderation/moderation";
export * from "./generated/admin/studio/studio";
export * from "./generated/admin/analytics/analytics";
export * from "./generated/admin/trends/trends";
export * from "./generated/admin/users/users";
export * from "./generated/admin/schemas";

// Generated hooks and schemas — front-api
export * from "./generated/front/feed/feed";
export * from "./generated/front/auth/auth";
export * from "./generated/front/profiles/profiles";
export * from "./generated/front/interactions/interactions";
export * from "./generated/front/parent-controls/parent-controls";
export * from "./generated/front/schemas";

// Generated hooks and schemas — upload-api
export * from "./generated/upload/upload/upload";
export * from "./generated/upload/schemas";
