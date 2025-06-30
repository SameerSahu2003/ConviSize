# ConviSize - Smart Image Converter

## Project Overview
ConviSize is a web-based tool for converting, resizing, and applying filters to images. This project includes both the original implementation and an optimized version with improved performance and user experience.

## Optimizations Made

### Performance Improvements
- **Minified CSS and JavaScript**: Reduced file sizes for faster loading
- **Lazy Loading**: Implemented for images to improve initial page load time
- **Optimized JavaScript**: Restructured code using module pattern for better organization and performance
- **Efficient Image Processing**: Improved canvas operations and added createImageBitmap support where available
- **Reduced DOM Operations**: Minimized unnecessary DOM manipulations

### UI/UX Improvements
- **Responsive Design**: Improved layout for all device sizes using CSS Grid
- **Modern Typography**: Added Inter font for better readability
- **Enhanced Visual Hierarchy**: Improved spacing and component organization
- **Consistent Color Scheme**: Using CSS variables for better maintainability
- **Improved Accessibility**: Better contrast ratios and semantic HTML structure

### Code Quality Improvements
- **CSS Variables**: For consistent theming and easier maintenance
- **Better Code Organization**: Modular JavaScript with clear separation of concerns
- **Improved Error Handling**: More robust handling of edge cases
- **Performance Optimizations**: Debounced events and optimized rendering

## Files

### Original Version
- `index.html` - Original HTML structure
- `styles.css` - Original CSS styling
- `script.js` - Original JavaScript functionality

### Optimized Version
- `index-optimized.html` - Improved HTML structure with better semantics
- `styles-optimized.css` - Enhanced CSS with variables and better organization
- `script-optimized.js` - Refactored JavaScript with performance improvements
- `styles-optimized.min.css` - Minified CSS for production
- `script-optimized.min.js` - Minified JavaScript for production

## How to Use

### Original Version
Open `index.html` in your browser to use the original implementation.

### Optimized Version
Open `index-optimized.html` in your browser to use the optimized implementation.

## Key Features
- Upload images via drag-and-drop or file selection
- Convert between multiple formats (JPG, PNG, WEBP, GIF, BMP)
- Adjust quality settings
- Resize images with aspect ratio preservation
- Apply filters (Grayscale, Sepia, Invert)
- Batch conversion for multiple images
- Preview converted images before download

## Browser Compatibility
The application is compatible with all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Future Improvements
- Add more image filters and effects
- Implement image cropping functionality
- Add support for more image formats
- Implement server-side processing for larger images
- Add user accounts for saving conversion preferences