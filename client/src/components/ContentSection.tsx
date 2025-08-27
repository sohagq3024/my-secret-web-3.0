import { useQuery } from "@tanstack/react-query";
import { Album, Video, Profile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Images, Play, Clock, Lock } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "./MembershipModal";
import { motion } from "framer-motion";

export function ContentSection() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  // Fetch videos data
  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  // Fetch albums data
  const { data: albums = [], isLoading: albumsLoading } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
  });

  // Fetch profiles for linking
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const getProfileName = (profileId: number | null) => {
    if (!profileId) return "Unknown Profile";
    const profile = profiles.find(p => p.id === profileId);
    return profile?.name || "Unknown Profile";
  };

  const handleVideoClick = (video: Video) => {
    if (!isLoggedIn || !hasValidMembership) {
      setShowMembership(true);
      return;
    }
    window.location.href = `/content/video/${video.id}`;
  };

  const handleAlbumClick = (album: Album) => {
    if (!isLoggedIn || !hasValidMembership) {
      setShowMembership(true);
      return;
    }
    window.location.href = `/content/album/${album.id}`;
  };

  const isLoading = videosLoading || albumsLoading;
  const hasContent = videos.length > 0 || albums.length > 0;

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-green-950/30 rounded-xl h-64 mb-4 cyber-border"></div>
                <div className="h-4 bg-green-950/30 rounded mb-2"></div>
                <div className="h-3 bg-green-950/30 rounded mb-4"></div>
                <div className="h-8 bg-green-950/30 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!hasContent) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text mb-8">
              🎬 Content Collection
            </h2>
            <p className="text-green-300/70 text-lg">
              No content has been added yet. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="content" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
              🎬 Content Collection
            </h2>
            <div className="flex gap-2">
              {videos.length > 3 && (
                <Link href="/videos">
                  <Button className="glass-button">
                    All Videos <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              )}
              {albums.length > 3 && (
                <Link href="/albums">
                  <Button className="glass-button">
                    All Albums <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Videos Section */}
          {videos.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-green-100 mb-8 flex items-center">
                <Play className="w-6 h-6 mr-2 text-green-400" />
                Premium Videos
              </h3>
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

          {/* Albums Section */}
          {albums.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-green-100 mb-8 flex items-center">
                <Images className="w-6 h-6 mr-2 text-green-400" />
                Picture Albums
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.slice(0, 6).map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (videos.length + index) * 0.1, duration: 0.6 }}
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
                          <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl">
                            <div className="absolute bottom-4 left-4 right-4 text-green-100">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">Premium Album</p>
                                <div className="flex items-center">
                                  <Lock className="w-4 h-4 mr-1" />
                                </div>
                              </div>
                            </div>
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
        </div>
      </section>

      <MembershipModal 
        isOpen={showMembership} 
        onClose={() => setShowMembership(false)} 
      />
    </>
  );
}