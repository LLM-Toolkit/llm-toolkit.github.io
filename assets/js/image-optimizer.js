/**
 * Image Optimization Utility
 * Provides advanced image optimization features for better performance
 * Includes automatic compression, format conversion, and accessibility features
 */

class ImageOptimizer {
    constructor() {
        this.supportedFormats = this.detectSupportedFormats();
        this.connectionType = this.getConnectionType();
        this.compressionSettings = this.getCompressionSettings();
        this.altTextGenerator = new AltTextGenerator();
        this.init();
    }

    init() {
        this.optimizeAllImages();
        this.setupResponsiveImages();
        this.implementProgressiveLoading();
        this.setupImageCompression();
        this.enhanceAccessibility();
        this.setupFormatConversion();
    }

    detectSupportedFormats() {
        const formats = {
            webp: false,
            avif: false,
            jpeg2000: false
        };

        // WebP support removed - using PNG format
        formats.webp = false;

        // Test AVIF support
        try {
            const avifCanvas = document.createElement('canvas');
            avifCanvas.width = 1;
            avifCanvas.height = 1;
            formats.avif = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
        } catch (e) {
            formats.avif = false;
        }

        return formats;
    }

    getConnectionType() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                saveData: connection.saveData || false
            };
        }
        return { effectiveType: 'unknown', downlink: 0, saveData: false };
    }

    getCompressionSettings() {
        const { effectiveType, saveData } = this.connectionType;
        
        // Adjust compression based on connection speed
        if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
            return {
                quality: 0.6,
                maxWidth: 800,
                maxHeight: 600,
                format: 'webp'
            };
        } else if (effectiveType === '3g') {
            return {
                quality: 0.75,
                maxWidth: 1200,
                maxHeight: 900,
                format: 'webp'
            };
        } else {
            return {
                quality: 0.85,
                maxWidth: 1600,
                maxHeight: 1200,
                format: 'avif'
            };
        }
    }

    optimizeAllImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.optimizeImage(img));
    }

    optimizeImage(img) {
        // Add loading optimization attributes
        if (!img.hasAttribute('loading')) {
            const rect = img.getBoundingClientRect();
            const isAboveFold = rect.top < window.innerHeight;
            img.loading = isAboveFold ? 'eager' : 'lazy';
        }

        // Add decoding optimization
        img.decoding = 'async';

        // Set fetch priority based on position
        if (img.getBoundingClientRect().top < window.innerHeight) {
            img.fetchPriority = 'high';
        }

        // Optimize based on connection type
        this.applyConnectionOptimizations(img);

        // Add error handling
        this.addErrorHandling(img);
    }

    applyConnectionOptimizations(img) {
        const { effectiveType, saveData } = this.connectionType;

        // Apply data saver optimizations
        if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
            img.style.imageRendering = '-webkit-optimize-contrast';
            
            // Skip non-critical images on slow connections
            if (!this.isCriticalImage(img)) {
                img.loading = 'lazy';
                img.style.display = 'none';
            }
        }

        // High-quality rendering for fast connections
        if (effectiveType === '4g') {
            img.style.imageRendering = '-webkit-crisp-edges';
        }
    }

    isCriticalImage(img) {
        // Determine if image is critical for initial page load
        const criticalSelectors = [
            '.hero-image-container img',
            '.feature-image img',
            'img[data-critical="true"]'
        ];

        return criticalSelectors.some(selector => img.matches(selector));
    }

    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.createResponsiveSources(img);
        });
    }

    createResponsiveSources(img) {
        const baseSrc = img.dataset.src;
        if (!baseSrc) return;

        // Create picture element for better format support
        if (img.parentElement.tagName !== 'PICTURE') {
            const picture = document.createElement('picture');
            img.parentNode.insertBefore(picture, img);
            picture.appendChild(img);

            // Add source elements for different formats
            if (this.supportedFormats.avif) {
                const avifSource = document.createElement('source');
                avifSource.type = 'image/avif';
                avifSource.srcset = this.generateSrcSet(baseSrc, 'avif');
                picture.insertBefore(avifSource, img);
            }

            // WebP support removed - using PNG format only
        }
    }

    generateSrcSet(baseSrc, format) {
        const basePath = baseSrc.replace(/\.[^/.]+$/, '');
        const sizes = [400, 800, 1200, 1600];
        
        return sizes.map(size => `${basePath}-${size}w.${format} ${size}w`).join(', ');
    }

    implementProgressiveLoading() {
        const progressiveImages = document.querySelectorAll('img[data-progressive]');
        progressiveImages.forEach(img => {
            this.loadProgressively(img);
        });
    }

    loadProgressively(img) {
        const lowQualitySrc = img.dataset.progressive;
        const highQualitySrc = img.dataset.src;

        if (!lowQualitySrc || !highQualitySrc) return;

        // Load low quality placeholder first
        img.src = lowQualitySrc;
        img.classList.add('progressive-loading');

        // Preload high quality version
        const highQualityImg = new Image();
        highQualityImg.onload = () => {
            img.src = highQualitySrc;
            img.classList.remove('progressive-loading');
            img.classList.add('progressive-loaded');
        };

        // Start loading high quality version
        setTimeout(() => {
            highQualityImg.src = highQualitySrc;
        }, 100);
    }

    addErrorHandling(img) {
        img.addEventListener('error', (e) => {
            console.warn('Image failed to load:', img.src);
            
            // Try fallback formats
            this.tryFallbackFormats(img);
        });
    }

    tryFallbackFormats(img) {
        const originalSrc = img.src || img.dataset.src;
        const basePath = originalSrc.replace(/\.[^/.]+$/, '');
        const fallbackFormats = ['jpg', 'png', 'gif', 'svg'];

        let formatIndex = 0;
        const tryNext = () => {
            if (formatIndex < fallbackFormats.length) {
                const fallbackSrc = `${basePath}.${fallbackFormats[formatIndex]}`;
                const testImg = new Image();
                
                testImg.onload = () => {
                    img.src = fallbackSrc;
                };
                
                testImg.onerror = () => {
                    formatIndex++;
                    tryNext();
                };
                
                testImg.src = fallbackSrc;
            } else {
                // All formats failed, show placeholder
                img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23f8f9fa"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236c757d">Image not available</text></svg>';
                img.classList.add('error');
            }
        };

        tryNext();
    }

    // Public method to optimize a new image
    optimizeNewImage(img) {
        this.optimizeImage(img);
        this.createResponsiveSources(img);
    }

    setupImageCompression() {
        // Set up canvas for client-side image compression
        this.compressionCanvas = document.createElement('canvas');
        this.compressionContext = this.compressionCanvas.getContext('2d');
        
        // Monitor for new images that need compression
        this.observeNewImages();
    }

    observeNewImages() {
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                            images.forEach(img => this.processNewImage(img));
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    processNewImage(img) {
        this.optimizeImage(img);
        this.createResponsiveSources(img);
        this.enhanceImageAccessibility(img);
        this.compressImageIfNeeded(img);
    }

    compressImageIfNeeded(img) {
        // Only compress if image is large or connection is slow
        const shouldCompress = this.connectionType.saveData || 
                              this.connectionType.effectiveType === 'slow-2g' ||
                              this.connectionType.effectiveType === '2g';
        
        if (shouldCompress && img.naturalWidth > 800) {
            this.compressImage(img);
        }
    }

    compressImage(img) {
        const { quality, maxWidth, maxHeight } = this.compressionSettings;
        
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let newWidth = Math.min(img.naturalWidth, maxWidth);
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }
        
        // Set canvas dimensions
        this.compressionCanvas.width = newWidth;
        this.compressionCanvas.height = newHeight;
        
        // Draw and compress image
        this.compressionContext.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to optimized format
        const compressedDataUrl = this.compressionCanvas.toDataURL(`image/${this.compressionSettings.format}`, quality);
        
        // Replace image source with compressed version
        img.src = compressedDataUrl;
        img.setAttribute('data-compressed', 'true');
    }

    setupFormatConversion() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.convertImageFormat(img);
        });
    }

    convertImageFormat(img) {
        const originalSrc = img.dataset.src;
        if (!originalSrc) return;
        
        // Determine best format based on browser support
        let bestFormat = 'jpg'; // fallback
        if (this.supportedFormats.avif) {
            bestFormat = 'avif';
        } else {
            bestFormat = 'png';
        }
        
        // Update src to use best format
        const newSrc = originalSrc.replace(/\.(jpg|jpeg|png|gif)$/i, `.${bestFormat}`);
        img.dataset.src = newSrc;
        
        // Add fallback handling
        img.addEventListener('error', () => {
            this.handleFormatFallback(img, originalSrc);
        });
    }

    handleFormatFallback(img, originalSrc) {
        const fallbackFormats = ['webp', 'jpg', 'png'];
        let currentFormatIndex = 0;
        
        const tryNextFormat = () => {
            if (currentFormatIndex < fallbackFormats.length) {
                const format = fallbackFormats[currentFormatIndex];
                const fallbackSrc = originalSrc.replace(/\.(jpg|jpeg|png|gif|webp|avif)$/i, `.${format}`);
                
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = fallbackSrc;
                };
                testImg.onerror = () => {
                    currentFormatIndex++;
                    tryNextFormat();
                };
                testImg.src = fallbackSrc;
            } else {
                // All formats failed, use original
                img.src = originalSrc;
            }
        };
        
        tryNextFormat();
    }

    enhanceAccessibility() {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.enhanceImageAccessibility(img));
    }

    enhanceImageAccessibility(img) {
        // Generate alt text if missing or inadequate
        if (!img.alt || img.alt.trim() === '' || img.alt === 'image') {
            const generatedAlt = this.altTextGenerator.generateAltText(img);
            img.alt = generatedAlt;
        }
        
        // Add ARIA attributes for better accessibility
        if (!img.hasAttribute('role')) {
            img.setAttribute('role', 'img');
        }
        
        // Add loading state for screen readers
        if (img.loading === 'lazy') {
            img.setAttribute('aria-busy', 'true');
            
            img.addEventListener('load', () => {
                img.removeAttribute('aria-busy');
            });
        }
        
        // Ensure proper focus handling
        if (img.closest('a')) {
            img.setAttribute('tabindex', '-1');
        }
    }

    // Public method to get optimization stats
    getOptimizationStats() {
        return {
            supportedFormats: this.supportedFormats,
            connectionType: this.connectionType,
            compressionSettings: this.compressionSettings,
            optimizedImages: document.querySelectorAll('img[loading]').length,
            compressedImages: document.querySelectorAll('img[data-compressed="true"]').length,
            accessibilityEnhanced: document.querySelectorAll('img[role="img"]').length
        };
    }
}

