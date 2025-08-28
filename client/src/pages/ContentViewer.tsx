import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Lock, 
  AlertCircle,
  Images,
  Clock,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { MembershipModal } from "@/components/MembershipModal";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLoading } from "@/hooks/use-loading";
import { Celebrity, Album, Video } from "@shared/schema";

export function ContentViewer() {
  const { type, id } = useParams();
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch content based on type
  const { data: content, isLoading, error } = useQuery({
    queryKey: [`/api/${type}s`, id],
    queryFn: async () => {
      const response = await fetch(`/api/${type}s/${id}`);
      if (!response.ok) {
        throw new Error('Content not found');
      }
      return response.json();
    },
    enabled: !!type && !!id,
  });

  const showLoading = useLoading(isLoading, { minLoadingTime: 800, delay: 300 });

  // Check access permissions - DISABLED FOR FREE ACCESS MODE
  useEffect(() => {
    // All content is now freely accessible
    // Membership restrictions temporarily disabled
  }, [content, isLoggedIn, hasValidMembership, type]);

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    // Simulate download - in a real app, this would trigger actual download
    alert("Download started! Your content will be available shortly.");
  };

  if (showLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingScreen 
          message="Loading content..." 
          size="lg" 
          variant="overlay"
        />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Content not found or failed to load.
            </AlertDescription>
          </Alert>
          <Link href="/">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has access - FREE ACCESS MODE ENABLED
  const hasAccess = true; // All content is freely accessible

  // Access denial screen removed - FREE ACCESS MODE
  // All content is now freely accessible without restrictions

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link href={`/${type === "celebrity" ? "celebrities" : `${type}s`}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {type === "celebrity" ? "Celebrities" : type === "album" ? "Albums" : "Videos"}
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              {type !== "celebrity" && (
                <Badge variant="outline" className="text-primary border-primary">
                  ${content.price}
                </Badge>
              )}
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              {type === "celebrity" && (
                <div className="relative">
                  <img
                    src={content.imageUrl}
                    alt={content.name}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h1 className="text-4xl font-bold mb-2">{content.name}</h1>
                    <p className="text-xl">{content.profession}</p>
                  </div>
                </div>
              )}

              {type === "album" && (
                <div className="relative">
                  <img
                    src={content.imageUrl}
                    alt={content.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Images className="w-4 h-4 mr-1" />
                        <span>{content.imageCount} images</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {type === "video" && (
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-96 object-contain"
                    poster={content.thumbnailUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={content.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center space-x-4 mb-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlay}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      
                      <div className="flex-1 flex items-center space-x-2">
                        <span className="text-white text-sm">{formatTime(currentTime)}</span>
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          value={currentTime}
                          onChange={handleSeek}
                          className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-white text-sm">{formatTime(duration)}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <h2 className="text-white text-xl font-bold">{content.title}</h2>
                  </div>
                </div>
              )}

              <CardContent className="p-6">
                {type === "celebrity" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">About {content.name}</h2>
                    <p className="text-gray-600 mb-4">
                      {content.description || `Learn more about ${content.name}, a talented ${content.profession} in the industry.`}
                    </p>
                    <div className="flex items-center space-x-6">
                      <div>
                        <span className="text-sm text-gray-500">Profession</span>
                        <p className="font-semibold">{content.profession}</p>
                      </div>
                      {!content.isFree && (
                        <div>
                          <span className="text-sm text-gray-500">Price</span>
                          <p className="font-semibold text-primary">${content.price}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {type === "album" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{content.title}</h2>
                    <p className="text-gray-600 mb-6">{content.description}</p>
                    
                    {/* Album Gallery Placeholder */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: content.imageCount || 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
                        >
                          <Images className="w-8 h-8 text-primary/50" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {type === "video" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{content.title}</h2>
                    <p className="text-gray-600 mb-4">{content.description}</p>
                    <div className="flex items-center space-x-6">
                      {content.duration && (
                        <div>
                          <span className="text-sm text-gray-500">Duration</span>
                          <p className="font-semibold flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {content.duration}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Price</span>
                        <p className="font-semibold text-primary">${content.price}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Added</span>
                        <p className="font-semibold">{new Date(content.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MembershipModal 
        isOpen={showMembership} 
        onClose={() => setShowMembership(false)} 
      />
    </>
  );
}
