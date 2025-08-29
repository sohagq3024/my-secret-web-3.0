import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Clock, Video as VideoIcon } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "@/components/MembershipModal";

export function AllVideos() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const handleVideoClick = (video: Video) => {
    // FREE ACCESS MODE - All videos are accessible
    window.location.href = `/content/video/${video.id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="content-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">All Videos</h1>
            </div>
            <Badge variant="outline" className="text-sm">
              {videos.length} videos
            </Badge>
          </div>
          
          <div className="content-grid">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="group cursor-pointer card-hover bg-card overflow-hidden"
                onClick={() => handleVideoClick(video)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 glass-effect rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 gradient-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${video.price}
                    </div>
                    {video.isFeatured && (
                      <div className="absolute top-4 left-4 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                        Featured
                      </div>
                    )}
                    {video.duration && (
                      <div className="absolute bottom-4 left-4 glass-effect text-white px-2 py-1 rounded text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{video.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${video.price}</span>
                      <Button
                        size="sm"
                        className="gradient-primary text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-16">
              <VideoIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Videos Available</h3>
              <p className="text-muted-foreground">Check back later for new content.</p>
            </div>
          )}
        </div>
      </div>

      <MembershipModal 
        isOpen={showMembership} 
        onClose={() => setShowMembership(false)} 
      />
    </>
  );
}
