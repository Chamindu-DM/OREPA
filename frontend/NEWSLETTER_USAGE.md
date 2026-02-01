# Newsletter Feature Usage Guide

## Overview
The newsletter feature uses **react-pageflip** library combined with **PDF.js** to display PDF newsletters in an interactive flipbook format. PDFs are converted to high-quality images with proper rendering of embedded images and text.

## Adding a New Newsletter

### Step 1: Place Your PDF File
Copy your newsletter PDF to:
```
/frontend/public/newsletters/
```

**Important:** Avoid spaces in filenames. Use hyphens or underscores instead.
- ✅ Good: `january-2026.pdf` or `january_2026.pdf`
- ❌ Bad: `January 2026.pdf` (requires URL encoding)

### Step 2: (Optional) Add a Cover Image
Place a cover image in:
```
/frontend/public/newsletters/covers/
```

Recommended format: JPG or PNG
Recommended size: 600x800px or similar aspect ratio (3:4)

### Step 3: Update the Newsletter Data
Edit `/frontend/src/app/newsletters/page.tsx` and add your newsletter to the `newslettersData` array:

```typescript
const newslettersData: Newsletter[] = [
    {
        id: 1,
        title: 'OREPA Newsletter - January 2026',
        date: 'January 2026',
        pdfUrl: '/newsletters/january-2026.pdf',
        coverImage: '/newsletters/covers/january-2026.jpg'
    },
    // Add your new newsletter here
    {
        id: 2,
        title: 'Your Newsletter Title',
        date: 'Month Year',
        pdfUrl: '/newsletters/your-file.pdf',
        coverImage: '/newsletters/covers/your-cover.jpg'
    }
];
```

### If Your Filename Has Spaces
If you must use a filename with spaces, URL-encode them:
- Space → `%20`
- Example: `January 2026.pdf` → `January%202026.pdf`

```typescript
pdfUrl: '/newsletters/January%202026.pdf',
coverImage: '/newsletters/covers/January%202026.png'
```

## Features

### React-PageFlip + PDF.js Features
- **PDF.js Rendering**: Converts PDF pages to high-quality images (95% JPEG quality at 2.5x scale)
- **Image Support**: Properly displays all images embedded in PDFs with enhanced rendering
- **3D Page Flipping**: Realistic page-turning animation via react-pageflip
- **Navigation Controls**: Previous/Next buttons and page counter
- **Responsive**: Works on desktop and mobile devices
- **Touch Support**: Swipe gestures on touch devices
- **Cover Display**: Optional cover images for newsletter cards

### Current PDF Rendering Configuration
The PDF rendering is configured with:
- Scale: 2.5x for high quality
- Canvas context: Non-alpha, optimized for static content
- White background for proper display
- Display intent for optimal rendering
- Software rendering (no WebGL) for reliability
- Support for XFA forms, fonts, and character maps
- JPEG compression at 95% quality for performance

## Libraries Used

The project uses two main libraries:
- **react-pageflip** (v2.0.3): Interactive flipbook component
  - Documentation: [https://www.npmjs.com/package/react-pageflip](https://www.npmjs.com/package/react-pageflip)
- **pdfjs-dist** (v5.4.530): PDF rendering engine
  - Documentation: [https://mozilla.github.io/pdf.js/](https://mozilla.github.io/pdf.js/)

## Troubleshooting

### PDF Not Loading
1. Check that the PDF file exists in `/public/newsletters/`
2. Verify the filename in `newslettersData` matches exactly (case-sensitive)
3. Check browser console for errors
4. Ensure the PDF is not corrupted

### Images Not Showing in PDF
The improved PDF.js configuration should handle images correctly. If they don't show:
1. Check if the PDF itself has the images (open it in a normal PDF viewer)
2. Check browser console for rendering errors
3. The PDF is rendered at 2.5x scale with proper image intent
4. Try opening the PDF in a different browser to rule out browser-specific issues

### Cover Image Not Displaying
1. Verify the image file exists in `/public/newsletters/covers/`
2. Check the file extension matches (`.jpg`, `.png`, etc.)
3. Ensure the filename is correct in `newslettersData`

## Troubleshooting

```
frontend/
├── public/
│   └── newsletters/
│       ├── january-2026.pdf
│       ├── december-2025.pdf
│       └── covers/
│           ├── january-2026.jpg
│           └── december-2025.jpg
└── src/
    └── app/
        └── newsletters/
            └── page.tsx (Update this file to add newsletters)
```

## Example: Adding February 2026 Newsletter

1. **Add files:**
   ```bash
   # Copy PDF
   cp february-2026.pdf frontend/public/newsletters/
   
   # Copy cover image
   cp february-cover.jpg frontend/public/newsletters/covers/
   ```

2. **Update page.tsx:**
   ```typescript
   const newslettersData: Newsletter[] = [
       // ...existing newsletters...
       {
           id: 3,
           title: 'OREPA Newsletter - February 2026',
           date: 'February 2026',
           pdfUrl: '/newsletters/february-2026.pdf',
           coverImage: '/newsletters/covers/february-cover.jpg'
       }
   ];
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   npm start
   ```

That's it! Your newsletter will appear on the newsletters page.
