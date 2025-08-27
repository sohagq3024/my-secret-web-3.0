import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Share2, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImagePreview } from '@/components/ui/file-upload';
import { getPriceLabelFromCategory } from '@/lib/fileUpload';
import type { Album, AlbumImage } from '@shared/schema';

export default function AlbumDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: album, isLoading: albumLoading } = useQuery<Album>({
    queryKey: ['/api/albums', id],
    enabled: !!id,
  });

  const { data: images, isLoading: imagesLoading } = useQuery<AlbumImage[]>({
    queryKey: ['/api/albums', id, 'images'],
    enabled: !!id,
  });

  if (albumLoading || imagesLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Album Not Found</h1>
          <Button onClick={() => setLocation('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const isLocked = false; // FREE ACCESS MODE - All albums are unlocked

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Album Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnail */}
            <div className="lg:w-1/3">
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <div className="relative">
                    <ImagePreview
                      src={album.thumbnailUrl}
                      alt={album.title}
                      className="w-full h-64 lg:h-80"
                    />
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="h-12 w-12 text-green-400 mx-auto mb-2" />
                          <Badge variant="secondary" className="bg-green-600 text-white">
                            {getPriceLabelFromCategory(album.priceCategory)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Album Info */}
            <div className="lg:w-2/3 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-green-400 mb-2">
                  {album.title}
                </h1>
                <p className="text-foreground leading-relaxed">
                  {album.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{album.imageCount} images</span>
                </div>
                {album.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-600">
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="border-green-600 text-green-400">
                  {getPriceLabelFromCategory(album.priceCategory)}
                </Badge>
              </div>

              {isLocked && (
                <Card className="bg-red-900/20 border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Lock className="h-6 w-6 text-red-400" />
                      <div>
                        <h3 className="font-medium text-red-400">Premium Content</h3>
                        <p className="text-sm text-foreground">
                          Subscribe to access this album - {getPriceLabelFromCategory(album.priceCategory)}
                        </p>
                      </div>
                    </div>
                    <Button className="mt-3 bg-green-600 hover:bg-green-700">
                      Get Access
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>

        {/* Album Images Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-green-400">
              Album Gallery ({images?.length || 0} images)
            </h2>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comments
              </Button>
            </div>
          </div>

          {images && images.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {images
                .sort((a, b) => a.order - b.order)
                .map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card border-border overflow-hidden group hover:border-green-600 transition-colors">
                      <CardContent className="p-0">
                        <div className="relative">
                          <ImagePreview
                            src={isLocked ? album.thumbnailUrl : image.imageUrl}
                            alt={image.description || `Image ${index + 1}`}
                            className="w-full h-64"
                          />
                          
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Lock className="h-8 w-8 text-green-400" />
                            </div>
                          )}
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-foreground">
                                {index + 1} of {images.length}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Heart className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {image.description && (
                          <div className="p-3">
                            <p className="text-sm text-foreground">
                              {image.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Images Yet</h3>
                  <p className="text-sm">This album doesn't have any images yet.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}