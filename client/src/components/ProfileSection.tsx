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
    <section id="profiles" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
            👤 Profile Collection
          </h2>
          {profiles.length > 4 && (
            <Link href="/profiles">
              <Button className="glass-button">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.slice(0, 8).map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card
                className="group cursor-pointer card-hover premium-card h-full"
                onClick={() => handleViewProfile(profile.id)}
                data-testid={`card-profile-${profile.id}`}
              >
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="relative overflow-hidden rounded-xl aspect-square">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-green-100">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">
                            {profile.isFree ? "Free Profile" : "Premium Profile"}
                          </p>
                          {!profile.isFree && profile.price && (
                            <div className="flex items-center">
                              <span className="text-sm">${profile.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 text-center flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-green-100 mb-1">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-green-300/70 mb-2">{profile.profession}</p>
                    
                    <div className="space-y-1 mb-4 flex-1">
                      {profile.dateOfBirth && (
                        <div className="flex items-center justify-center text-xs text-green-300/60">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{profile.dateOfBirth}</span>
                        </div>
                      )}
                      {profile.gender && (
                        <div className="flex items-center justify-center text-xs text-green-300/60">
                          <User className="w-3 h-3 mr-1" />
                          <span>{profile.gender}</span>
                        </div>
                      )}
                      {profile.nationality && (
                        <div className="flex items-center justify-center text-xs text-green-300/60">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{profile.nationality}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <Button
                        size="sm"
                        className="cyber-button w-full"
                        data-testid={`button-view-profile-${profile.id}`}
                      >
                        View Profile
                      </Button>
                    </div>
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