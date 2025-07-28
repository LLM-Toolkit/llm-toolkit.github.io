/**
 * Analytics and Monitoring System
 * Collects performance metrics, monitors SEO health, and provides insights
 * Requirements: 8.3, 8.4
 */

class AnalyticsMonitor {
    constructor() {
        this.metrics = {
            performance: {},
            seo: {},
            crawling: {},
            errors: []
        };
        
        this.thresholds = {
            pageLoadTime: 3000, // 3 seconds
            firstContentfulPaint: 1800, // 1.8 seconds
            largestContentfulPaint: 2500, // 2.5 seconds
            cumulativeLayoutShift: 0.1,
            firstInputDelay: 100, // 100ms
            crawlErrorRate: 0.05 // 5%
        };
        
        this.alerts = [];
        this.contentInsights = new Map();
        
        this.init();
    }
    
    /**
     * Initialize analytics and monitoring
     */
    init() {
        this.collectPerformanceMetrics();
        this.monitorSEOHealth();
        this.trackContentInsights();
        this.setupErrorTracking();
        this.startPeriodicMonitoring();
        
        // Make globally available
        window.analyticsMonitor = this;
    }
    
    /**
     * Collect comprehensive performance metrics
     */
    collectPerformanceMetrics() {
        // Core Web Vitals
        this.measureCoreWebVitals();
        
        // Navigation timing
        this.measureNavigationTiming();
        
        // Resource timing
        this.measureResourceTiming();
        
        // Custom performance metrics
        this.measureCustomMetrics();
    }
    
