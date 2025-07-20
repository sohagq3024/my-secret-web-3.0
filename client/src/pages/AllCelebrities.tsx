import { useQuery } from "@tanstack/react-query";
import { Celebrity } from "@shared/schema";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MembershipModal } from "@/components/MembershipModal";

export function AllCelebrities() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [showMembership, setShowMembership] = useState(false);

  const { data: celebrities = [], isLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const handleCelebrityClick = (celebrity: Celebrity) => {
    if (!celebrity.isFree && (!isLoggedIn || !hasValidMembership)) {
      setShowMembership(true);
      return;
    }
    // Navigate to celebrity content
    window.location.href = `/content/celebrity/${celebrity.id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="celebrity-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
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
              <h1 className="text-3xl font-bold text-gray-800">All Celebrities</h1>
            </div>
            <Badge variant="outline" className="text-sm">
              {celebrities.length} celebrities
            </Badge>
          </div>
          
          <div className="celebrity-grid">
            {celebrities.map((celebrity) => (
              <Card
                key={celebrity.id}
                className="group cursor-pointer card-hover bg-white border-0 shadow-lg"
                onClick={() => handleCelebrityClick(celebrity)}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg aspect-square">
                    <img
                      src={celebrity.imageUrl}
                      alt={celebrity.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-white">
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {celebrity.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{celebrity.profession}</p>
                    {celebrity.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {celebrity.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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
