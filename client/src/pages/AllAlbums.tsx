import { useQuery } from "@tanstack/react-query";
import { Album } from "@shared/schema";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Images } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "@/components/MembershipModal";

export function AllAlbums() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  const { data: albums = [], isLoading } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
  });

  const handleAlbumClick = (album: Album) => {
    if (!isLoggedIn || !hasValidMembership) {
      setShowMembership(true);
      return;
    }
    // Navigate to album content
    window.location.href = `/content/album/${album.id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="content-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">All Albums</h1>
            </div>
            <Badge variant="outline" className="text-sm">
              {albums.length} albums
            </Badge>
          </div>
          
          <div className="content-grid">
            {albums.map((album) => (
              <Card
                key={album.id}
                className="group cursor-pointer card-hover bg-white overflow-hidden"
                onClick={() => handleAlbumClick(album)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={album.imageUrl}
                      alt={album.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 gradient-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${album.price}
                    </div>
                    {album.isFeatured && (
                      <div className="absolute top-4 left-4 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{album.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{album.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Images className="w-4 h-4 mr-1" />
                        <span>{album.imageCount} images</span>
                      </div>
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

          {albums.length === 0 && (
            <div className="text-center py-16">
              <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Albums Available</h3>
              <p className="text-gray-600">Check back later for new content.</p>
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
