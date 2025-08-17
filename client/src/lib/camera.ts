export interface CameraError {
  name: string;
  message: string;
}

export class CameraService {
  private mediaStream: MediaStream | null = null;

  async startCamera(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: facingMode
        },
        audio: false
      });
      return this.mediaStream;
    } catch (error) {
      throw this.handleCameraError(error as Error);
    }
  }

  async startVideoRecording(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        },
        audio: true
      });
      return this.mediaStream;
    } catch (error) {
      throw this.handleCameraError(error as Error);
    }
  }

  capturePhoto(video: HTMLVideoElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not capture photo'));
        }
      }, 'image/jpeg', 0.95);
    });
  }

  recordVideo(stream: MediaStream, duration: number = 5000): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      mediaRecorder.onerror = (event) => {
        reject(new Error('Recording failed'));
      };
      
      mediaRecorder.start();
      
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration);
    });
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  private handleCameraError(error: Error): CameraError {
    if (error.name === 'NotAllowedError') {
      return {
        name: 'Permission Denied',
        message: 'Camera access was denied. Please allow camera permissions and try again.'
      };
    } else if (error.name === 'NotFoundError') {
      return {
        name: 'No Camera Found',
        message: 'No camera device was found on this device.'
      };
    } else if (error.name === 'NotReadableError') {
      return {
        name: 'Camera In Use',
        message: 'Camera is already in use by another application.'
      };
    } else {
      return {
        name: 'Camera Error',
        message: error.message || 'An unknown camera error occurred.'
      };
    }
  }
}

export const cameraService = new CameraService();
