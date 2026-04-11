import { HalyoonApiClient } from "@halyoontok/api-client";

// Web app uses Next.js rewrite proxy — no base URL needed
export const api = new HalyoonApiClient("");
