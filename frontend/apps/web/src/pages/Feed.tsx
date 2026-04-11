import { useQuery } from "@tanstack/react-query";
import { VideoFeed } from "@/components/VideoFeed";

export function FeedPage() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: () => fetch("/api/feed?limit=20").then((r) => r.json()).then((d) => Array.isArray(d) ? d : []),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return <VideoFeed videos={videos} />;
}
