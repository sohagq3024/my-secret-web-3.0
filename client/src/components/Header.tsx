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
      <header className="fixed top-0 left-0 right-0 z-50 cyber-border bg-background/95 backdrop-blur-xl border-b border-green-500/30">
        <div className="container mx-auto px-4">
          {/* Main Header Row */}
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
                  Secret Web
                </span>
                <span className="text-xs text-green-300/70 -mt-1">Premium Digital Content</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className={`px-6 py-2 transition-all duration-300 font-medium ${
                      location === item.href
                        ? "bg-green-600/30 text-green-100 border border-green-500/50"
                        : "text-green-300 hover:text-green-100 hover:bg-green-600/20 border border-transparent hover:border-green-500/30"
                    }`}
                  >
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
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                variant="ghost"
                size="sm"
                className="lg:hidden text-green-300 hover:text-green-100 hover:bg-green-600/20"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Search Bar Section - Below Main Header */}
          <div className="hidden md:flex justify-center py-3 border-t border-green-500/20">
            <div className="relative w-full max-w-md" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500/60 w-4 h-4" />
              <Input
                placeholder="Search profiles, albums, videos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-12 pr-4 py-3 bg-black/40 border-green-500/20 text-green-100 placeholder-green-400/50 focus:border-green-400/40 focus:ring-green-400/20 rounded-xl transition-all duration-300 hover:bg-black/50 focus:bg-black/60"
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-green-500/30">
              {/* Mobile Search */}
              <div className="px-4 mb-4 md:hidden">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500/60 w-4 h-4" />
                  <Input
                    placeholder="Search profiles, albums, videos..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-12 pr-4 py-3 bg-black/40 border-green-500/20 text-green-100 placeholder-green-400/50 focus:border-green-400/40 focus:ring-green-400/20 rounded-xl"
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
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={location === item.href ? "default" : "ghost"}
                      className={`w-full justify-start font-medium ${
                        location === item.href
                          ? "bg-green-600/30 text-green-100 border border-green-500/50"
                          : "text-green-300 hover:text-green-100 hover:bg-green-600/20"
                      }`}
                    >
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
                      ) : (
                        <Badge className="bg-green-600/30 text-green-100 border border-green-500/50 ml-auto">
                          <Crown className="w-3 h-3 mr-1" />
                          FREE ACCESS
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