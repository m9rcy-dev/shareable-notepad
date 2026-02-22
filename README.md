# 📝 Shareable Notepad

A simple, stateless notepad application that lets you share your notes via URL. Every share creates a snapshot - new modifications require generating a new link.

## ✨ Features

- **🔗 Shareable** - Share your notes with a simple link
- **👁️ Viewable** - Recipients see exactly what you shared
- **📸 Snapshot-based** - New modifications don't affect shared links
- **🚀 Stateless** - No server required, works entirely in the browser
- **🎨 Clean UI** - Simple, distraction-free interface
- **🌙 Dark Mode** - Toggle between light and dark themes
- **📏 20K Character Limit** - Safe limit for all modern browsers
- **⌨️ Keyboard Shortcuts** - `Ctrl/Cmd + S` to share, `Ctrl/Cmd + N` for new, `Ctrl/Cmd + T` for theme
- **🧪 Built-in Tests** - Run `runTests()` in console to verify functionality

## 🚀 How to Use

1. **Write** - Type your notes in the editor
2. **Share** - Click the "Share" button or press `Ctrl/Cmd + S`
3. **Copy** - The link is copied to your clipboard
4. **Send** - Paste the link anywhere to share

### Dark Mode

- Click the 🌙/☀️ button to toggle between light and dark themes
- Your preference is saved in localStorage
- Defaults to your system preference

### Character Limit

- Maximum: **20,000 characters** (safe for all browsers)
- Warning at: **18,000 characters**
- Critical at: **19,500 characters**
- The editor border changes color as you approach the limit

## 🛠️ How It Works

The notepad stores your content directly in the URL hash using URL-safe Base64 encoding:

```
https://yourdomain.com/notepad/#<encoded-content>
```

This means:
- ✅ No data is stored on any server
- ✅ Works offline after initial load
- ✅ Privacy - only people with the link can see your notes
- ✅ Each share is a snapshot - editing creates a new URL

## 🧪 Testing

Open the browser console and run:

```javascript
runTests()
```

This will execute the built-in test suite covering:
- Text encoding/decoding (ASCII, Unicode, Emoji, RTL)
- Character limit enforcement
- Edge cases (empty strings, long text)

## 📁 Project Structure

```
notepad/
├── index.html      # Main HTML structure
├── styles.css      # Clean, responsive styling with dark mode
├── app.js          # Application logic (modular design)
└── README.md       # This file
```

## 🌐 Deployment

### GitHub Pages

1. Fork or upload this repository to GitHub
2. Go to **Settings** → **Pages**
3. Select **Deploy from a branch**
4. Choose the `main` branch and `/ (root)` folder
5. Click **Save**
6. Your notepad will be live at `https://yourusername.github.io/notepad/`

### Any Static Host

Simply upload the files to any static hosting service:
- Netlify
- Vercel
- Firebase Hosting
- AWS S3
- Any web server

## 🧪 Local Development

No build step required! Just open `index.html` in your browser:

```bash
# Using Python's built-in server
python -m http.server 8000

# Or using Node.js npx
npx serve .

# Or simply open the file directly
open index.html
```

## 📝 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- All modern browsers with ES6+ support

## 📊 Character Limits

| Browser | Practical Limit |
|---------|-----------------|
| Chrome/Edge | ~20,000 characters |
| Firefox | ~45,000 characters |
| Safari | ~50,000 characters |

**Why 20K?** This ensures the notepad works reliably across all modern browsers. URLs have browser-specific length limits, and Base64 encoding expands text by ~33%.

## 🌍 Supported Characters

✅ **FULLY SUPPORTED** - All Unicode characters:

| Category | Examples |
|----------|----------|
| **Emojis** | 🎉 📝 ✨ 🚀 💻 👋 |
| **CJK Languages** | 你好 こんにち안녕하세요 |
| **RTL Languages** | مرحبا שלום |
| **European** | ñ ü é ø ß |
| **Math Symbols** | ∑ ∏ ∫ √ ∞ ≈ ≠ ≤ ≥ |
| **Currency** | € £ ¥ ₹ ₽ ₩ |
| **Code** | Full JavaScript/any code |

## 📄 License

MIT License - feel free to use, modify, and distribute!
