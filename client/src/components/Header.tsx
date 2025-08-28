import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Crown,
  Lock,
  Unlock,
  Search,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Profile, Album, Video } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import logoImage from "@assets/A_casual_photo_of_Design_a_pro_1752865588870.png";

export function Header() {
  const [location, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
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
    { href: "/", label: "Home" },
    { href: "/profiles", label: "Profile" },
    { href: "/albums", label: "Album" },
    { href: "/videos", label: "Video" },
  ];

  // Fetch data for search
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });
  const { data: albums = [] } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
  });
  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results: Array<{id: string; title: string; type: string; href: string}> = [];

    // Search profiles
    profiles.forEach(profile => {
      if (profile.name.toLowerCase().includes(query)) {
        results.push({
          id: `profile-${profile.id}`,
          title: profile.name,
          type: 'Profile',
          href: `/profile/${profile.id}`
        });
      }
    });

    // Search albums
    albums.forEach(album => {
      if (album.title.toLowerCase().includes(query)) {
        results.push({
          id: `album-${album.id}`,
          title: album.title,
          type: 'Album',
          href: `/album/${album.id}`
        });
      }
    });

    // Search videos
    videos.forEach(video => {
      if (video.title.toLowerCase().includes(query)) {
        results.push({
          id: `video-${video.id}`,
          title: video.title,
          type: 'Video',
          href: `/video/${video.id}`
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  }, [searchQuery, profiles, albums, videos]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length >= 2);
  };

  const handleSearchResultClick = (href: string) => {
    navigate(href);
    setSearchQuery("");
    setShowSearchResults(false);
    setIsMenuOpen(false); // Close menu after navigation
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMenuOpen(false); // Ensure menu closes on navigation
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-background/95 backdrop-blur-xl border-b border-green-500/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Search Section */}
            <div className="flex items-center space-x-6 flex-1">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img 
                    src={logoImage} 
                    alt="Secret Web"
                    className="w-10 h-10 rounded-lg border border-green-500/30 group-hover:border-green-400/50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
                    Secret Web
                  </span>
                  <span className="text-xs text-green-300/70 -mt-1">Premium Digital Content</span>
                </div>
              </Link>

              {/* Search Bar - Next to Logo */}
              <div className="hidden md:flex flex-1 max-w-md" ref={searchRef}>
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500/60 w-4 h-4" />
                  <Input
                    placeholder="Search profiles, albums, videos..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-12 pr-4 py-2 bg-black/30 border-green-500/20 text-green-100 placeholder-green-400/50 focus:border-green-400/40 focus:ring-green-400/20 rounded-xl transition-all duration-300 hover:bg-black/40 focus:bg-black/50 w-full"
                    data-testid="search-input"
                  />
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-green-500/20 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs text-green-400/60 border-b border-green-500/10">
                            Search Results ({searchResults.length})
                          </div>
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleSearchResultClick(result.href)}
                              className="w-full px-4 py-3 text-left hover:bg-green-600/10 transition-colors flex items-center justify-between group"
                              data-testid={`search-result-${result.type.toLowerCase()}-${result.id.split('-')[1]}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-green-100 group-hover:text-green-50">{result.title}</span>
                                <span className="text-xs text-green-400/60">{result.type}</span>
                              </div>
                              <div className="text-green-400/40 text-xs group-hover:text-green-400/60">
                                {result.type}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center text-green-400/60">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Actions and Hamburger Menu */}
            <div className="flex items-center space-x-4">
              {/* Membership Status */}
              {user && (
                <div className="hidden sm:flex items-center space-x-2">
                  {isAdmin ? (
                    <Badge className="bg-purple-600/30 text-purple-100 border border-purple-500/50 hover:bg-purple-600/40">
                      <Shield className="w-3 h-3 mr-1" />
                      ADMIN
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600/30 text-green-100 border border-green-500/50 hover:bg-green-600/40">
                      <Crown className="w-3 h-3 mr-1" />
                      FREE ACCESS
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
              {/* Hamburger Menu - Always Visible */}
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                variant="ghost"
                size="sm"
                className="text-green-300 hover:text-green-100 hover:bg-green-600/20 transition-all duration-300"
                data-testid="hamburger-menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

        </div>

        {/* Full Screen Pop-up Menu Overlay */}
        {isMenuOpen && (
          <>
            {/* Background Overlay - Higher z-index */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] animate-in fade-in duration-300"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Pop-up Menu Panel - Highest z-index */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background/98 backdrop-blur-xl border-l border-green-500/30 shadow-2xl z-[99999] animate-in slide-in-from-right duration-300">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-green-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                    <Menu className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-100">Menu</div>
                    <div className="text-xs text-green-400/70">Navigation & Settings</div>
                  </div>
                </div>
                <Button
                  onClick={() => setIsMenuOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-green-300 hover:text-green-100 hover:bg-green-600/20 w-10 h-10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Mobile Search - Only show on mobile */}
                <div className="md:hidden">
                  <div className="text-xs text-green-400/70 mb-3 uppercase tracking-wider flex items-center">
                    <Search className="w-3 h-3 mr-2" />
                    Search
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500/60 w-4 h-4" />
                    <Input
                      placeholder="Search profiles, albums, videos..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-12 pr-4 py-3 bg-black/40 border-green-500/20 text-green-100 placeholder-green-400/50 focus:border-green-400/40 focus:ring-green-400/20 rounded-xl w-full"
                    />
                  </div>
                  
                  {/* Mobile Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="mt-2 bg-black/90 border border-green-500/20 rounded-xl max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => {
                            handleSearchResultClick(result.href);
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-green-600/10 transition-colors flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span className="text-green-100 text-sm">{result.title}</span>
                            <span className="text-xs text-green-400/60">{result.type}</span>
                          </div>
                          <div className="text-green-400/40 text-xs">
                            {result.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Section */}
                <div>
                  <div className="text-xs text-green-400/70 mb-4 uppercase tracking-wider flex items-center">
                    <div className="w-3 h-3 rounded bg-green-600/30 mr-2"></div>
                    Navigation
                  </div>
                  <div className="space-y-2">
                    {navigation.map((item, index) => (
                      <button
                        key={`nav-${item.href}-${index}`}
                        onClick={() => handleNavigation(item.href)}
                        className={`w-full justify-start font-medium py-4 px-4 text-base transition-all duration-300 rounded-lg flex items-center ${
                          location === item.href
                            ? "bg-green-600/30 text-green-100 border border-green-500/50 shadow-lg"
                            : "text-green-300 hover:text-green-100 hover:bg-green-600/20 border border-transparent hover:border-green-500/30"
                        }`}
                        style={{animationDelay: `${index * 100}ms`}}
                        data-testid={`nav-${item.label.toLowerCase()}`}
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            location === item.href ? "bg-green-400" : "bg-green-500/30"
                          }`}></div>
                          {item.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Account Section */}
                {user ? (
                  <div>
                    <div className="text-xs text-green-400/70 mb-4 uppercase tracking-wider flex items-center">
                      <User className="w-3 h-3 mr-2" />
                      Account
                    </div>
                    
                    {/* User Profile Card */}
                    <div className="bg-green-600/10 rounded-xl p-4 border border-green-500/20 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                          <User className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-semibold text-green-100">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-green-400/70">{user.email}</div>
                        </div>
                        {isAdmin ? (
                          <Badge className="bg-purple-600/40 text-purple-100 border border-purple-500/50">
                            <Shield className="w-3 h-3 mr-1" />
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge className="bg-green-600/40 text-green-100 border border-green-500/50">
                            <Crown className="w-3 h-3 mr-1" />
                            MEMBER
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {user.role === "admin" && (
                        <button
                          onClick={() => handleNavigation("/admin")}
                          className="w-full justify-start py-4 text-base bg-purple-600/30 text-purple-100 border border-purple-500/50 rounded-lg hover:bg-purple-600/40 transition-all duration-300 flex items-center"
                          data-testid="admin-panel"
                        >
                          <Shield className="w-5 h-5 mr-3" />
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full justify-start border border-red-500/50 text-red-300 hover:bg-red-600/20 hover:border-red-400/50 py-4 text-base rounded-lg transition-all duration-300 flex items-center"
                        data-testid="logout-button"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-green-400/70 mb-4 uppercase tracking-wider flex items-center">
                      <User className="w-3 h-3 mr-2" />
                      Account
                    </div>
                    
                    {/* Welcome Card for Guest Users */}
                    <div className="bg-green-600/10 rounded-xl p-4 border border-green-500/20 mb-4">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
                          <User className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-base font-medium text-green-100 mb-1">Welcome to Secret Web</div>
                        <div className="text-sm text-green-400/70">Join to access premium content</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          openAuthModal("login");
                          setIsMenuOpen(false);
                        }}
                        className="w-full justify-start border border-green-500/50 text-green-300 hover:bg-green-600/20 hover:border-green-400/50 py-4 text-base rounded-lg transition-all duration-300 flex items-center"
                        data-testid="login-button"
                      >
                        <Unlock className="w-5 h-5 mr-3" />
                        Login
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal("register");
                          setIsMenuOpen(false);
                        }}
                        className="w-full justify-start py-4 text-base bg-green-600/30 text-green-100 border border-green-500/50 rounded-lg hover:bg-green-600/40 transition-all duration-300 flex items-center"
                        data-testid="register-button"
                      >
                        Join Now
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Footer */}
              <div className="p-6 border-t border-green-500/20">
                <div className="text-center">
                  <div className="text-xs text-green-400/50">© 2025 Secret Web</div>
                  <div className="text-xs text-green-400/40">Premium Digital Content Platform</div>
                </div>
              </div>
            </div>
          </>
        )}
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