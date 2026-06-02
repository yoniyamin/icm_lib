# PWA Setup Instructions

## ✅ Files Created

I've created the following PWA files for your library management system:

1. **`public/manifest.json`** - Web app manifest for Android and modern browsers
2. **`public/sw.js`** - Service worker for offline functionality
3. **`src/registerSW.js`** - Service worker registration logic
4. **Updated `index.html`** - Added PWA meta tags for both iOS and Android
5. **Updated `src/main.jsx`** - Added service worker registration

## 📱 Next Steps - Move Your Icons

You need to move your icon files from `src/static/` to `public/icons/`:

### Copy iOS Icons:
Move these files from `src/static/ios/` to `public/icons/ios/`:
- icm-120.png
- icm-152.png
- icm-167.png
- icm-180.png

### Copy Android Icons:
Move these files from `src/static/android/` to `public/icons/android/`:
- icm-72.png
- icm-96.png
- icm-128.png
- icm-144.png
- icm-152.png
- icm-192.png
- icm-384.png
- icm-512.png

**Commands to copy:**
```bash
# For Windows (cmd):
copy src\static\ios\*.png public\icons\ios\
copy src\static\android\*.png public\icons\android\

# Or for PowerShell:
Copy-Item src\static\ios\*.png public\icons\ios\
Copy-Item src\static\android\*.png public\icons\android\
```

## 🚀 Testing Your PWA

### 1. Build the project:
```bash
npm run build
```

### 2. Preview the build:
```bash
npm run preview
```

### 3. Test on mobile devices:

#### For Android:
1. Open Chrome on your Android device
2. Navigate to your deployed app (e.g., https://yoniyamin.github.io/icm_lib)
3. Tap the three dots menu → "Install app" or "Add to Home Screen"
4. The app will install with your custom icon

#### For iOS (iPhone/iPad):
1. Open Safari on your iOS device
2. Navigate to your deployed app
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. The app will be added with your custom icon

## 🎨 PWA Features Included

- ✅ **Offline Support**: Service worker caches essential files
- ✅ **Install Prompt**: Users can install the app on their home screen
- ✅ **Custom Icons**: Proper sized icons for all devices
- ✅ **Splash Screen**: Automatic on iOS and Android
- ✅ **Standalone Mode**: App runs without browser UI
- ✅ **Theme Color**: Blue theme color (#1976d2)

## 🔧 Customization

### Change Theme Color:
Edit these files:
- `public/manifest.json` - Update `theme_color` and `background_color`
- `index.html` - Update `<meta name="theme-color">`

### Update App Name:
Edit `public/manifest.json`:
```json
{
  "name": "Your Full App Name",
  "short_name": "Short Name"
}
```

### Cache More Resources:
Edit `public/sw.js` and add URLs to the `urlsToCache` array:
```javascript
const urlsToCache = [
  '/icm_lib/',
  '/icm_lib/index.html',
  '/icm_lib/favicon.png',
  // Add more URLs here
];
```

## 🧪 Development Testing

During development, you can test PWA features using Chrome DevTools:

1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check "Service Workers" to see registration status
4. Check "Manifest" to validate your manifest.json
5. Use "Lighthouse" tab to audit PWA compliance

## 📝 Important Notes

- PWAs require **HTTPS** in production (GitHub Pages provides this)
- Service workers only work on **localhost** or **HTTPS** domains
- iOS Safari has some PWA limitations compared to Android
- Clear browser cache if you update the service worker

## 🐛 Troubleshooting

**Service Worker not registering?**
- Check browser console for errors
- Ensure you're on localhost or HTTPS
- Clear cache and hard reload (Ctrl+Shift+R)

**Icons not showing?**
- Verify icons are in `public/icons/` directory
- Check icon paths in `manifest.json`
- Ensure icons are the correct sizes

**App not installing?**
- Check manifest.json is accessible at `/icm_lib/manifest.json`
- Verify all required icon sizes are present
- Run Lighthouse PWA audit for specific issues

## ✨ Deploy

When you deploy to GitHub Pages:
```bash
npm run deploy
```

The PWA will be fully functional at https://yoniyamin.github.io/icm_lib

