"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={reset} className="mt-4">Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
