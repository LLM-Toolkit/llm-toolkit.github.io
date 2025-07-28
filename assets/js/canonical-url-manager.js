/**
 * Canonical URL Management System
 * Handles canonical URL generation, validation, and management
 */

class CanonicalURLManager {
    constructor(baseUrl = null) {
        this.baseUrl = baseUrl || this.detectBaseUrl();
        this.urlPatterns = this.initializeUrlPatterns();
    }

    /**
     * Detect base URL from current environment
     */
    detectBaseUrl() {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return 'https://llm-toolkit.github.io'; // Fallback for server-side
    }

    /**
     * Initialize URL patterns for different page types
     */
    initializeUrlPatterns() {
        return {
            homepage: '/',
            documents: '/documents/',
            comparisons: '/comparisons/',
            search: '/search'
        };
    }

    /**
     * Clean and normalize URL path
     */
    cleanPath(path) {
        // Remove trailing slash except for root
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        
        // Ensure path starts with /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Remove query parameters and fragments for canonical
        path = path.split('?')[0].split('#')[0];
        
        return path;
    }

    /**
     * Generate canonical URL for given path
     */
    generateCanonicalUrl(path = null) {
        if (!path) {
            path = typeof window !== 'undefined' ? window.location.pathname : '/';
        }
        
        const cleanedPath = this.cleanPath(path);
        return `${this.baseUrl}${cleanedPath}`;
    }

    /**
     * Validate if URL is properly formatted
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get canonical URL for specific page types
     */
    getCanonicalForPageType(pageType, slug = '') {
        const patterns = {
            homepage: () => this.baseUrl + '/',
            document: (slug) => this.baseUrl + '/documents/' + slug,
            comparison: (slug) => this.baseUrl + '/comparisons/' + slug,
            search: () => this.baseUrl + '/search'
        };

        if (patterns[pageType]) {
            return patterns[pageType](slug);
        }
        
        return this.generateCanonicalUrl();
    }

    /**
     * Set canonical link in document head
     */
    setCanonicalLink(url = null) {
        if (typeof document === 'undefined') return;

        const canonicalUrl = url || this.generateCanonicalUrl();
        
        if (!this.isValidUrl(canonicalUrl)) {
            console.warn('Invalid canonical URL:', canonicalUrl);
            return;
        }

        let link = document.querySelector('link[rel="canonical"]');
        
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        
        link.setAttribute('href', canonicalUrl);
    }

    /**
     * Get current canonical URL from document
     */
    getCurrentCanonical() {
        if (typeof document === 'undefined') return null;
        
        const link = document.querySelector('link[rel="canonical"]');
        return link ? link.getAttribute('href') : null;
    }

    /**
     * Validate current canonical URL
     */
    validateCurrentCanonical() {
        const current = this.getCurrentCanonical();
        const expected = this.generateCanonicalUrl();
        
        return {
            isValid: current === expected,
            current: current,
            expected: expected
        };
    }

    /**
     * Handle URL redirects and canonical updates
     */
    handleRedirects() {
        if (typeof window === 'undefined') return;

        const currentPath = window.location.pathname;
        const currentUrl = window.location.href;
        
        // Handle common redirect scenarios
        const redirectRules = [
            // Remove trailing slashes except root
            {
                condition: (path) => path !== '/' && path.endsWith('/'),
                action: (path) => path.slice(0, -1)
            },
            // Normalize document paths
            {
                condition: (path) => path.includes('/documents//'),
                action: (path) => path.replace('/documents//', '/documents/')
            },
            // Normalize comparison paths
            {
                condition: (path) => path.includes('/comparisons//'),
                action: (path) => path.replace('/comparisons//', '/comparisons/')
            }
        ];

        for (const rule of redirectRules) {
            if (rule.condition(currentPath)) {
                const newPath = rule.action(currentPath);
                const newUrl = this.baseUrl + newPath;
                
                if (newUrl !== currentUrl) {
                    window.history.replaceState(null, '', newUrl);
                    this.setCanonicalLink(newUrl);
                    break;
                }
            }
        }
    }

    /**
     * Initialize canonical URL management
     */
    init() {
        this.handleRedirects();
        this.setCanonicalLink();
    }

    /**
     * Update canonical URL (useful for SPA navigation)
     */
    updateCanonical(newPath) {
        const canonicalUrl = this.generateCanonicalUrl(newPath);
        this.setCanonicalLink(canonicalUrl);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanonicalURLManager;
} else {
    window.CanonicalURLManager = CanonicalURLManager;
}