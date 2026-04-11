import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { createApi } from "@/lib/api";

function useApi() {
  const { token } = useAuth();
  return createApi(token);
}

// Content
export function useVideos(status?: string) {
  const api = useApi();
  return useQuery({ queryKey: ["videos", status], queryFn: () => api.listVideos({ status }) });
}

export function useVideo(id: number) {
  const api = useApi();
  return useQuery({ queryKey: ["video", id], queryFn: () => api.getVideo(id), enabled: !!id });
}

export function useCreateVideo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => api.createVideo(data), onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }) });
}

export function useUpdateVideoStatus() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.updateVideoStatus(id, status),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["videos"] }); qc.invalidateQueries({ queryKey: ["video", vars.id] }); },
  });
}

// Moderation
export function useModerationQueue() {
  const api = useApi();
  return useQuery({ queryKey: ["moderation-queue"], queryFn: () => api.getModerationQueue() });
}

export function useSubmitDecision() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => api.submitDecision(data), onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation-queue"] }) });
}

// Studio
export function useIdeas() {
  const api = useApi();
  return useQuery({ queryKey: ["ideas"], queryFn: () => api.listIdeas() });
}

export function useCreateIdea() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => api.createIdea(data), onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }) });
}

export function useConvertIdeaToVideo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => api.convertIdeaToVideo(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["ideas"] }); qc.invalidateQueries({ queryKey: ["videos"] }); } });
}

// Trends
export function useTrends() {
  const api = useApi();
  return useQuery({ queryKey: ["trends"], queryFn: () => api.listTrends() });
}

export function useCreateTrend() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => api.createTrend(data), onSuccess: () => qc.invalidateQueries({ queryKey: ["trends"] }) });
}

// Analytics
export function useAnalyticsOverview() {
  const api = useApi();
  return useQuery({ queryKey: ["analytics"], queryFn: () => api.getOverview() });
}

// Users
export function useUsers() {
  const api = useApi();
  return useQuery({ queryKey: ["users"], queryFn: () => api.listUsers() });
}

// Upload
export function useUploadVideo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, file }: { videoId: number; file: File }) => api.uploadVideo(videoId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });
}
