import { useQuery } from "@tanstack/react-query";
import { Profile } from "@shared/schema";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function AllProfiles() {
  const [, navigate] = useLocation();

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const handleProfileClick = (profile: Profile) => {
    navigate(`/profile/${profile.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="back-to-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">All Profiles</h1>
          </div>
          <Badge variant="outline" className="text-sm" data-testid="profile-count">
            {profiles.length} profiles
          </Badge>
        </div>
        
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className="group cursor-pointer card-hover bg-card border-0 shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => handleProfileClick(profile)}
                data-testid={`profile-card-${profile.id}`}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg aspect-square">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-green-400 transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {profile.profession}
                    </p>
                    
                    {!profile.isFree && (
                      <Badge className="bg-green-600/30 text-green-100 border border-green-500/50 text-xs">
                        Premium Content
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Profiles Yet</h3>
              <p className="text-muted-foreground mb-6">
                Profiles will appear here when they are added to the platform.
              </p>
              <Link href="/">
                <Button data-testid="explore-content">
                  Explore Other Content
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}