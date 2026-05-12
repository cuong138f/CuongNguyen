import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { useEffect, useRef } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
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

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isProd = import.meta.env.PROD;
const clerkProxyUrl = isProd ? "/api/__clerk" : undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient();

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: any }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/blog" component={Blog} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            
            <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
            <Route path="/chat">{() => <ProtectedRoute component={Chat} />}</Route>
            <Route path="/chat/:id">{() => <ProtectedRoute component={ChatSession} />}</Route>
            <Route path="/vocabulary">{() => <ProtectedRoute component={Vocabulary} />}</Route>
            <Route path="/lessons">{() => <ProtectedRoute component={Lessons} />}</Route>
            <Route path="/lessons/:id">{() => <ProtectedRoute component={LessonDetail} />}</Route>
            <Route path="/speaking">{() => <ProtectedRoute component={Speaking} />}</Route>
            <Route path="/leaderboard">{() => <ProtectedRoute component={Leaderboard} />}</Route>
            <Route path="/badges">{() => <ProtectedRoute component={Badges} />}</Route>
            
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
