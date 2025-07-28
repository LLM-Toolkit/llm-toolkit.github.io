/**
 * Lazy Loading and Image Optimization Module
 * Implements intersection observer for performance optimization
 */

class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    root: null,
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );
            this.observeImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.imageObserver.unobserve(img);
            }
        });
    }

    loadImage(img) {
        // Determine optimal image format and size
        const optimalSrc = this.getOptimalImageSrc(img);
        
        // Create a new image element for preloading
        const imageLoader = new Image();
        
        // Set up loading priority
        const rect = img.getBoundingClientRect();
        const isAboveFold = rect.top < window.innerHeight;
        
        if (isAboveFold) {
            imageLoader.fetchPriority = 'high';
        }
        
        // Handle successful load
        imageLoader.onload = () => {
            // Load the actual image
            img.src = optimalSrc;
            
            // Load srcset if available
            if (img.dataset.srcset) {
                img.srcset = this.getOptimalSrcSet(img.dataset.srcset);
                img.removeAttribute('data-srcset');
            }
            
            // Add loaded class for CSS transitions
            img.classList.add('loaded');
            img.classList.remove('lazy-load');
            img.classList.add('fade-in');
            
            // Remove data-src attribute
            img.removeAttribute('data-src');
            
            // Add decoding optimization
            img.decoding = 'async';
        };
        
        // Handle loading errors with fallback
        imageLoader.onerror = () => {
            this.handleImageError(img);
        };
        
        // Start loading
        imageLoader.src = optimalSrc;
    }

    getOptimalImageSrc(img) {
        const originalSrc = img.dataset.src;
        if (!originalSrc) return '';
        
        // Check for WebP/AVIF support and adjust accordingly
        const supportsWebP = this.checkWebPSupport();
        const supportsAVIF = this.checkAVIFSupport();
        
        // Extract base path without extension
        const basePath = originalSrc.replace(/\.[^/.]+$/, '');
        const extension = originalSrc.split('.').pop();
        
        // Return optimal format based on browser support
        if (supportsAVIF && extension !== 'svg') {
            return basePath + '.avif';
        } else if (extension !== 'svg') {
            return basePath + '.png';
        }
        
        return originalSrc;
    }

    getOptimalSrcSet(srcset) {
        // Convert srcset to optimal formats
        const supportsWebP = this.checkWebPSupport();
        const supportsAVIF = this.checkAVIFSupport();
        
        return srcset.replace(/(\S+\.(jpg|jpeg|png))/g, (match, imagePath) => {
            const basePath = imagePath.replace(/\.[^/.]+$/, '');
            if (supportsAVIF) {
                return basePath + '.avif';
            } else {
                return basePath + '.png';
            }
            return imagePath;
        });
    }

    handleImageError(img) {
        // Try fallback formats
        const originalSrc = img.dataset.src;
        const basePath = originalSrc.replace(/\.[^/.]+$/, '');
        
        // Try different formats in order of preference
        const fallbackFormats = ['jpg', 'png', 'gif'];
        let formatIndex = 0;
        
        const tryNextFormat = () => {
            if (formatIndex < fallbackFormats.length) {
                const fallbackSrc = basePath + '.' + fallbackFormats[formatIndex];
                const fallbackLoader = new Image();
                
                fallbackLoader.onload = () => {
                    img.src = fallbackSrc;
                    img.classList.add('loaded');
                    img.classList.remove('lazy-load');
                };
                
                fallbackLoader.onerror = () => {
                    formatIndex++;
                    tryNextFormat();
                };
                
                fallbackLoader.src = fallbackSrc;
            } else {
                // All formats failed, show error state
                img.classList.add('error');
                img.alt = 'Image failed to load';
                console.warn('Failed to load image with all fallback formats:', originalSrc);
            }
        };
        
        tryNextFormat();
    }

    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    checkAVIFSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        try {
            return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
        } catch (e) {
            return false;
        }
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.classList.add('lazy-load');
            this.imageObserver.observe(img);
        });
    }

    loadAllImages() {
        // Fallback: load all images immediately
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    // Method to add new images dynamically
    addImage(img) {
        if (this.imageObserver) {
            img.classList.add('lazy-load');
            this.imageObserver.observe(img);
        } else {
            this.loadImage(img);
        }
    }

    // Cleanup method
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
    }
}

// Initialize lazy loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}