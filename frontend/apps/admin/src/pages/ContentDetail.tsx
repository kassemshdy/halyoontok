import { useLocale } from "@halyoontok/i18n";
import type { TranslationKey } from "@halyoontok/i18n";
import { useVideo, useUpdateVideoStatus } from "@/hooks/use-api";

const STATUS_ACTIONS: Record<string, { labelKey: TranslationKey; next: string }[]> = {
  draft: [{ labelKey: "action.submit_moderation", next: "awaiting_moderation" }],
  awaiting_moderation: [{ labelKey: "action.approve", next: "approved" }, { labelKey: "action.request_changes", next: "changes_requested" }],
  changes_requested: [{ labelKey: "action.resubmit", next: "awaiting_moderation" }],
  approved: [{ labelKey: "action.publish", next: "published" }],
  published: [{ labelKey: "action.archive", next: "archived" }],
};
const STATUS_KEYS: Record<string, TranslationKey> = {
  draft: "status.draft", awaiting_moderation: "status.awaiting_moderation", changes_requested: "status.changes_requested",
  approved: "status.approved", published: "status.published", archived: "status.archived",
};

export function ContentDetailPage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const videoId = parseInt(params.id);
  const { data: video, isLoading } = useVideo(videoId);
  const updateStatus = useUpdateVideoStatus();

  if (isLoading || !video) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" /></div>;

  const actions = STATUS_ACTIONS[video.status] || [];

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => history.back()} className="text-sm text-muted-foreground hover:text-foreground">← {t("content.back")}</button>

      {video.video_url && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <video src={video.video_url} poster={video.thumbnail_url || undefined} controls playsInline className="w-full bg-black" style={{ maxHeight: "400px", objectFit: "contain" }} />
        </div>
      )}
      {!video.video_url && !video.thumbnail_url && (
        <div className="mt-4 flex items-center justify-center rounded-lg border border-border py-16"><p className="text-sm text-muted-foreground">No video uploaded yet</p></div>
      )}

      <div className="mt-4 rounded-lg border border-border p-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-lg font-semibold">{video.title}</h1><p className="text-xs text-muted-foreground">#{video.id}</p></div>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">{STATUS_KEYS[video.status] ? t(STATUS_KEYS[video.status]) : video.status}</span>
        </div>
        {video.description && <p className="mt-3 text-sm text-muted-foreground">{video.description}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">{t("content.category")}:</span> <span className="font-medium">{video.category}</span></div>
          <div><span className="text-muted-foreground">{t("content.language")}:</span> <span className="font-medium">{video.language} / {video.dialect}</span></div>
          <div><span className="text-muted-foreground">{t("content.duration")}:</span> <span className="font-medium">{video.duration_seconds ? `${video.duration_seconds}s` : "—"}</span></div>
        </div>
        {actions.length > 0 && (
          <>
            <div className="my-5 border-t border-border" />
            <div className="flex gap-2">
              {actions.map((a, i) => (
                <button key={a.next} disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: videoId, status: a.next })}
                  className={`h-9 rounded-md px-4 text-sm font-medium disabled:opacity-50 ${i === 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-input hover:bg-accent"}`}>
                  {t(a.labelKey)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
