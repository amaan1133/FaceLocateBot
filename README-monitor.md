# Telegram File Monitor

Automatically monitors a folder and sends new files to your Telegram bot.

## Setup Instructions

### 1. Install Node.js
Download and install Node.js from: https://nodejs.org/

### 2. Install Dependencies
```bash
npm run install-deps
```

### 3. Configure the Monitor
Edit `file-monitor.js` and update these settings:
- `WATCH_FOLDER`: Path to the folder you want to monitor
- Your Telegram bot token and chat ID are already configured

### 4. Run the Monitor
```bash
npm start
```

## How It Works

1. **Automatic Monitoring**: Watches your specified folder for new files
2. **Instant Upload**: Sends new files to your Telegram bot immediately
3. **Smart Organization**: Moves sent files to a "sent" subfolder
4. **File Type Detection**: Automatically handles images and documents
5. **Error Handling**: Continues running even if some files fail

## Usage Examples

### Monitor Your Downloads Folder
```javascript
const WATCH_FOLDER = '/Users/YourName/Downloads';
```

### Monitor Your Screenshots (Windows)
```javascript
const WATCH_FOLDER = 'C:\\Users\\YourName\\Pictures\\Screenshots';
```

### Monitor Your Phone's DCIM Folder (if mounted)
```javascript
const WATCH_FOLDER = '/path/to/phone/DCIM/Camera';
```

## Phone Integration Options

### Android
1. **USB Connection**: Connect phone via USB, enable file transfer
2. **Network Share**: Use apps like "FTP Server" to share folders
3. **Cloud Sync**: Monitor cloud sync folders (Google Photos, Dropbox)

### iPhone
1. **iCloud Photos**: Monitor iCloud Photos folder on computer
2. **iTunes File Sharing**: Use iTunes to access app documents
3. **Third-party Apps**: Use apps that can export to computer folders

## Advanced Configuration

### Custom File Filters
```javascript
const watcher = chokidar.watch(WATCH_FOLDER, {
  ignored: [
    /^\./, // ignore dotfiles
    '**/*.tmp', // ignore temporary files
    '**/sent/**' // ignore sent folder
  ]
});
```

### Multiple Folders
```javascript
const watcher = chokidar.watch([
  './watch_folder',
  '/path/to/screenshots',
  '/path/to/downloads'
], options);
```

## Stopping the Monitor
Press `Ctrl+C` in the terminal to stop monitoring.

## Troubleshooting

- **Permission Errors**: Run with administrator/sudo privileges
- **File Not Found**: Check folder paths are correct
- **Telegram Errors**: Verify bot token and chat ID
- **Large Files**: Telegram has a 50MB file size limit