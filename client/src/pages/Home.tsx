import { Slideshow } from "@/components/Slideshow";
import { useQuery } from "@tanstack/react-query";
import { Profile, Album, Video } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Images, Play, Clock, User, MapPin, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "@/components/MembershipModal";
import { motion } from "framer-motion";
import { Shield, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import logoImage from "@assets/A_casual_photo_of_Design_a_pro_1752865588870.png";

export function Home() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  // Fetch all data
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });
  const { data: albums = [] } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
  });
  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const getProfileName = (profileId: number | null) => {
    if (!profileId) return "Unknown Profile";
    const profile = profiles.find(p => p.id === profileId);
    return profile?.name || "Unknown Profile";
  };

  const handleProfileClick = (profileId: number) => {
    window.location.href = `/profile/${profileId}`;
  };

  const handleAlbumClick = (album: Album) => {
    window.location.href = `/content/album/${album.id}`;
  };

  const handleVideoClick = (video: Video) => {
    window.location.href = `/content/video/${video.id}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="space-y-0">
        <Slideshow />
        
        {/* Combined Content Section */}
        <section className="py-20 bg-gradient-to-br from-green-950/30 to-emerald-950/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            
            {/* Profiles Section */}
            {profiles.length > 0 && (
              <div className="mb-20">
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent neon-text mb-4">
                    ✨ Featured Profiles
                  </h2>
                  <p className="text-green-300/80 text-lg max-w-2xl mx-auto">
                    Discover amazing personalities and their exclusive content collections
                  </p>
                  {profiles.length > 8 && (
                    <Link href="/profiles">
                      <Button className="glass-button mt-6">
                        Explore All Profiles <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                  {profiles.slice(0, 12).map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <Card
                        className="group cursor-pointer card-hover bg-gradient-to-b from-green-900/20 to-green-950/40 border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300 hover:scale-105"
                        onClick={() => handleProfileClick(profile.id)}
                        data-testid={`card-profile-${profile.id}`}
                      >
                        <CardContent className="p-6 text-center flex flex-col items-center">
                          <div className="relative overflow-hidden rounded-full aspect-square w-24 h-24 mx-auto mb-4">
                            <img
                              src={profile.imageUrl}
                              alt={profile.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                              <div className="absolute bottom-1 left-1 right-1 text-center">
                                <div className="bg-green-600/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                  {profile.isFree ? "Free" : `$${profile.price}`}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <h3 className="text-sm font-bold text-green-100 mb-1 line-clamp-1">
                              {profile.name}
                            </h3>
                            <p className="text-xs text-green-300/70 mb-3 line-clamp-1">{profile.profession}</p>
                            
                            <Button
                              size="sm"
                              className="cyber-button text-xs px-3 py-1"
                              data-testid={`button-view-profile-${profile.id}`}
                            >
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums Section */}
            {albums.length > 0 && (
              <div className="mb-20">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text flex items-center">
                    <Images className="w-8 h-8 mr-3 text-green-400" />
                    Picture Albums
                  </h3>
                  {albums.length > 6 && (
                    <Link href="/albums">
                      <Button className="glass-button">
                        All Albums <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.slice(0, 6).map((album, index) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <Card
                        className="group cursor-pointer card-hover premium-card h-full"
                        onClick={() => handleAlbumClick(album)}
                        data-testid={`card-album-${album.id}`}
                      >
                        <CardContent className="p-0 h-full flex flex-col">
                          <div className="relative">
                            <img
                              src={album.thumbnailUrl}
                              alt={album.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                            />
                            <div className="absolute top-4 right-4 bg-green-600/80 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                              ${album.price}
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h4 className="text-lg font-semibold text-green-100 mb-2 line-clamp-2">
                              {album.title}
                            </h4>
                            <p className="text-sm text-green-300/70 mb-2 line-clamp-2 flex-1">
                              {album.description}
                            </p>
                            <div className="text-xs text-green-400/80 mb-4">
                              Profile: {getProfileName(album.profileId)}
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center text-sm text-green-300/70">
                                <Images className="w-4 h-4 mr-1" />
                                <span>{album.imageCount} images</span>
                              </div>
                              <Button
                                size="sm"
                                className="cyber-button"
                                data-testid={`button-open-album-${album.id}`}
                              >
                                Open
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text flex items-center">
                    <Play className="w-8 h-8 mr-3 text-green-400" />
                    Premium Videos
                  </h3>
                  {videos.length > 6 && (
                    <Link href="/videos">
                      <Button className="glass-button">
                        All Videos <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.slice(0, 6).map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <Card
                        className="group cursor-pointer card-hover premium-card h-full"
                        onClick={() => handleVideoClick(video)}
                        data-testid={`card-video-${video.id}`}
                      >
                        <CardContent className="p-0 h-full flex flex-col">
                          <div className="relative">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-48 object-cover rounded-t-xl"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300 rounded-t-xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 cyber-border bg-green-600/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Play className="text-green-400 ml-1" size={24} />
                              </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-green-600/80 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                              ${video.price}
                            </div>
                            {video.duration && (
                              <div className="absolute bottom-4 left-4 cyber-border bg-gray-900/80 text-white px-2 py-1 rounded text-sm flex items-center backdrop-blur-sm">
                                <Clock className="w-3 h-3 mr-1" />
                                {video.duration}
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h4 className="text-lg font-semibold text-green-100 mb-2 line-clamp-2">
                              {video.title}
                            </h4>
                            <p className="text-sm text-green-300/70 mb-2 line-clamp-2 flex-1">
                              {video.description}
                            </p>
                            <div className="text-xs text-green-400/80 mb-4">
                              Profile: {getProfileName(video.profileId)}
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-lg font-bold text-green-400">${video.price}</span>
                              <Button
                                size="sm"
                                className="cyber-button"
                                data-testid={`button-play-video-${video.id}`}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Play
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <MembershipModal 
        isOpen={showMembership} 
        onClose={() => setShowMembership(false)} 
      />

      {/* Footer */}
      <footer className="cyber-border bg-background/90 backdrop-blur-xl border-t border-green-500/30 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={logoImage} 
                  alt="My Secret Web"
                  className="w-8 h-8 rounded-lg border border-green-500/30"
                />
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
                  My Secret Web
                </h3>
              </div>
              <p className="text-green-300/70">
                Premium digital content platform providing exclusive access to high-quality albums and videos through secure, encrypted delivery.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-300">Quick Access</h4>
              <ul className="space-y-2 text-green-300/70">
                <li><a href="/" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>🏠</span><span>Home</span>
                </a></li>
                <li><a href="/celebrities" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>⭐</span><span>Celebrities</span>
                </a></li>
                <li><a href="/albums" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>📸</span><span>Albums</span>
                </a></li>
                <li><a href="/videos" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>🎬</span><span>Videos</span>
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-300">Support Portal</h4>
              <ul className="space-y-2 text-green-300/70">
                <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-300">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Facebook className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Twitter className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Instagram className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Youtube className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
              </div>
              <div className="mt-6 text-xs text-green-300/50">
                <p>🔒 Secured by blockchain technology</p>
                <p>🛡️ End-to-end encryption</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-500/30 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-green-300/70">
              <Shield className="w-4 h-4" />
              <p>&copy; 2025 My Secret Web. All rights reserved. Powered by quantum encryption.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