/**
 * Alt Text Generator for Accessibility
 * Generates descriptive alt text based on image context and attributes
 */
class AltTextGenerator {
    constructor() {
        this.contextKeywords = {
            hero: ['hero', 'banner', 'main'],
            icon: ['icon', 'symbol', 'logo'],
            illustration: ['illustration', 'graphic', 'diagram'],
            comparison: ['comparison', 'vs', 'versus'],
            documentation: ['doc', 'guide', 'manual'],
            ai: ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'llm'],
            tools: ['tool', 'software', 'framework', 'library']
        };
    }

    generateAltText(img) {
        // Try to extract context from various sources
        const context = this.extractContext(img);
        const filename = this.extractFilename(img);
        const surroundingText = this.extractSurroundingText(img);
        
        // Generate descriptive alt text
        let altText = this.buildAltText(context, filename, surroundingText);
        
        // Ensure alt text is appropriate length and descriptive
        altText = this.refineAltText(altText);
        
        return altText;
    }

    extractContext(img) {
        const contexts = [];
        
        // Check class names
        const classList = Array.from(img.classList);
        classList.forEach(className => {
            Object.keys(this.contextKeywords).forEach(key => {
                if (this.contextKeywords[key].some(keyword => 
                    className.toLowerCase().includes(keyword))) {
                    contexts.push(key);
                }
            });
        });
        
        // Check parent containers
        let parent = img.parentElement;
        while (parent && parent !== document.body) {
            const parentClass = parent.className.toLowerCase();
            Object.keys(this.contextKeywords).forEach(key => {
                if (this.contextKeywords[key].some(keyword => 
                    parentClass.includes(keyword))) {
                    contexts.push(key);
                }
            });
            parent = parent.parentElement;
        }
        
        return [...new Set(contexts)]; // Remove duplicates
    }

    extractFilename(img) {
        const src = img.src || img.dataset.src || '';
        const filename = src.split('/').pop().split('.')[0];
        return filename.replace(/[-_]/g, ' ').toLowerCase();
    }

    extractSurroundingText(img) {
        const texts = [];
        
        // Check nearby headings
        const nearbyHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        nearbyHeadings.forEach(heading => {
            if (this.isNearElement(img, heading)) {
                texts.push(heading.textContent.trim());
            }
        });
        
        // Check parent text content
        let parent = img.parentElement;
        if (parent) {
            const parentText = parent.textContent.replace(img.alt || '', '').trim();
            if (parentText.length > 0 && parentText.length < 100) {
                texts.push(parentText);
            }
        }
        
        return texts;
    }

    isNearElement(img, element) {
        const imgRect = img.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Check if elements are within reasonable distance
        const distance = Math.sqrt(
            Math.pow(imgRect.left - elementRect.left, 2) + 
            Math.pow(imgRect.top - elementRect.top, 2)
        );
        
        return distance < 200; // pixels
    }

    buildAltText(contexts, filename, surroundingTexts) {
        let altText = '';
        
        // Start with context-based description
        if (contexts.includes('hero')) {
            altText = 'Hero illustration showing ';
        } else if (contexts.includes('icon')) {
            altText = 'Icon representing ';
        } else if (contexts.includes('illustration')) {
            altText = 'Illustration depicting ';
        } else {
            altText = 'Image showing ';
        }
        
        // Add subject matter based on contexts and filename
        const subjects = [];
        if (contexts.includes('ai') || filename.includes('ai')) {
            subjects.push('artificial intelligence');
        }
        if (contexts.includes('tools') || filename.includes('tool')) {
            subjects.push('development tools');
        }
        if (contexts.includes('comparison') || filename.includes('vs')) {
            subjects.push('tool comparison');
        }
        if (contexts.includes('documentation') || filename.includes('doc')) {
            subjects.push('documentation');
        }
        
        // Use filename as fallback subject
        if (subjects.length === 0 && filename) {
            subjects.push(filename.replace(/[-_]/g, ' '));
        }
        
        // Add surrounding context
        if (surroundingTexts.length > 0) {
            const relevantText = surroundingTexts[0].substring(0, 50);
            if (relevantText && !subjects.some(s => relevantText.toLowerCase().includes(s))) {
                subjects.push(`related to ${relevantText}`);
            }
        }
        
        altText += subjects.join(' and ') || 'content';
        
        return altText;
    }

    refineAltText(altText) {
        // Ensure proper length (recommended 125 characters or less)
        if (altText.length > 125) {
            altText = altText.substring(0, 122) + '...';
        }
        
        // Capitalize first letter
        altText = altText.charAt(0).toUpperCase() + altText.slice(1);
        
        // Remove redundant words
        altText = altText.replace(/\b(image|picture|photo|graphic)\b/gi, '').trim();
        
        // Clean up spacing
        altText = altText.replace(/\s+/g, ' ').trim();
        
        return altText;
    }
}

// Initialize image optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer = new ImageOptimizer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageOptimizer;
}