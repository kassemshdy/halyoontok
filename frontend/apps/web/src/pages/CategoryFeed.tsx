import { useQuery } from "@tanstack/react-query";
import { VideoFeed } from "@/components/VideoFeed";
import { useLocale } from "@halyoontok/i18n";

export function CategoryFeedPage({ params }: { params: { category: string } }) {
  const { t } = useLocale();
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["feed", params.category],
    queryFn: () => fetch(`/api/feed?limit=20&category=${params.category}`).then((r) => r.json()).then((d) => Array.isArray(d) ? d : []),
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-black"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>;
  if (videos.length === 0) return <div className="flex h-screen flex-col items-center justify-center bg-black"><p className="text-gray-400">{t("content.no_videos")}</p></div>;
  return <VideoFeed videos={videos} />;
}
