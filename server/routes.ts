import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  insertMembershipRequestSchema, 
  insertProfileSchema, 
  insertAlbumSchema, 
  insertVideoSchema,
  insertAlbumImageSchema,
  insertSlideshowImageSchema,
  insertCelebritySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Try to find user by username first, then by email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // FREE ACCESS MODE - All users have valid membership (temporary)
      // Admins always maintain access, regular users get temporary free access
      let hasValidMembership = true; // Universal free access enabled

      res.json({
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        hasValidMembership,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      const existingEmail = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Membership routes
  app.post("/api/membership/request", async (req, res) => {
    try {
      const requestData = insertMembershipRequestSchema.parse(req.body);
      const membershipRequest = await storage.createMembershipRequest(requestData);
      res.json(membershipRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/membership/requests", async (req, res) => {
    try {
      const requests = await storage.getMembershipRequests();
      // Include user information with requests
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          const user = await storage.getUser(request.userId);
          return {
            ...request,
            user: user ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            } : null,
          };
        })
      );
      res.json(requestsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch membership requests" });
    }
  });

  app.patch("/api/membership/requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({ status: z.enum(["approved", "rejected"]) }).parse(req.body);
      
      await storage.updateMembershipRequestStatus(id, status);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/membership/check/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activeMembership = await storage.getActiveMembershipByUserId(userId);
      // FREE ACCESS MODE - All users have valid membership (temporary)
      const hasValidMembership = true; // Universal free access enabled
      
      res.json({
        hasValidMembership,
        membership: activeMembership,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check membership" });
    }
  });

  // Content routes
  app.get("/api/slideshow", async (req, res) => {
    try {
      const images = await storage.getSlideshowImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slideshow images" });
    }
  });

  app.get("/api/celebrities", async (req, res) => {
    try {
      const celebrities = await storage.getCelebrities();
      res.json(celebrities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch celebrities" });
    }
  });

  app.get("/api/celebrities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const celebrity = await storage.getCelebrityById(id);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }
      res.json(celebrity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch celebrity" });
    }
  });

  app.get("/api/albums", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const albums = featured ? await storage.getFeaturedAlbums() : await storage.getAlbums();
      res.json(albums);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch albums" });
    }
  });

  app.get("/api/albums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const album = await storage.getAlbumById(id);
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }
      res.json(album);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch album" });
    }
  });

  app.get("/api/videos", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const videos = featured ? await storage.getFeaturedVideos() : await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideoById(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Profile routes
  app.get("/api/profiles", async (req, res) => {
    try {
      const profiles = await storage.getProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getProfileById(id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profileData = insertProfileSchema.partial().parse(req.body);
      await storage.updateProfile(id, profileData);
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProfile(id);
      res.json({ message: "Profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // Album images routes
  app.get("/api/albums/:id/images", async (req, res) => {
    try {
      const albumId = parseInt(req.params.id);
      const images = await storage.getAlbumImages(albumId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch album images" });
    }
  });

  app.post("/api/albums/:id/images", async (req, res) => {
    try {
      const albumId = parseInt(req.params.id);
      const imageData = insertAlbumImageSchema.parse({
        ...req.body,
        albumId
      });
      const image = await storage.createAlbumImage(imageData);
      res.json(image);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/albums/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const imageData = insertAlbumImageSchema.partial().parse(req.body);
      await storage.updateAlbumImage(id, imageData);
      res.json({ message: "Album image updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/albums/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAlbumImage(id);
      res.json({ message: "Album image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete album image" });
    }
  });

  // Admin routes for the new restructured admin panel
  
  // Admin Profile routes
  app.post("/api/admin/profiles", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/admin/profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profileData = insertProfileSchema.partial().parse(req.body);
      await storage.updateProfile(id, profileData);
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/admin/profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProfile(id);
      res.json({ message: "Profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // Admin Album routes
  app.post("/api/admin/albums", async (req, res) => {
    try {
      const albumData = insertAlbumSchema.parse(req.body);
      const album = await storage.createAlbum(albumData);
      res.json(album);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/admin/albums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const albumData = insertAlbumSchema.partial().parse(req.body);
      await storage.updateAlbum(id, albumData);
      res.json({ message: "Album updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/admin/albums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAlbum(id);
      res.json({ message: "Album deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete album" });
    }
  });

  // Admin Video routes
  app.post("/api/admin/videos", async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/admin/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const videoData = insertVideoSchema.partial().parse(req.body);
      await storage.updateVideo(id, videoData);
      res.json({ message: "Video updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/admin/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Admin Slideshow routes
  app.post("/api/admin/slideshow", async (req, res) => {
    try {
      const slideshowData = insertSlideshowImageSchema.parse(req.body);
      const image = await storage.createSlideshowImage(slideshowData);
      res.json(image);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/admin/slideshow/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const slideshowData = insertSlideshowImageSchema.partial().parse(req.body);
      await storage.updateSlideshowImage(id, slideshowData);
      res.json({ message: "Slideshow image updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/admin/slideshow/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSlideshowImage(id);
      res.json({ message: "Slideshow image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete slideshow image" });
    }
  });

  // Admin Celebrity routes (for backward compatibility)
  app.post("/api/admin/celebrities", async (req, res) => {
    try {
      const celebrityData = insertCelebritySchema.parse(req.body);
      const celebrity = await storage.createCelebrity(celebrityData);
      res.json(celebrity);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/admin/celebrities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCelebrity(id);
      res.json({ message: "Celebrity deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete celebrity" });
    }
  });

  // Enhanced album routes (kept for backward compatibility)
  app.post("/api/albums", async (req, res) => {
    try {
      const albumData = insertAlbumSchema.parse(req.body);
      const album = await storage.createAlbum(albumData);
      res.json(album);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/albums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const albumData = insertAlbumSchema.partial().parse(req.body);
      await storage.updateAlbum(id, albumData);
      res.json({ message: "Album updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/albums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAlbum(id);
      res.json({ message: "Album deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete album" });
    }
  });

  // Enhanced video routes
  app.post("/api/videos", async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const videoData = insertVideoSchema.partial().parse(req.body);
      await storage.updateVideo(id, videoData);
      res.json({ message: "Video updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Admin routes
  app.post("/api/admin/celebrities", async (req, res) => {
    try {
      const celebrityData = req.body;
      const celebrity = await storage.createCelebrity(celebrityData);
      res.json(celebrity);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/admin/albums", async (req, res) => {
    try {
      const albumData = req.body;
      const album = await storage.createAlbum(albumData);
      res.json(album);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/admin/videos", async (req, res) => {
    try {
      const videoData = req.body;
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/admin/slideshow", async (req, res) => {
    try {
      const imageData = req.body;
      const image = await storage.createSlideshowImage(imageData);
      res.json(image);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/admin/slideshow/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      await storage.deleteSlideshowImage(id);
      res.json({ message: "Slideshow image deleted successfully" });
    } catch (error) {
      console.error("Error deleting slideshow image:", error);
      res.status(500).json({ message: "Failed to delete slideshow image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
