import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, Lock, LogIn } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { Header } from "@/components/Header";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen bg-background matrix-bg">
          <Header />
          <div className="pt-16 container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-12 h-12 text-blue-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Authentication Required</h1>
              <p className="text-gray-300 mb-8">
                You need to log in to access this area.
              </p>
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="cyber-button"
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode="login"
          onModeChange={() => {}}
        />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background matrix-bg">
        <Header />
        <div className="pt-16 container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-8">
              You need administrator privileges to access this area.
            </p>
            <div className="text-sm text-gray-400">
              Current user: {user?.firstName} {user?.lastName} ({user?.role})
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}