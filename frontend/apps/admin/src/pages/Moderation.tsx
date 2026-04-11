import { useState } from "react";
import { useLocale } from "@halyoontok/i18n";
import { useModerationQueue, useSubmitDecision } from "@/hooks/use-api";

export function ModerationPage() {
  const { t } = useLocale();
  const { data: queue = [] } = useModerationQueue();
  const submitDecision = useSubmitDecision();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const decide = (videoId: number, status: string) => submitDecision.mutate({ video_id: videoId, status });

  return (
    <div>
      <h1 className="text-lg font-semibold">{t("moderation.title")}</h1>
      <p className="text-sm text-muted-foreground">{queue.length} {t("moderation.waiting")}</p>

      {queue.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">{t("moderation.empty")}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {queue.map((v: any) => (
            <div key={v.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {v.thumbnail_url && (
                    <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} className="h-16 w-24 flex-shrink-0 overflow-hidden rounded border border-border bg-muted">
                      <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    </button>
                  )}
                  <div>
                    <p className="text-sm font-medium">{v.title}</p>
                    <p className="text-xs text-muted-foreground">#{v.id} · {v.category}</p>
                    {v.video_url && <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} className="mt-1 text-xs underline underline-offset-2">{expandedId === v.id ? "Hide" : "Preview"}</button>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decide(v.id, "approved")} disabled={submitDecision.isPending} className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50">{t("action.approve")}</button>
                  <button onClick={() => decide(v.id, "changes_requested")} disabled={submitDecision.isPending} className="h-8 rounded-md border border-input px-3 text-xs font-medium disabled:opacity-50">{t("action.request_changes")}</button>
                  <button onClick={() => decide(v.id, "rejected")} disabled={submitDecision.isPending} className="h-8 rounded-md border border-input px-3 text-xs font-medium disabled:opacity-50">{t("action.reject")}</button>
                </div>
              </div>
              {expandedId === v.id && v.video_url && (
                <div className="mt-4"><video src={v.video_url} poster={v.thumbnail_url} controls playsInline className="w-full rounded bg-black" style={{ maxHeight: "300px", objectFit: "contain" }} /></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
