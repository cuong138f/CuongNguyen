import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Layout from "@/components/Layout";
import Chat from "@/pages/Chat";
import ChatSession from "@/pages/ChatSession";
import Vocabulary from "@/pages/Vocabulary";
import Lessons from "@/pages/Lessons";
import LessonDetail from "@/pages/LessonDetail";
import Speaking from "@/pages/Speaking";
import Leaderboard from "@/pages/Leaderboard";
import Badges from "@/pages/Badges";
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const queryClient = new QueryClient();

function AppRoutes() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/">
            {() => (
              <Layout>
                <Dashboard />
              </Layout>
            )}
          </Route>
          <Route path="/dashboard">
            {() => (
              <Layout>
                <Dashboard />
              </Layout>
            )}
          </Route>
          <Route path="/chat">
            {() => (
              <Layout>
                <Chat />
              </Layout>
            )}
          </Route>
          <Route path="/chat/:id">
            {() => (
              <Layout>
                <ChatSession />
              </Layout>
            )}
          </Route>
          <Route path="/vocabulary">
            {() => (
              <Layout>
                <Vocabulary />
              </Layout>
            )}
          </Route>
          <Route path="/lessons">
            {() => (
              <Layout>
                <Lessons />
              </Layout>
            )}
          </Route>
          <Route path="/lessons/:id">
            {() => (
              <Layout>
                <LessonDetail />
              </Layout>
            )}
          </Route>
          <Route path="/speaking">
            {() => (
              <Layout>
                <Speaking />
              </Layout>
            )}
          </Route>
          <Route path="/leaderboard">
            {() => (
              <Layout>
                <Leaderboard />
              </Layout>
            )}
          </Route>
          <Route path="/badges">
            {() => (
              <Layout>
                <Badges />
              </Layout>
            )}
          </Route>
          <Route path="/pricing" component={Pricing} />
          <Route path="/blog" component={Blog} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;
