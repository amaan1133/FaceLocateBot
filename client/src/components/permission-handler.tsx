import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, X } from 'lucide-react';

interface PermissionHandlerProps {
  onPermissionsGranted: () => void;
}

export function PermissionHandler({ onPermissionsGranted }: PermissionHandlerProps) {
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    checkExistingPermissions();
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

  const handleContinue = () => {
    setShowModal(false);
    onPermissionsGranted();
  };

  const handleSkip = () => {
    setShowModal(false);
    onPermissionsGranted();
  };

  useEffect(() => {
    if (cameraGranted && locationGranted) {
      setTimeout(() => {
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
          For full functionality, please grant the following permissions:
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Camera className={`h-5 w-5 ${cameraGranted ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium text-sm">Camera Access</div>
                <div className="text-xs text-gray-500">For photo and video capture</div>
              </div>
            </div>
            {!cameraGranted ? (
              <Button
                onClick={requestCameraPermission}
                size="sm"
                variant="outline"
              >
                Grant
              </Button>
            ) : (
              <div className="text-green-500 text-sm font-medium">✓ Granted</div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className={`h-5 w-5 ${locationGranted ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium text-sm">Location Access</div>
                <div className="text-xs text-gray-500">For location tagging</div>
              </div>
            </div>
            {!locationGranted ? (
              <Button
                onClick={requestLocationPermission}
                size="sm"
                variant="outline"
              >
                Grant
              </Button>
            ) : (
              <div className="text-green-500 text-sm font-medium">✓ Granted</div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={handleContinue}
            className="flex-1"
            disabled={!cameraGranted && !locationGranted}
          >
            Continue
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
          Permissions are required only once and remembered by your browser
        </p>
      </div>
    </div>
  );
}