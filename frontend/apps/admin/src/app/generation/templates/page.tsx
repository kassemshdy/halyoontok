"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GenerationTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  base_prompt: string;
  model_name: string;
  success_rate: number;
  avg_engagement_score: number;
}

export default function TemplatesPage() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<GenerationTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [modelName, setModelName] = useState("nano_banana");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTemplates = () => {
    if (!token) return;
    fetch("/api/admin/generation/templates", { headers: authHeaders(token) })
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {});
  };

  useEffect(() => {
    fetchTemplates();
  }, [token]);

  const createTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    const body: Record<string, unknown> = {
      name,
      base_prompt: basePrompt,
      model_name: modelName,
    };
    if (category) body.category = category;
    await fetch("/api/admin/generation/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    });
    setName("");
    setBasePrompt("");
    setShowForm(false);
    setLoading(false);
    fetchTemplates();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Generation Templates</h1>
          <p className="text-sm text-muted-foreground">
            Reusable prompt templates for video generation
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Template"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <form onSubmit={createTemplate} className="space-y-3">
              <Input
                placeholder="Template name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Base prompt template..."
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                required
              />
              <div className="flex gap-3">
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="nano_banana">Nano Banana</option>
                  <option value="custom_1">Custom Model 1</option>
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">No category</option>
                  <option value="humor">Humor</option>
                  <option value="sports">Sports</option>
                  <option value="science">Science</option>
                  <option value="english_learning">English Learning</option>
                  <option value="arabic_literacy">Arabic Literacy</option>
                  <option value="culture">Culture</option>
                  <option value="safe_trends">Safe Trends</option>
                  <option value="character_stories">Character Stories</option>
                </select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Template"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {t.base_prompt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t.model_name}</Badge>
                  {t.category && <Badge variant="secondary">{t.category}</Badge>}
                  <div className="text-end">
                    <p className="text-xs text-muted-foreground">Success</p>
                    <p className="text-sm font-medium">{(t.success_rate * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No templates yet. Create reusable prompt templates for video generation.
          </p>
        )}
      </div>
    </div>
  );
}
