/**
 * Main JavaScript file for LLM Tools & AI Resources Hub
 * Initializes SEO optimization and site functionality
 */

// Initialize SEO systems when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize SEO Meta Generator
    if (typeof SEOMetaGenerator !== 'undefined') {
        const metaGenerator = new SEOMetaGenerator();
        metaGenerator.init();
        
        // Make it globally available for dynamic updates
        window.seoMeta = metaGenerator;
    }

    // Initialize Canonical URL Manager
    if (typeof CanonicalURLManager !== 'undefined') {
        const canonicalManager = new CanonicalURLManager();
        canonicalManager.init();
        
        // Make it globally available
        window.canonicalManager = canonicalManager;
    }

    // Initialize Structured Data Generator
    if (typeof StructuredDataGenerator !== 'undefined') {
        const structuredDataGenerator = new StructuredDataGenerator();
        structuredDataGenerator.init();
        
        // Make it globally available
        window.structuredData = structuredDataGenerator;
    }

    // Initialize Robots and Sitemap Generator
    if (typeof RobotsSitemapGenerator !== 'undefined') {
        const robotsSitemapGenerator = new RobotsSitemapGenerator();
        robotsSitemapGenerator.init();
        
        // Make it globally available
        window.robotsSitemap = robotsSitemapGenerator;
    }

    // Initialize Bot Detection
    if (typeof BotDetector !== 'undefined') {
        const botDetector = new BotDetector();
        window.botDetector = botDetector;
    }

    // Initialize Analytics Monitor
    if (typeof AnalyticsMonitor !== 'undefined') {
        const analyticsMonitor = new AnalyticsMonitor();
        window.analyticsMonitor = analyticsMonitor;
    }

    // Initialize other site functionality
    initializeNavigation();
    initializeSearch();
    initializeAnalytics();
});

/**
 * Initialize navigation enhancements
 */
function initializeNavigation() {
    // Add active states to navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath !== '/' && href !== '/' && currentPath.startsWith(href))) {
            link.setAttribute('aria-current', 'page');
            link.classList.add('active');
        }
    });

    // Add keyboard navigation support
    navLinks.forEach(link => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Initialize search functionality placeholder
 */
function initializeSearch() {
    // This will be expanded in later tasks
    console.log('Search functionality initialized');
}

/**
 * Initialize analytics and bot detection
 */
function initializeAnalytics() {
    // Enhanced analytics with bot detection integration
    if (window.botDetector) {
        const detection = window.botDetector.getDetectionResults();
        
        // Log detection results
        console.log('Visitor detection:', {
            type: detection.isBot ? 'Bot' : 'Human',
            botType: detection.botType,
            confidence: detection.confidence + '%'
        });
        
        // Track analytics based on visitor type
        if (detection.isBot) {
            trackBotAnalytics(detection);
        } else {
            trackHumanAnalytics(detection);
        }
    }
}

/**
 * Track bot-specific analytics
 */
function trackBotAnalytics(detection) {
    // Log bot visit with detailed information
    console.log('Bot Analytics:', {
        botType: detection.botType,
        confidence: detection.confidence,
        userAgent: detection.userAgent,
        timestamp: new Date().toISOString()
    });
    
    // Could integrate with Google Analytics or other services
    if (typeof gtag !== 'undefined') {
        gtag('event', 'bot_visit', {
            bot_type: detection.botType,
            confidence: detection.confidence,
            custom_parameter: 'bot_detected'
        });
    }
}

/**
 * Track human-specific analytics
 */
function trackHumanAnalytics(detection) {
    // Standard human analytics tracking
    console.log('Human visitor detected');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'human_visit', {
            visitor_type: 'human',
            custom_parameter: 'human_detected'
        });
    }
}

/**
 * Utility function to update meta tags dynamically
 */
function updatePageMeta(config) {
    if (window.seoMeta) {
        window.seoMeta.updateMeta(config);
    }
    
    if (window.canonicalManager) {
        window.canonicalManager.updateCanonical(config.path);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updatePageMeta,
        initializeNavigation,
        initializeSearch,
        initializeAnalytics
    };
}