import { Route, Switch, Redirect } from "wouter";
import { FeedPage } from "@/pages/Feed";
import { CategoriesPage } from "@/pages/Categories";
import { CategoryFeedPage } from "@/pages/CategoryFeed";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { BottomNav } from "@/components/BottomNav";

export function App() {
  return (
    <>
      <Switch>
        <Route path="/">{() => <Redirect to="/feed" />}</Route>
        <Route path="/feed" component={FeedPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/categories/:category" component={CategoryFeedPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
      </Switch>
      <BottomNav />
    </>
  );
}
