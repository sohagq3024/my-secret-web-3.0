import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play, Clock } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "./MembershipModal";

export function VideoSection() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const response = await fetch("/api/videos?featured=true");
      return response.json();
    },
  });

  const handleVideoClick = (video: Video) => {
    if (!isLoggedIn || !hasValidMembership) {
      setShowMembership(true);
      return;
    }
    // Navigate to video content
    window.location.href = `/content/video/${video.id}`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="content-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="videos" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-gray-800">Premium Videos</h2>
            <Link href="/videos">
              <Button variant="ghost" className="text-primary hover:text-primary-dark font-semibold">
                See All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="content-grid">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="group cursor-pointer card-hover bg-white overflow-hidden"
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
                    {video.duration && (
                      <div className="absolute bottom-4 left-4 glass-effect text-white px-2 py-1 rounded text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{video.title}</h3>
                    <p className="text-gray-600 mb-4">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${video.price}</span>
                      <Button
                        size="sm"
                        className="gradient-primary text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <MembershipModal 
        isOpen={showMembership} 
        onClose={() => setShowMembership(false)} 
      />
    </>
  );
}