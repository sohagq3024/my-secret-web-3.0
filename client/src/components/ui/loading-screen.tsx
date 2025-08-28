import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "overlay" | "inline";
}

export function LoadingScreen({ 
  message = "Loading...", 
  size = "md", 
  variant = "overlay" 
}: LoadingScreenProps) {
  const sizeConfig = {
    sm: { dots: "h-2 w-2", container: "gap-1", text: "text-sm" },
    md: { dots: "h-3 w-3", container: "gap-2", text: "text-base" },
    lg: { dots: "h-4 w-4", container: "gap-3", text: "text-lg" }
  };

  const config = sizeConfig[size];

  const overlayClasses = variant === "overlay" 
    ? "fixed inset-0 bg-black/90 backdrop-blur-sm z-50" 
    : "w-full";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`${overlayClasses} flex items-center justify-center`}
      data-testid="loading-screen"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Animated dots */}
        <div className={`flex items-center ${config.container}`}>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`${config.dots} bg-green-500 rounded-full`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Loading message */}
        <motion.p
          className={`${config.text} text-green-400 font-medium`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>

        {/* Pulse ring animation */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-2 border-green-500/30 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 w-16 h-16 border-2 border-green-400/50 rounded-full"
            animate={{ scale: [1.2, 1.4, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton loader for content placeholders
export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gray-800/50 rounded-md ${className}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      data-testid="skeleton-loader"
    />
  );
}

// Card skeleton for album/profile cards
export function CardSkeleton() {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
      <SkeletonLoader className="h-48 w-full" />
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader className="h-3 w-1/2" />
    </div>
  );
}

// List skeleton for loading multiple items
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}