/**
 * Enhanced Performance Optimization Module
 * Handles critical CSS inlining, resource preloading, image optimization, and performance monitoring
 */

class PerformanceOptimizer {
    constructor() {
        this.criticalResources = [
            'assets/css/styles.css',
            'assets/js/main.js',
            'assets/js/seo-meta-generator.js'
        ];
        this.imageFormats = ['webp', 'avif', 'jpg', 'png'];
        this.performanceMetrics = {};
        this.init();
    }

    init() {
        this.detectCapabilities();
        this.inlineCriticalCSS();
        this.preloadCriticalResources();
        this.optimizeResourceLoading();
        this.setupImageOptimization();
        this.monitorPerformance();
        this.setupServiceWorker();
    }

    detectCapabilities() {
        // Detect WebP support
        this.supportsWebP = this.checkWebPSupport();
        
        // Detect AVIF support
        this.supportsAVIF = this.checkAVIFSupport();
        
        // Detect connection type
        this.connectionType = this.getConnectionType();
        
        // Add capability classes to document
        document.documentElement.classList.toggle('webp', this.supportsWebP);
        document.documentElement.classList.toggle('avif', this.supportsAVIF);
        document.documentElement.classList.add(`connection-${this.connectionType}`);
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

    getConnectionType() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType) {
                return connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
            }
        }
        return 'unknown';
    }

    inlineCriticalCSS() {
        // Critical CSS is already inlined in HTML, but we can optimize it further
        const criticalStyle = document.querySelector('style');
        if (criticalStyle) {
            // Add performance optimizations to critical CSS
            const additionalCriticalCSS = `
                /* Performance optimizations */
                img { content-visibility: auto; }
                .features-section { content-visibility: auto; }
                .resources-section { content-visibility: auto; }
                
                /* Reduce layout shifts */
                img[width][height] { aspect-ratio: attr(width) / attr(height); }
                
                /* Optimize animations for performance */
                @media (prefers-reduced-motion: no-preference) {
                    .cta-primary, .cta-secondary { will-change: transform; }
                    .hero-image-container img { will-change: transform; }
                }
            `;
            criticalStyle.textContent += additionalCriticalCSS;
        }
    }

    preloadCriticalResources() {
        // Preload critical CSS if not already done
        if (!document.querySelector('link[href="assets/css/styles.css"][rel="preload"]')) {
            this.preloadResource('assets/css/styles.css', 'style');
        }

        // Preload critical JavaScript based on priority
        this.criticalResources.forEach((resource, index) => {
            setTimeout(() => {
                this.preloadResource(resource, 'script');
            }, index * 50); // Stagger preloading to avoid blocking
        });
        
        // Preload hero image with format detection
        this.preloadOptimalImage('assets/images/hero-ai-illustration', 'image');
        
        // Preload feature icons
        const featureIcons = [
            'documentation-icon',
            'comparison-icon', 
            'ai-tools-icon'
        ];
        
        featureIcons.forEach(icon => {
            this.preloadOptimalImage(`assets/images/${icon}`, 'image');
        });
        
        // Prefetch key pages based on user behavior patterns
        this.prefetchKeyPages();
    }

    preloadOptimalImage(basePath, as) {
        let imagePath = basePath;
        
        // Choose optimal format based on support
        if (this.supportsAVIF) {
            imagePath += '.avif';
        } else {
            imagePath += '.png';
        }
        
        // Adjust for connection type
        if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
            // Skip preloading on slow connections
            return;
        }
        
        this.preloadResource(imagePath, as);
    }

    prefetchKeyPages() {
        const keyPages = [
            'documents/llm-guide.html',
            'comparisons/ggufloader-vs-lmstudio.html',
            'documents/ai-tools-overview.html',
            'comparisons/ollama-comparison.html'
        ];
        
        // Prefetch after initial load to avoid blocking critical resources
        setTimeout(() => {
            keyPages.forEach((page, index) => {
                setTimeout(() => {
                    this.preloadResource(page, 'document');
                }, index * 200);
            });
        }, 2000);
    }

    preloadResource(href, as, crossorigin = false) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (crossorigin) {
            link.crossOrigin = 'anonymous';
        }

        // Add onload handler for stylesheets
        if (as === 'style') {
            link.onload = function() {
                this.onload = null;
                this.rel = 'stylesheet';
            };
        }

        document.head.appendChild(link);
    }

    optimizeResourceLoading() {
        // Defer non-critical JavaScript
        this.deferNonCriticalJS();
        
        // Optimize font loading
        this.optimizeFontLoading();
        
        // Add resource hints for external domains
        this.addResourceHints();
    }

    deferNonCriticalJS() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                // Only defer if it's not critical
                if (!this.isCriticalScript(script.src)) {
                    script.defer = true;
                }
            }
        });
    }

    isCriticalScript(src) {
        const criticalScripts = [
            'main.js',
            'seo-meta-generator.js',
            'canonical-url-manager.js'
        ];
        return criticalScripts.some(critical => src.includes(critical));
    }

    optimizeFontLoading() {
        // Add font-display: swap to improve loading performance
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: system-ui;
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    setupImageOptimization() {
        // Create responsive image sources based on device capabilities
        this.optimizeExistingImages();
        
        // Set up intersection observer for advanced lazy loading
        this.setupAdvancedLazyLoading();
        
        // Implement progressive image loading
        this.setupProgressiveImageLoading();
    }

    optimizeExistingImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            // Add responsive loading attributes
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
            
            // Add decoding hint for better performance
            img.decoding = 'async';
            
            // Set up optimal image format
            this.setOptimalImageSource(img);
        });
    }

    setOptimalImageSource(img) {
        const originalSrc = img.dataset.src;
        if (!originalSrc) return;
        
        // Extract base path and extension
        const basePath = originalSrc.replace(/\.[^/.]+$/, '');
        
        // Set optimal format based on browser support
        let optimalSrc = originalSrc;
        if (this.supportsAVIF && originalSrc.includes('.png')) {
            optimalSrc = basePath + '.avif';
        } else if (!originalSrc.includes('.png')) {
            optimalSrc = basePath + '.png';
        }
        
        img.dataset.src = optimalSrc;
    }

    setupAdvancedLazyLoading() {
        // Enhanced lazy loading with priority hints
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImageWithPriority(img);
                        lazyImageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                lazyImageObserver.observe(img);
            });
        }
    }

    loadImageWithPriority(img) {
        // Determine loading priority based on position
        const rect = img.getBoundingClientRect();
        const isAboveFold = rect.top < window.innerHeight;
        
        if (isAboveFold) {
            img.fetchPriority = 'high';
        }
        
        // Load the image
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        
        img.classList.add('loaded');
    }

    setupProgressiveImageLoading() {
        // Implement progressive JPEG loading for better perceived performance
        const progressiveImages = document.querySelectorAll('img[data-progressive]');
        progressiveImages.forEach(img => {
            const lowQualitySrc = img.dataset.progressive;
            const highQualitySrc = img.dataset.src;
            
            // Load low quality first
            img.src = lowQualitySrc;
            img.classList.add('progressive-loading');
            
            // Preload high quality version
            const highQualityImg = new Image();
            highQualityImg.onload = () => {
                img.src = highQualitySrc;
                img.classList.remove('progressive-loading');
                img.classList.add('progressive-loaded');
            };
            highQualityImg.src = highQualitySrc;
        });
    }

    setupServiceWorker() {
        // Register service worker for caching and performance
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    addResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];

        hints.forEach(hint => {
            if (!document.querySelector(`link[href="${hint.href}"]`)) {
                const link = document.createElement('link');
                link.rel = hint.rel;
                link.href = hint.href;
                if (hint.crossorigin) {
                    link.crossOrigin = 'anonymous';
                }
                document.head.appendChild(link);
            }
        });
    }

    monitorPerformance() {
        // Monitor Core Web Vitals if supported
        if ('PerformanceObserver' in window) {
            this.observeWebVitals();
        }

        // Monitor resource loading
        this.monitorResourceTiming();
        
        // Monitor critical resource loading
        this.monitorCriticalResources();
        
        // Set up performance budget monitoring
        this.setupPerformanceBudget();
    }

    observeWebVitals() {
        try {
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.performanceMetrics.lcp = lastEntry.startTime;
                console.log('LCP:', lastEntry.startTime);
                
                // Alert if LCP is poor (> 2.5s)
                if (lastEntry.startTime > 2500) {
                    console.warn('Poor LCP detected:', lastEntry.startTime);
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    const fid = entry.processingStart - entry.startTime;
                    this.performanceMetrics.fid = fid;
                    console.log('FID:', fid);
                    
                    // Alert if FID is poor (> 100ms)
                    if (fid > 100) {
                        console.warn('Poor FID detected:', fid);
                    }
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.performanceMetrics.cls = clsValue;
                console.log('CLS:', clsValue);
                
                // Alert if CLS is poor (> 0.1)
                if (clsValue > 0.1) {
                    console.warn('Poor CLS detected:', clsValue);
                }
            }).observe({ entryTypes: ['layout-shift'] });

            // First Contentful Paint (FCP)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.performanceMetrics.fcp = entry.startTime;
                    console.log('FCP:', entry.startTime);
                });
            }).observe({ entryTypes: ['paint'] });

        } catch (error) {
            console.warn('Performance monitoring not fully supported:', error);
        }
    }

    monitorCriticalResources() {
        // Monitor critical CSS loading
        const criticalCSS = document.querySelector('link[href="assets/css/styles.css"]');
        if (criticalCSS) {
            criticalCSS.addEventListener('load', () => {
                console.log('Critical CSS loaded');
            });
        }

        // Monitor critical JS loading
        this.criticalResources.forEach(resource => {
            const script = document.querySelector(`script[src="${resource}"]`);
            if (script) {
                script.addEventListener('load', () => {
                    console.log(`Critical resource loaded: ${resource}`);
                });
            }
        });
    }

    setupPerformanceBudget() {
        // Set performance budgets
        const budgets = {
            totalPageSize: 1024 * 1024, // 1MB
            totalRequests: 50,
            criticalResourceTime: 1000, // 1s
            imageSize: 500 * 1024 // 500KB per image
        };

        window.addEventListener('load', () => {
            setTimeout(() => {
                this.checkPerformanceBudget(budgets);
            }, 2000);
        });
    }

    checkPerformanceBudget(budgets) {
        const resources = performance.getEntriesByType('resource');
        
        // Check total page size
        const totalSize = resources.reduce((total, resource) => {
            return total + (resource.transferSize || 0);
        }, 0);
        
        if (totalSize > budgets.totalPageSize) {
            console.warn(`Performance budget exceeded: Total size ${totalSize} > ${budgets.totalPageSize}`);
        }
        
        // Check total requests
        if (resources.length > budgets.totalRequests) {
            console.warn(`Performance budget exceeded: Total requests ${resources.length} > ${budgets.totalRequests}`);
        }
        
        // Check image sizes
        const images = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|webp|avif)$/i));
        images.forEach(img => {
            if (img.transferSize > budgets.imageSize) {
                console.warn(`Large image detected: ${img.name} (${img.transferSize} bytes)`);
            }
        });
    }

    monitorResourceTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources.filter(resource => 
                    resource.duration > 1000 // Resources taking more than 1 second
                );
                
                if (slowResources.length > 0) {
                    console.warn('Slow loading resources:', slowResources);
                }
            }, 1000);
        });
    }

    // Method to preload additional resources dynamically
    preloadAdditionalResource(href, as) {
        this.preloadResource(href, as);
    }
}

// Initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}