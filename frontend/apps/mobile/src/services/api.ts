import { HalyoonApiClient } from "@halyoontok/api-client";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

export const api = new HalyoonApiClient(API_BASE);
