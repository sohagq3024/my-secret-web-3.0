import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Share2, Lock, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoPreview } from '@/components/ui/file-upload';
import { getPriceLabelFromCategory } from '@/lib/fileUpload';
import type { Video } from '@shared/schema';

export default function VideoDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: video, isLoading } = useQuery<Video>({
    queryKey: ['/api/videos', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-32"></div>
            <div className="h-96 bg-gray-800 rounded"></div>
            <div className="h-32 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Video Not Found</h1>
          <Button onClick={() => setLocation('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const isLocked = video.priceCategory !== 'free';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-green-400 hover:text-green-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Video Player Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                {isLocked ? (
                  <div className="relative h-96 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative z-10 text-center">
                      <Lock className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
                      <Badge variant="secondary" className="bg-green-600 text-white text-lg px-4 py-2">
                        {getPriceLabelFromCategory(video.priceCategory)}
                      </Badge>
                      <div className="mt-4">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Get Access to Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <VideoPreview
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    className="w-full h-96"
                  />
                )}
                
                {/* Free badge for free videos */}
                {!isLocked && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      FREE
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Video Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Title and Meta */}
          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-3">
              {video.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              {video.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{video.duration}</span>
                </div>
              )}
              {video.isFeatured && (
                <Badge variant="secondary" className="bg-yellow-600">
                  Featured
                </Badge>
              )}
              <Badge variant="outline" className="border-green-600 text-green-400">
                {getPriceLabelFromCategory(video.priceCategory)}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {video.description}
              </p>
            </CardContent>
          </Card>

          {/* Premium Access Notice */}
          {isLocked && (
            <Card className="bg-red-900/20 border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Lock className="h-8 w-8 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Premium Video</h3>
                    <p className="text-gray-300 mb-4">
                      This video requires a subscription to watch. Get access to this and many more premium videos.
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-red-600 text-red-400 text-base px-3 py-1">
                        {getPriceLabelFromCategory(video.priceCategory)}
                      </Badge>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Subscribe Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interactions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" className="text-green-400 hover:text-green-300">
                    <Heart className="h-5 w-5 mr-2" />
                    Like
                  </Button>
                  <Button variant="ghost" className="text-green-400 hover:text-green-300">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Comment
                  </Button>
                  <Button variant="ghost" className="text-green-400 hover:text-green-300">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Comments</h3>
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}