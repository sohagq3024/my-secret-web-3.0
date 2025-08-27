import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Globe, User, Star, Play, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPriceLabelFromCategory } from '@/lib/fileUpload';
import type { Profile, Album, Video } from '@shared/schema';

export default function ProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ['/api/profiles', id],
    enabled: !!id,
  });

  const { data: albums } = useQuery<Album[]>({
    queryKey: ['/api/albums'],
    select: (data) => data.filter(album => album.profileId === parseInt(id!)),
    enabled: !!id,
  });

  const { data: videos } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
    select: (data) => data.filter(video => video.profileId === parseInt(id!)),
    enabled: !!id,
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h1>
          <Button onClick={() => setLocation('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-green-400 hover:text-green-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="md:w-1/4">
                  <div className="relative">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {profile.isFree ? (
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        Free Content
                      </Badge>
                    ) : (
                      <Badge className="absolute top-2 right-2 bg-yellow-600">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="md:w-3/4 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-green-400 mb-2">
                      {profile.name}
                    </h1>
                    <p className="text-xl text-foreground mb-4">
                      {profile.profession}
                    </p>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {profile.dateOfBirth && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Born: {profile.dateOfBirth}</span>
                      </div>
                    )}
                    {profile.gender && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Gender: {profile.gender}</span>
                      </div>
                    )}
                    {profile.nationality && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>Nationality: {profile.nationality}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {profile.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-green-400 mb-2">About</h3>
                      <p className="text-foreground leading-relaxed">
                        {profile.description}
                      </p>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">
                        {albums?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Albums</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">
                        {videos?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Videos</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="albums" className="space-y-6">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="albums" className="data-[state=active]:bg-green-600">
                <Image className="h-4 w-4 mr-2" />
                Albums ({albums?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-green-600">
                <Play className="h-4 w-4 mr-2" />
                Videos ({videos?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Albums Tab */}
            <TabsContent value="albums">
              {albums && albums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card 
                        className="bg-card border-border overflow-hidden group hover:border-green-600 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/album/${album.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={album.thumbnailUrl}
                              alt={album.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant="secondary" 
                                className={
                                  album.priceCategory === 'free' 
                                    ? 'bg-green-600' 
                                    : 'bg-yellow-600'
                                }
                              >
                                {getPriceLabelFromCategory(album.priceCategory)}
                              </Badge>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-foreground">
                                  {album.imageCount} images
                                </span>
                                {album.isFeatured && (
                                  <Star className="h-4 w-4 text-yellow-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                              {album.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {album.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Albums</h3>
                    <p className="text-sm text-gray-500">This profile doesn't have any albums yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              {videos && videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card 
                        className="bg-card border-border overflow-hidden group hover:border-green-600 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/video/${video.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant="secondary" 
                                className={
                                  video.priceCategory === 'free' 
                                    ? 'bg-green-600' 
                                    : 'bg-yellow-600'
                                }
                              >
                                {getPriceLabelFromCategory(video.priceCategory)}
                              </Badge>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              {video.duration && (
                                <Badge variant="secondary" className="bg-black/60 text-white">
                                  {video.duration}
                                </Badge>
                              )}
                            </div>
                            {video.isFeatured && (
                              <div className="absolute top-2 left-2">
                                <Star className="h-5 w-5 text-yellow-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                              {video.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {video.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Videos</h3>
                    <p className="text-sm text-gray-500">This profile doesn't have any videos yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}