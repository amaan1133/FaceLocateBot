const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const TELEGRAM_BOT_TOKEN = '7653297508:AAE_sfu893LJ-D5Z5xtr_sjy-XEJvvf7haQ';
const TELEGRAM_CHAT_ID = '5776427389';
const WATCH_FOLDER = './watch_folder'; // Change this to your desired folder path

// Create watch folder if it doesn't exist
if (!fs.existsSync(WATCH_FOLDER)) {
  fs.mkdirSync(WATCH_FOLDER, { recursive: true });
  console.log(`Created watch folder: ${WATCH_FOLDER}`);
}

// Function to send file to Telegram
async function sendFileToTelegram(filePath) {
  try {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);
    const stats = fs.statSync(filePath);
    
    // Determine if it's an image or document
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
    const endpoint = isImage ? 'sendPhoto' : 'sendDocument';
    const fileField = isImage ? 'photo' : 'document';
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append(fileField, fileStream, fileName);
    formData.append('caption', `📁 Auto-sent: ${fileName}\n📅 ${new Date().toLocaleString()}\n📏 Size: ${formatFileSize(stats.size)}`);

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ Successfully sent: ${fileName}`);
      
      // Move file to sent folder to avoid re-sending
      const sentFolder = path.join(WATCH_FOLDER, 'sent');
      if (!fs.existsSync(sentFolder)) {
        fs.mkdirSync(sentFolder);
      }
      
      const newPath = path.join(sentFolder, fileName);
      fs.renameSync(filePath, newPath);
      console.log(`📁 Moved to sent folder: ${fileName}`);
      
    } else {
      console.error(`❌ Failed to send ${fileName}:`, result.description);
    }

  } catch (error) {
    console.error(`❌ Error sending ${path.basename(filePath)}:`, error.message);
  }
}

// Function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Set up file watcher
console.log(`🔍 Watching folder: ${path.resolve(WATCH_FOLDER)}`);
console.log(`📱 Telegram Bot: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
console.log(`💬 Chat ID: ${TELEGRAM_CHAT_ID}`);
console.log('⏰ Monitoring started. Add files to the watch folder to auto-send them.');

const watcher = chokidar.watch(WATCH_FOLDER, {
  ignored: [
    /^\./, // ignore dotfiles
    '**/sent/**', // ignore sent folder
    '**/node_modules/**' // ignore node_modules
  ],
  persistent: true,
  ignoreInitial: true // Don't process existing files on startup
});

// Watch for new files
watcher.on('add', (filePath) => {
  console.log(`📄 New file detected: ${path.basename(filePath)}`);
  
  // Small delay to ensure file is fully written
  setTimeout(() => {
    sendFileToTelegram(filePath);
  }, 1000);
});

// Watch for errors
watcher.on('error', (error) => {
  console.error('❌ Watcher error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down file monitor...');
  watcher.close();
  process.exit(0);
});

console.log('\n📋 Instructions:');
console.log(`1. Copy/move files to: ${path.resolve(WATCH_FOLDER)}`);
console.log('2. Files will be automatically sent to your Telegram bot');
console.log('3. Sent files are moved to the "sent" subfolder');
console.log('4. Press Ctrl+C to stop monitoring\n');