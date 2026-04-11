import { Route, Switch } from "wouter";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { LoginPage } from "@/pages/Login";
import { DashboardPage } from "@/pages/Dashboard";
import { ContentPage } from "@/pages/Content";
import { ContentUploadPage } from "@/pages/ContentUpload";
import { ContentDetailPage } from "@/pages/ContentDetail";
import { ModerationPage } from "@/pages/Moderation";
import { StudioPage } from "@/pages/Studio";
import { TrendsPage } from "@/pages/Trends";
import { AnalyticsPage } from "@/pages/Analytics";
import { ParentsPage } from "@/pages/Parents";

export function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/content" component={ContentPage} />
          <Route path="/content/upload" component={ContentUploadPage} />
          <Route path="/content/:id" component={ContentDetailPage} />
          <Route path="/moderation" component={ModerationPage} />
          <Route path="/studio" component={StudioPage} />
          <Route path="/trends" component={TrendsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/parents" component={ParentsPage} />
        </Switch>
      </main>
    </div>
  );
}
