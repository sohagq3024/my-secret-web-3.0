import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/Home";
import { AllProfiles } from "@/pages/AllProfiles";
import { AllAlbums } from "@/pages/AllAlbums";
import { AllVideos } from "@/pages/AllVideos";
import { ContentViewer } from "@/pages/ContentViewer";
import { RestructuredAdminPanel } from "@/components/RestructuredAdminPanel";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import AlbumDetails from "@/pages/AlbumDetails";
import VideoDetails from "@/pages/VideoDetails";
import ProfileDetails from "@/pages/ProfileDetails";

function Router() {
  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/profiles" component={AllProfiles} />
          <Route path="/albums" component={AllAlbums} />
          <Route path="/videos" component={AllVideos} />
          <Route path="/admin">
            <ProtectedAdminRoute>
              <RestructuredAdminPanel />
            </ProtectedAdminRoute>
          </Route>
          <Route path="/album/:id" component={AlbumDetails} />
          <Route path="/video/:id" component={VideoDetails} />
          <Route path="/profile/:id" component={ProfileDetails} />
          <Route path="/content/:type/:id" component={ContentViewer} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
