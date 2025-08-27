import { useQuery } from "@tanstack/react-query";
import { Celebrity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "./MembershipModal";

export function CelebritySection() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  const { data: celebrities = [], isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const handleCelebrityClick = (celebrity: Celebrity) => {
    // FREE ACCESS MODE - All celebrity content is accessible
    window.location.href = `/content/celebrity/${celebrity.id}`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="celebrity-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-green-950/30 rounded-xl mb-4 cyber-border"></div>
                <div className="h-4 bg-green-950/30 rounded mb-2"></div>
                <div className="h-3 bg-green-950/30 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="celebrity" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
              ⭐ Celebrity Collection
            </h2>
            <Link href="/celebrities">
              <Button className="glass-button">
                Access All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="celebrity-grid">
            {celebrities.slice(0, 4).map((celebrity) => (
              <Card
                key={celebrity.id}
                className="group cursor-pointer card-hover premium-card"
                onClick={() => handleCelebrityClick(celebrity)}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-xl aspect-square">
                    <img
                      src={celebrity.imageUrl}
                      alt={celebrity.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-green-100">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">
                            {celebrity.isFree ? "Free Access" : "Premium Access"}
                          </p>
                          {!celebrity.isFree && (
                            <div className="flex items-center">
                              <Lock className="w-4 h-4 mr-1" />
                              <span className="text-sm">${celebrity.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-green-100 mb-1">
                      {celebrity.name}
                    </h3>
                    <p className="text-sm text-green-300/70">{celebrity.profession}</p>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                      {celebrity.isFree ? (
                        <span className="text-xs px-2 py-1 bg-green-600/30 text-green-300 rounded-full border border-green-500/50">
                          Free Access
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-amber-600/30 text-amber-300 rounded-full border border-amber-500/50 flex items-center">
                          <Lock className="w-3 h-3 mr-1" />
                          ${celebrity.price}
                        </span>
                      )}
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
