import { useQuery } from "@tanstack/react-query";
import { Profile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, User, MapPin, Calendar } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ListSkeleton } from "@/components/ui/loading-screen";
import { useLoading } from "@/hooks/use-loading";

export function ProfileSection() {
  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const showLoading = useLoading(isLoading, { minLoadingTime: 600, delay: 200 });

  const handleViewProfile = (profileId: number) => {
    // Navigate to profile details
    window.location.href = `/profile/${profileId}`;
  };

  if (showLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text mb-8">
            👤 Profile Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ListSkeleton count={4} />
          </div>
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text mb-8">
              👤 Profile Collection
            </h2>
            <p className="text-green-300/70 text-lg">
              No profiles have been added yet. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="profiles" className="py-20 bg-gradient-to-br from-green-950/30 to-emerald-950/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
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
          {profiles.slice(0, 8).map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card
                className="group cursor-pointer card-hover bg-gradient-to-b from-green-900/20 to-green-950/40 border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300 hover:scale-105"
                onClick={() => handleViewProfile(profile.id)}
                data-testid={`card-profile-${profile.id}`}
              >
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="relative overflow-hidden rounded-full aspect-square w-32 h-32 mx-auto mb-4">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <div className="bg-green-600/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          {profile.isFree ? "Free" : `$${profile.price}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-base font-bold text-green-100 mb-1 line-clamp-1">
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
    </section>
  );
}