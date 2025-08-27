import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Crown,
  Lock,
  Unlock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import logoImage from "@assets/A_casual_photo_of_Design_a_pro_1752865588870.png";

export function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user, isLoggedIn, isAdmin, hasValidMembership, logout } = useAuth();

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const navigation = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/celebrities", label: "Celebrities", icon: "⭐" },
    { href: "/albums", label: "Albums", icon: "📸" },
    { href: "/videos", label: "Videos", icon: "🎬" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 cyber-border bg-gray-900/95 backdrop-blur-xl border-b border-green-500/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="My Secret Web"
                  className="w-10 h-10 rounded-lg border border-green-500/30 group-hover:border-green-400/50 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
                  My Secret Web
                </span>
                <span className="text-xs text-green-300/70 -mt-1">Premium Digital Content</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className={`px-4 py-2 transition-all duration-300 ${
                      location === item.href
                        ? "bg-green-600/30 text-green-100 border border-green-500/50"
                        : "text-green-300 hover:text-green-100 hover:bg-green-600/20 border border-transparent hover:border-green-500/30"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* Membership Status */}
              {user && (
                <div className="hidden sm:flex items-center space-x-2">
                  {isAdmin ? (
                    <Badge className="bg-purple-600/30 text-purple-100 border border-purple-500/50 hover:bg-purple-600/40">
                      <Shield className="w-3 h-3 mr-1" />
                      ADMIN
                    </Badge>
                  ) : hasValidMembership ? (
                    <Badge className="bg-green-600/30 text-green-100 border border-green-500/50 hover:bg-green-600/40">
                      <Crown className="w-3 h-3 mr-1" />
                      PREMIUM
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
                      <Lock className="w-3 h-3 mr-1" />
                      No Access
                    </Badge>
                  )}
                </div>
              )}

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button className="cyber-button">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1 cyber-border rounded-lg">
                    <User className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-100">{user.firstName}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-300 hover:bg-red-600/20 hover:border-red-400/50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    onClick={() => openAuthModal("login")}
                    variant="outline"
                    className="border-green-500/50 text-green-300 hover:bg-green-600/20 hover:border-green-400/50"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    onClick={() => openAuthModal("register")}
                    className="cyber-button"
                  >
                    Join Now
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                variant="ghost"
                size="sm"
                className="md:hidden text-green-300 hover:text-green-100 hover:bg-green-600/20"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-green-500/30">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={location === item.href ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        location === item.href
                          ? "bg-green-600/30 text-green-100 border border-green-500/50"
                          : "text-green-300 hover:text-green-100 hover:bg-green-600/20"
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Button>
                  </Link>
                ))}

                {user ? (
                  <div className="pt-4 space-y-2 border-t border-green-500/30">
                    <div className="flex items-center space-x-2 px-3 py-2 cyber-border rounded-lg">
                      <User className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-100">{user.firstName} {user.lastName}</span>
                      {isAdmin ? (
                        <Badge className="bg-purple-600/30 text-purple-100 border border-purple-500/50 ml-auto">
                          <Shield className="w-3 h-3 mr-1" />
                          ADMIN
                        </Badge>
                      ) : hasValidMembership ? (
                        <Badge className="bg-green-600/30 text-green-100 border border-green-500/50 ml-auto">
                          <Crown className="w-3 h-3 mr-1" />
                          PREMIUM
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-300 ml-auto">
                          <Lock className="w-3 h-3 mr-1" />
                          No Access
                        </Badge>
                      )}
                    </div>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full cyber-button">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-300 hover:bg-red-600/20 hover:border-red-400/50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 space-y-2 border-t border-green-500/30">
                    <Button
                      onClick={() => {
                        openAuthModal("login");
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-green-500/50 text-green-300 hover:bg-green-600/20 hover:border-green-400/50"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        openAuthModal("register");
                        setIsMenuOpen(false);
                      }}
                      className="w-full cyber-button"
                    >
                      Join Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}