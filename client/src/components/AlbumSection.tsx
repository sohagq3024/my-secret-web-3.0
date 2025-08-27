import { useQuery } from "@tanstack/react-query";
import { Album } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Images } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "./MembershipModal";

export function AlbumSection() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  const { data: albums = [], isLoading } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
    queryFn: async () => {
      const response = await fetch("/api/albums?featured=true");
      return response.json();
    },
  });

  const handleAlbumClick = (album: Album) => {
    // FREE ACCESS MODE - All albums are accessible
    window.location.href = `/content/album/${album.id}`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="content-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="albums" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-foreground">Super Hot Albums</h2>
            <Link href="/albums">
              <Button variant="ghost" className="text-primary hover:text-primary-dark font-semibold">
                See All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="content-grid">
            {albums.map((album) => (
              <Card
                key={album.id}
                className="group cursor-pointer card-hover bg-card overflow-hidden"
                onClick={() => handleAlbumClick(album)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={album.thumbnailUrl}
                      alt={album.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 gradient-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${album.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-card-foreground mb-2">{album.title}</h3>
                    <p className="text-muted-foreground mb-4">{album.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
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
        </div>
      </section>

      <MembershipModal 
        isOpen={showMembership} 
        onClose={() => setShowMembership(false)} 
      />
    </>
  );
}
