import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Video, Camera, Send, MapPin, Loader2 } from 'lucide-react';
import { cameraService } from '@/lib/camera';
import { locationService, type LocationData } from '@/lib/location';
import { sendPhotoToTelegram, sendLocationToTelegram } from '@/lib/telegram';
import { NotificationToast } from './notification-toast';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<Blob | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Getting location...');
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = async () => {
    try {
      const locationData = await locationService.getCurrentLocation();
      setLocation(locationData);
      setLocationStatus(`Location ready (±${Math.round(locationData.accuracy)}m)`);
    } catch (error: any) {
      setLocationStatus('Location unavailable');
      showNotification('warning', 'Location Access', error.message || 'Could not get location. Photo will be sent without location data.');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const startCamera = async () => {
    setIsStartingCamera(true);
    try {
      const stream = await cameraService.startCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        showNotification('success', 'Camera Started', 'Camera is now active and ready to capture');
      }
    } catch (error: any) {
      showNotification('error', 'Camera Error', error.message || 'Could not access camera. Please check permissions.');
    } finally {
      setIsStartingCamera(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !isCameraActive) return;

    try {
      const photoBlob = await cameraService.capturePhoto(videoRef.current);
      const photoUrl = URL.createObjectURL(photoBlob);
      setCapturedPhoto(photoUrl);
      setCurrentPhoto(photoBlob);
      showNotification('success', 'Photo Captured', 'Photo ready to send to Telegram');
    } catch (error: any) {
      showNotification('error', 'Capture Error', error.message || 'Could not capture photo');
    }
  };

  const sendToTelegram = async () => {
    if (!currentPhoto) return;

    setIsSending(true);
    try {
      const result = await sendPhotoToTelegram(currentPhoto, location || undefined);
      
      if (result.ok) {
        showNotification('success', 'Sent Successfully!', 'Photo and location sent to Telegram');
        
        // Send location as separate message if available
        if (location) {
          await sendLocationToTelegram(location);
        }
        
        // Close modal after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error(result.description || 'Failed to send photo');
      }
    } catch (error: any) {
      showNotification('error', 'Send Failed', error.message || 'Could not send photo to Telegram');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    cameraService.stopCamera();
    setIsCameraActive(false);
    setCapturedPhoto(null);
    setCurrentPhoto(null);
    setLocation(null);
    setLocationStatus('Getting location...');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-youtube-secondary border-youtube-elevated max-w-md w-full mx-4 p-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Capture Photo</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Camera Preview */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
                      autoPlay
                      muted
                      playsInline
                    />
                    {!isCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Camera className="mx-auto text-6xl mb-4 opacity-50" size={64} />
                          <p>Camera will appear here</p>
                          <p className="text-sm mt-2">Click "Start Camera" to begin</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col space-y-4">
                {!isCameraActive && !capturedPhoto && (
                  <Button
                    onClick={startCamera}
                    disabled={isStartingCamera}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    {isStartingCamera ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Video className="mr-2 h-4 w-4" />
                    )}
                    {isStartingCamera ? 'Starting...' : 'Start Camera'}
                  </Button>
                )}
                
                {isCameraActive && !capturedPhoto && (
                  <Button
                    onClick={capturePhoto}
                    className="w-full bg-youtube-red hover:bg-red-600 text-white font-semibold py-3"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                )}

                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className={`h-4 w-4 ${location ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className="text-gray-300">{locationStatus}</span>
                  </div>
                </div>
                
                {capturedPhoto && (
                  <Button
                    onClick={sendToTelegram}
                    disabled={isSending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  >
                    {isSending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isSending ? 'Sending...' : 'Send to Telegram'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
