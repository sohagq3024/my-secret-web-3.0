import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
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
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 flex-1">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <img 
                    src={logoImage} 
                    alt="Secret Web"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-green-500/30 group-hover:border-green-400/50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
                    Secret Web
                  </span>
                  <span className="text-xs text-green-300/70 -mt-1 hidden sm:block">Premium Digital Content</span>
                </div>
              </Link>

              {/* Search Bar - Next to Logo */}
              <div className="hidden lg:flex flex-1 max-w-md" ref={searchRef}>
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

            </div>
          </div>

        </div>

        {/* Navigation Bar - Always visible below header */}
        <div className="bg-background/90 backdrop-blur-xl border-b border-green-500/20">
          <div className="container mx-auto px-2 sm:px-4">
            <nav className="flex items-center justify-center py-2 sm:py-4">
              <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-sm sm:text-base ${
                      location === item.href
                        ? "bg-green-600/30 text-green-100 border border-green-500/50 shadow-lg"
                        : "text-green-300 hover:text-green-100 hover:bg-green-600/20 border border-transparent hover:border-green-500/30"
                    }`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      location === item.href ? "bg-green-400" : "bg-green-500/30"
                    }`}></div>
                    <span className="text-xs sm:text-sm md:text-base">{item.label}</span>
                  </Link>
                ))}
                {user && user.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap text-sm sm:text-base ${
                      location === "/admin"
                        ? "bg-purple-600/30 text-purple-100 border border-purple-500/50 shadow-lg"
                        : "text-purple-300 hover:text-purple-100 hover:bg-purple-600/20 border border-transparent hover:border-purple-500/30"
                    }`}
                    data-testid="nav-admin"
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm md:text-base">Admin</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
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