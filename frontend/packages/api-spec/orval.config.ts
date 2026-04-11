import { defineConfig } from "orval";

export default defineConfig({
  adminApi: {
    input: "./admin-api.json",
    output: {
      mode: "tags-split",
      target: "../api-client/src/generated/admin",
      schemas: "../api-client/src/generated/admin/schemas",
      client: "react-query",
      override: {
        mutator: {
          path: "../api-client/src/fetcher.ts",
          name: "adminFetcher",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
  frontApi: {
    input: "./front-api.json",
    output: {
      mode: "tags-split",
      target: "../api-client/src/generated/front",
      schemas: "../api-client/src/generated/front/schemas",
      client: "react-query",
      override: {
        mutator: {
          path: "../api-client/src/fetcher.ts",
          name: "frontFetcher",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
  uploadApi: {
    input: "./upload-api.json",
    output: {
      mode: "tags-split",
      target: "../api-client/src/generated/upload",
      schemas: "../api-client/src/generated/upload/schemas",
      client: "react-query",
      override: {
        mutator: {
          path: "../api-client/src/fetcher.ts",
          name: "uploadFetcher",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