    /**
     * Measure Core Web Vitals
     */
    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.performance.lcp = lastEntry.startTime;
                this.checkThreshold('lcp', lastEntry.startTime, this.thresholds.largestContentfulPaint);
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observation not supported');
            }
            
            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.performance.fid = entry.processingStart - entry.startTime;
                    this.checkThreshold('fid', entry.processingStart - entry.startTime, this.thresholds.firstInputDelay);
                });
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observation not supported');
            }
            
            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.metrics.performance.cls = clsValue;
                this.checkThreshold('cls', clsValue, this.thresholds.cumulativeLayoutShift);
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observation not supported');
            }
        }
        
        // First Contentful Paint (FCP)
        if (performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.performance.fcp = entry.startTime;
                    this.checkThreshold('fcp', entry.startTime, this.thresholds.firstContentfulPaint);
                }
            });
        }
    }
    
    /**
     * Measure navigation timing metrics
     */
    measureNavigationTiming() {
        if (performance.timing) {
            const timing = performance.timing;
            
            this.metrics.performance.navigationTiming = {
                domainLookup: timing.domainLookupEnd - timing.domainLookupStart,
                tcpConnect: timing.connectEnd - timing.connectStart,
                request: timing.responseStart - timing.requestStart,
                response: timing.responseEnd - timing.responseStart,
                domProcessing: timing.domComplete - timing.domLoading,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                pageLoad: timing.loadEventEnd - timing.navigationStart
            };
            
            // Check page load time threshold
            const pageLoadTime = this.metrics.performance.navigationTiming.pageLoad;
            this.checkThreshold('pageLoad', pageLoadTime, this.thresholds.pageLoadTime);
        }
    }
    
    /**
     * Measure resource timing
     */
    measureResourceTiming() {
        if (performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource');
            
            this.metrics.performance.resources = {
                total: resources.length,
                scripts: resources.filter(r => r.initiatorType === 'script').length,
                stylesheets: resources.filter(r => r.initiatorType === 'link').length,
                images: resources.filter(r => r.initiatorType === 'img').length,
                slowResources: resources.filter(r => r.duration > 1000).length
            };
            
            // Identify slow resources
            const slowResources = resources
                .filter(r => r.duration > 1000)
                .map(r => ({ name: r.name, duration: r.duration }));
                
            if (slowResources.length > 0) {
                this.addAlert('performance', 'Slow resources detected', { resources: slowResources });
            }
        }
    }
    
    /**
     * Measure custom performance metrics
     */
    measureCustomMetrics() {
        // Time to interactive (custom implementation)
        const timeToInteractive = this.calculateTimeToInteractive();
        if (timeToInteractive) {
            this.metrics.performance.tti = timeToInteractive;
        }
        
        // JavaScript bundle size
        this.measureJavaScriptSize();
        
        // CSS size
        this.measureCSSSize();
    }
    
    /**
     * Calculate Time to Interactive
     */
    calculateTimeToInteractive() {
        if (performance.timing) {
            // Simplified TTI calculation
            const domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            const loadComplete = performance.timing.loadEventEnd - performance.timing.navigationStart;
            
            // TTI is approximately when DOM is ready and main thread is idle
            return Math.max(domContentLoaded, loadComplete);
        }
        return null;
    }
    
    /**
     * Measure JavaScript bundle size
     */
    measureJavaScriptSize() {
        if (performance.getEntriesByType) {
            const scripts = performance.getEntriesByType('resource')
                .filter(r => r.initiatorType === 'script');
                
            const totalSize = scripts.reduce((sum, script) => {
                return sum + (script.transferSize || 0);
            }, 0);
            
            this.metrics.performance.jsSize = totalSize;
            
            // Alert if JS bundle is too large
            if (totalSize > 500000) { // 500KB
                this.addAlert('performance', 'Large JavaScript bundle detected', { size: totalSize });
            }
        }
    }
    
    /**
     * Measure CSS size
     */
    measureCSSSize() {
        if (performance.getEntriesByType) {
            const stylesheets = performance.getEntriesByType('resource')
                .filter(r => r.initiatorType === 'link' && r.name.includes('.css'));
                
            const totalSize = stylesheets.reduce((sum, css) => {
                return sum + (css.transferSize || 0);
            }, 0);
            
            this.metrics.performance.cssSize = totalSize;
        }
    }
    
    /**
     * Monitor SEO health indicators
     */
    monitorSEOHealth() {
        this.checkMetaTags();
        this.checkStructuredData();
        this.checkHeadingStructure();
        this.checkInternalLinks();
        this.checkImageOptimization();
        this.checkCanonicalURL();
    }
    
    /**
     * Check meta tags for SEO health
     */
    checkMetaTags() {
        const seoChecks = {
            title: document.querySelector('title'),
            description: document.querySelector('meta[name="description"]'),
            keywords: document.querySelector('meta[name="keywords"]'),
            ogTitle: document.querySelector('meta[property="og:title"]'),
            ogDescription: document.querySelector('meta[property="og:description"]'),
            ogImage: document.querySelector('meta[property="og:image"]'),
            twitterCard: document.querySelector('meta[name="twitter:card"]')
        };
        
        this.metrics.seo.metaTags = {};
        
        Object.keys(seoChecks).forEach(key => {
            const element = seoChecks[key];
            if (element) {
                const content = element.content || element.textContent;
                this.metrics.seo.metaTags[key] = {
                    present: true,
                    content: content,
                    length: content.length
                };
                
                // Check length constraints
                if (key === 'title' && (content.length < 30 || content.length > 60)) {
                    this.addAlert('seo', 'Title length not optimal', { length: content.length });
                }
                if (key === 'description' && (content.length < 120 || content.length > 160)) {
                    this.addAlert('seo', 'Meta description length not optimal', { length: content.length });
                }
            } else {
                this.metrics.seo.metaTags[key] = { present: false };
                this.addAlert('seo', `Missing ${key} meta tag`);
            }
        });
    }
    
    /**
     * Check structured data
     */
    checkStructuredData() {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        this.metrics.seo.structuredData = {
            count: jsonLdScripts.length,
            schemas: []
        };
        
        jsonLdScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                this.metrics.seo.structuredData.schemas.push({
                    type: data['@type'] || 'Unknown',
                    context: data['@context'] || 'Unknown'
                });
            } catch (e) {
                this.addAlert('seo', 'Invalid JSON-LD structured data', { error: e.message });
            }
        });
        
        if (jsonLdScripts.length === 0) {
            this.addAlert('seo', 'No structured data found');
        }
    }
    
    /**
     * Check heading structure
     */
    checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingStructure = Array.from(headings).map(h => ({
            level: parseInt(h.tagName.charAt(1)),
            text: h.textContent.trim(),
            id: h.id
        }));
        
        this.metrics.seo.headings = {
            total: headings.length,
            h1Count: document.querySelectorAll('h1').length,
            structure: headingStructure
        };
        
        // Check for multiple H1s
        if (this.metrics.seo.headings.h1Count > 1) {
            this.addAlert('seo', 'Multiple H1 tags found', { count: this.metrics.seo.headings.h1Count });
        }
        
        // Check for missing H1
        if (this.metrics.seo.headings.h1Count === 0) {
            this.addAlert('seo', 'No H1 tag found');
        }
    }
    
    /**
     * Check internal links
     */
    checkInternalLinks() {
        const links = document.querySelectorAll('a[href]');
        const internalLinks = Array.from(links).filter(link => {
            const href = link.getAttribute('href');
            return href && (href.startsWith('/') || href.startsWith('./') || href.startsWith('../') || 
                           href.includes(window.location.hostname));
        });
        
        this.metrics.seo.internalLinks = {
            total: links.length,
            internal: internalLinks.length,
            external: links.length - internalLinks.length,
            withoutText: internalLinks.filter(link => !link.textContent.trim()).length
        };
        
        // Check for links without descriptive text
        if (this.metrics.seo.internalLinks.withoutText > 0) {
            this.addAlert('seo', 'Links without descriptive text found', 
                         { count: this.metrics.seo.internalLinks.withoutText });
        }
    }
    
    /**
     * Check image optimization
     */
    checkImageOptimization() {
        const images = document.querySelectorAll('img');
        const imageIssues = [];
        
        images.forEach(img => {
            if (!img.alt) {
                imageIssues.push({ src: img.src, issue: 'missing alt text' });
            }
            if (!img.loading && img.getBoundingClientRect().top > window.innerHeight) {
                imageIssues.push({ src: img.src, issue: 'missing lazy loading' });
            }
        });
        
        this.metrics.seo.images = {
            total: images.length,
            withAlt: images.length - imageIssues.filter(i => i.issue === 'missing alt text').length,
            issues: imageIssues
        };
        
        if (imageIssues.length > 0) {
            this.addAlert('seo', 'Image optimization issues found', { issues: imageIssues });
        }
    }
    
    /**
     * Check canonical URL
     */
    checkCanonicalURL() {
        const canonical = document.querySelector('link[rel="canonical"]');
        
        this.metrics.seo.canonical = {
            present: !!canonical,
            url: canonical ? canonical.href : null,
            matchesCurrentURL: canonical ? canonical.href === window.location.href : false
        };
        
        if (!canonical) {
            this.addAlert('seo', 'Missing canonical URL');
        }
    }
    
    /**
     * Track content insights and crawling patterns
     */
    trackContentInsights() {
        const currentPage = window.location.pathname;
        const timestamp = Date.now();
        
        // Get or create page insights
        if (!this.contentInsights.has(currentPage)) {
            this.contentInsights.set(currentPage, {
                path: currentPage,
                visits: 0,
                botVisits: 0,
                humanVisits: 0,
                firstVisit: timestamp,
                lastVisit: timestamp,
                avgTimeOnPage: 0,
                bounceRate: 0,
                referrers: new Map()
            });
        }
        
        const pageInsights = this.contentInsights.get(currentPage);
        pageInsights.visits++;
        pageInsights.lastVisit = timestamp;
        
        // Track visitor type
        if (window.botDetection && window.botDetection.isBot) {
            pageInsights.botVisits++;
        } else {
            pageInsights.humanVisits++;
        }
        
        // Track referrer
        if (document.referrer) {
            const referrerDomain = new URL(document.referrer).hostname;
            const referrerCount = pageInsights.referrers.get(referrerDomain) || 0;
            pageInsights.referrers.set(referrerDomain, referrerCount + 1);
        }
        
        // Store insights
        this.storeContentInsights();
    }
    
    /**
     * Store content insights in localStorage
     */
    storeContentInsights() {
        const insightsData = {};
        this.contentInsights.forEach((value, key) => {
            insightsData[key] = {
                ...value,
                referrers: Object.fromEntries(value.referrers)
            };
        });
        
        localStorage.setItem('contentInsights', JSON.stringify(insightsData));
    }
    
    /**
     * Load content insights from localStorage
     */
    loadContentInsights() {
        const stored = localStorage.getItem('contentInsights');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                Object.keys(data).forEach(key => {
                    const insight = data[key];
                    insight.referrers = new Map(Object.entries(insight.referrers));
                    this.contentInsights.set(key, insight);
                });
            } catch (e) {
                console.warn('Failed to load content insights:', e);
            }
        }
    }
    
    /**
     * Setup error tracking
     */
    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.trackError('javascript', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('promise', {
                reason: event.reason,
                stack: event.reason && event.reason.stack ? event.reason.stack : null
            });
        });
        
        // Resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.trackError('resource', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);
    }
    
    /**
     * Track errors
     */
    trackError(type, details) {
        const error = {
            type,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.metrics.errors.push(error);
        
        // Keep only last 50 errors
        if (this.metrics.errors.length > 50) {
            this.metrics.errors = this.metrics.errors.slice(-50);
        }
        
        // Add alert for critical errors
        if (type === 'javascript' || type === 'resource') {
            this.addAlert('error', `${type} error detected`, details);
        }
        
        // Store errors
        localStorage.setItem('analyticsErrors', JSON.stringify(this.metrics.errors));
    }
    
    /**
     * Check threshold and add alert if exceeded
     */
    checkThreshold(metric, value, threshold) {
        if (value > threshold) {
            this.addAlert('performance', `${metric} threshold exceeded`, {
                value,
                threshold,
                metric
            });
        }
    }
    
    /**
     * Add alert to the system
     */
    addAlert(category, message, details = {}) {
        const alert = {
            id: Date.now() + Math.random(),
            category,
            message,
            details,
            timestamp: new Date().toISOString(),
            severity: this.calculateSeverity(category, message),
            acknowledged: false
        };
        
        this.alerts.push(alert);
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
        
        // Store alerts
        localStorage.setItem('analyticsAlerts', JSON.stringify(this.alerts));
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('analyticsAlert', { detail: alert }));
        
        // Log critical alerts
        if (alert.severity === 'critical') {
            console.error('Critical Analytics Alert:', alert);
        }
    }
    
    /**
     * Calculate alert severity
     */
    calculateSeverity(category, message) {
        if (category === 'error') return 'critical';
        if (message.includes('missing') || message.includes('not found')) return 'high';
        if (message.includes('threshold exceeded')) return 'medium';
        return 'low';
    }
    
    /**
     * Start periodic monitoring
     */
    startPeriodicMonitoring() {
        // Monitor every 30 seconds
        setInterval(() => {
            this.collectPerformanceMetrics();
            this.monitorSEOHealth();
        }, 30000);
        
        // Generate insights every 5 minutes
        setInterval(() => {
            this.generateInsights();
        }, 300000);
    }
    
    /**
     * Generate insights and recommendations
     */
    generateInsights() {
        const insights = {
            performance: this.generatePerformanceInsights(),
            seo: this.generateSEOInsights(),
            content: this.generateContentInsights(),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('analyticsInsights', JSON.stringify(insights));
        
        // Dispatch insights event
        window.dispatchEvent(new CustomEvent('analyticsInsights', { detail: insights }));
        
        return insights;
    }
    
    /**
     * Generate performance insights
     */
    generatePerformanceInsights() {
        const perf = this.metrics.performance;
        const insights = [];
        
        if (perf.lcp > this.thresholds.largestContentfulPaint) {
            insights.push({
                type: 'performance',
                message: 'Largest Contentful Paint is slow',
                recommendation: 'Optimize images and reduce server response time',
                priority: 'high'
            });
        }
        
        if (perf.cls > this.thresholds.cumulativeLayoutShift) {
            insights.push({
                type: 'performance',
                message: 'Layout shifts detected',
                recommendation: 'Add size attributes to images and reserve space for dynamic content',
                priority: 'medium'
            });
        }
        
        if (perf.jsSize > 500000) {
            insights.push({
                type: 'performance',
                message: 'JavaScript bundle is large',
                recommendation: 'Consider code splitting and lazy loading',
                priority: 'medium'
            });
        }
        
        return insights;
    }
    
    /**
     * Generate SEO insights
     */
    generateSEOInsights() {
        const seo = this.metrics.seo;
        const insights = [];
        
        if (seo.headings && seo.headings.h1Count !== 1) {
            insights.push({
                type: 'seo',
                message: 'H1 tag issues detected',
                recommendation: 'Use exactly one H1 tag per page',
                priority: 'high'
            });
        }
        
        if (seo.images && seo.images.issues.length > 0) {
            insights.push({
                type: 'seo',
                message: 'Image optimization issues',
                recommendation: 'Add alt text and implement lazy loading',
                priority: 'medium'
            });
        }
        
        if (!seo.canonical || !seo.canonical.present) {
            insights.push({
                type: 'seo',
                message: 'Missing canonical URL',
                recommendation: 'Add canonical link tag to prevent duplicate content issues',
                priority: 'high'
            });
        }
        
        return insights;
    }
    
    /**
     * Generate content insights
     */
    generateContentInsights() {
        const insights = [];
        const sortedPages = Array.from(this.contentInsights.values())
            .sort((a, b) => b.visits - a.visits);
        
        const topPages = sortedPages.slice(0, 5);
        const mostCrawledByBots = sortedPages
            .filter(page => page.botVisits > 0)
            .sort((a, b) => b.botVisits - a.botVisits)
            .slice(0, 3);
        
        insights.push({
            type: 'content',
            message: 'Top performing pages identified',
            data: topPages.map(p => ({ path: p.path, visits: p.visits })),
            priority: 'info'
        });
        
        if (mostCrawledByBots.length > 0) {
            insights.push({
                type: 'content',
                message: 'Most crawled pages by bots',
                data: mostCrawledByBots.map(p => ({ 
                    path: p.path, 
                    botVisits: p.botVisits,
                    botRatio: (p.botVisits / p.visits * 100).toFixed(1) + '%'
                })),
                priority: 'info'
            });
        }
        
        return insights;
    }
    
    /**
     * Get analytics dashboard data
     */
    getDashboardData() {
        return {
            metrics: this.metrics,
            alerts: this.alerts.filter(a => !a.acknowledged),
            insights: this.generateInsights(),
            contentInsights: Object.fromEntries(this.contentInsights),
            summary: {
                totalAlerts: this.alerts.length,
                criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
                performanceScore: this.calculatePerformanceScore(),
                seoScore: this.calculateSEOScore()
            }
        };
    }
    
    /**
     * Calculate performance score (0-100)
     */
    calculatePerformanceScore() {
        const perf = this.metrics.performance;
        let score = 100;
        
        if (perf.lcp > this.thresholds.largestContentfulPaint) score -= 20;
        if (perf.fcp > this.thresholds.firstContentfulPaint) score -= 15;
        if (perf.cls > this.thresholds.cumulativeLayoutShift) score -= 15;
        if (perf.fid > this.thresholds.firstInputDelay) score -= 10;
        if (perf.navigationTiming && perf.navigationTiming.pageLoad > this.thresholds.pageLoadTime) score -= 20;
        if (perf.jsSize > 500000) score -= 10;
        if (perf.resources && perf.resources.slowResources > 0) score -= 10;
        
        return Math.max(0, score);
    }
    
    /**
     * Calculate SEO score (0-100)
     */
    calculateSEOScore() {
        const seo = this.metrics.seo;
        let score = 100;
        
        if (!seo.metaTags || !seo.metaTags.title || !seo.metaTags.title.present) score -= 20;
        if (!seo.metaTags || !seo.metaTags.description || !seo.metaTags.description.present) score -= 15;
        if (!seo.structuredData || seo.structuredData.count === 0) score -= 15;
        if (!seo.headings || seo.headings.h1Count !== 1) score -= 15;
        if (!seo.canonical || !seo.canonical.present) score -= 10;
        if (seo.images && seo.images.issues.length > 0) score -= 10;
        if (seo.internalLinks && seo.internalLinks.withoutText > 0) score -= 5;
        
        return Math.max(0, score);
    }
    
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            localStorage.setItem('analyticsAlerts', JSON.stringify(this.alerts));
        }
    }
    
    /**
     * Clear old data
     */
    clearOldData(daysToKeep = 7) {
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        
        // Clear old alerts
        this.alerts = this.alerts.filter(alert => 
            new Date(alert.timestamp).getTime() > cutoffTime
        );
        
        // Clear old errors
        this.metrics.errors = this.metrics.errors.filter(error => 
            new Date(error.timestamp).getTime() > cutoffTime
        );
        
        // Update storage
        localStorage.setItem('analyticsAlerts', JSON.stringify(this.alerts));
        localStorage.setItem('analyticsErrors', JSON.stringify(this.metrics.errors));
    }
}

// Initialize analytics monitor when script loads
if (typeof window !== 'undefined') {
    window.AnalyticsMonitor = AnalyticsMonitor;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsMonitor;
}