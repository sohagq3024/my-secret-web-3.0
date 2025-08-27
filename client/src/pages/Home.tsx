import { Slideshow } from "@/components/Slideshow";
import { ProfileSection } from "@/components/ProfileSection";
import { ContentSection } from "@/components/ContentSection";
import { Shield, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import logoImage from "@assets/A_casual_photo_of_Design_a_pro_1752865588870.png";

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="space-y-12">
        <Slideshow />
        <ProfileSection />
        <ContentSection />
      </main>

      {/* Footer */}
      <footer className="cyber-border bg-gray-900/90 backdrop-blur-xl border-t border-green-500/30 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={logoImage} 
                  alt="My Secret Web"
                  className="w-8 h-8 rounded-lg border border-green-500/30"
                />
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
                  My Secret Web
                </h3>
              </div>
              <p className="text-green-300/70">
                Premium digital content platform providing exclusive access to high-quality albums and videos through secure, encrypted delivery.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-300">Quick Access</h4>
              <ul className="space-y-2 text-green-300/70">
                <li><a href="/" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>🏠</span><span>Home</span>
                </a></li>
                <li><a href="/celebrities" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>⭐</span><span>Celebrities</span>
                </a></li>
                <li><a href="/albums" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>📸</span><span>Albums</span>
                </a></li>
                <li><a href="/videos" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                  <span>🎬</span><span>Videos</span>
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-300">Support Portal</h4>
              <ul className="space-y-2 text-green-300/70">
                <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-300">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Facebook className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Twitter className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Instagram className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
                <a href="#" className="w-10 h-10 cyber-border rounded-full flex items-center justify-center hover:border-green-400/50 transition-all duration-300 group">
                  <Youtube className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </a>
              </div>
              <div className="mt-6 text-xs text-green-300/50">
                <p>🔒 Secured by blockchain technology</p>
                <p>🛡️ End-to-end encryption</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-500/30 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-green-300/70">
              <Shield className="w-4 h-4" />
              <p>&copy; 2025 My Secret Web. All rights reserved. Powered by quantum encryption.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
