import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlideshowImage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MembershipModal } from "./MembershipModal";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function Slideshow() {
  const { isLoggedIn, hasValidMembership } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMembership, setShowMembership] = useState(false);

  const { data: slides = [], isLoading } = useQuery<SlideshowImage[]>({
    queryKey: ["/api/slideshow"],
  });

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const handleGetStarted = () => {
    // FREE ACCESS MODE - Portal is always accessible
    // No membership required
  };

  if (isLoading || slides.length === 0) {
    return (
      <section className="relative h-[70vh] hero-gradient flex items-center justify-center">
        <div className="absolute inset-0 matrix-bg"></div>
        <div className="relative text-center text-green-100 z-10">
          <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
            Premium Content Awaits
          </h2>
          <p className="text-xl mb-8 text-green-300/80">Exclusive access to encrypted digital content</p>
          <Button
            onClick={handleGetStarted}
            className="cyber-button text-lg px-10 py-4 hover:shadow-green-500/25"
          >
            <span className="mr-2">🔓</span>
            Access Portal
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative h-[70vh] overflow-hidden">
        <AnimatePresence mode="wait">
          {slides.map((slide, index) => (
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeInOut",
                  opacity: { duration: 0.6 }
                }}
                className="absolute inset-0"
              >
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.7), rgba(6, 78, 59, 0.5)), url(${slide.imageUrl})`,
                  }}
                >
                  <div className="absolute inset-0 matrix-bg"></div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-center text-green-100"
                    >
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-xl mb-8 text-green-300/80"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                      >
                        <Button
                          onClick={handleGetStarted}
                          className="cyber-button text-lg px-10 py-4 hover:shadow-green-500/25"
                        >
                          <span className="mr-2">🔓</span>
                          Access Portal
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
        
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            >
              {index === currentSlide && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-full h-full bg-green-400 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </section>

      <MembershipModal 
        isOpen={showMembership} 
        onClose={() => setShowMembership(false)} 
      />
    </>
  );
}
