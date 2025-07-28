/**
 * Bot Detection Module
 * Analyzes user agents and crawl patterns to differentiate between bots and humans
 * Requirements: 8.1, 8.2
 */

class BotDetector {
    constructor() {
        this.botPatterns = [
            // Search engine bots
            /googlebot/i,
            /bingbot/i,
            /slurp/i, // Yahoo
            /duckduckbot/i,
            /baiduspider/i,
            /yandexbot/i,
            /facebookexternalhit/i,
            /twitterbot/i,
            /linkedinbot/i,
            
            // AI/LLM bots
            /chatgpt/i,
            /gpt/i,
            /claude/i,
            /anthropic/i,
            /openai/i,
            /perplexity/i,
            /you\.com/i,
            
            // Generic bot patterns
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /crawling/i,
            /indexer/i,
            /fetcher/i,
            /monitor/i,
            /checker/i,
            /validator/i,
            
            // Specific tools
            /curl/i,
            /wget/i,
            /python-requests/i,
            /node-fetch/i,
            /axios/i,
            /postman/i,
            /insomnia/i
        ];
        
        this.humanIndicators = [
            /mozilla/i,
            /webkit/i,
            /chrome/i,
            /firefox/i,
            /safari/i,
            /edge/i,
            /opera/i
        ];
        
        this.visitHistory = [];
        this.crawlPatterns = new Map();
        this.sessionData = {
            startTime: Date.now(),
            pageViews: 0,
            interactions: 0,
            scrollDepth: 0,
            timeOnPage: 0
        };
        
        this.init();
    }
    
    /**
     * Initialize bot detection
     */
    init() {
        this.detectVisitorType();
        this.trackBehavior();
        this.monitorCrawlPatterns();
        
        // Store detection result globally
        window.botDetection = {
            isBot: this.isBot,
            botType: this.botType,
            confidence: this.confidence,
            userAgent: navigator.userAgent
        };
    }
    
    /**
     * Analyze user agent and detect if visitor is a bot
     */
    detectVisitorType() {
        const userAgent = navigator.userAgent;
        const lowerUA = userAgent.toLowerCase();
        
        // Check for bot patterns
        let botScore = 0;
        let detectedBotType = 'unknown';
        
        for (const pattern of this.botPatterns) {
            if (pattern.test(lowerUA)) {
                botScore += 1;
                
                // Identify specific bot type
                if (/googlebot/i.test(lowerUA)) detectedBotType = 'googlebot';
                else if (/bingbot/i.test(lowerUA)) detectedBotType = 'bingbot';
                else if (/chatgpt|gpt|openai/i.test(lowerUA)) detectedBotType = 'llm-bot';
                else if (/claude|anthropic/i.test(lowerUA)) detectedBotType = 'claude';
                else if (/crawler|spider/i.test(lowerUA)) detectedBotType = 'crawler';
                else if (/curl|wget/i.test(lowerUA)) detectedBotType = 'tool';
                else detectedBotType = 'generic-bot';
            }
        }
        
        // Check for human indicators
        let humanScore = 0;
        for (const pattern of this.humanIndicators) {
            if (pattern.test(lowerUA)) {
                humanScore += 1;
            }
        }
        
        // Additional bot detection heuristics
        const additionalBotIndicators = [
            !window.screen || window.screen.width === 0,
            !window.navigator.plugins || window.navigator.plugins.length === 0,
            typeof window.chrome === 'undefined' && /chrome/i.test(lowerUA),
            !window.navigator.webdriver === undefined,
            userAgent.length < 50 || userAgent.length > 500
        ];
        
        const additionalBotScore = additionalBotIndicators.filter(Boolean).length;
        
        // Calculate confidence and final determination
        const totalBotScore = botScore + (additionalBotScore * 0.5);
        this.confidence = Math.min((totalBotScore / (totalBotScore + humanScore)) * 100, 100);
        this.isBot = totalBotScore > humanScore || this.confidence > 60;
        this.botType = this.isBot ? detectedBotType : 'human';
        
        // Set visitor type attribute
        document.body.setAttribute('data-visitor-type', this.isBot ? 'bot' : 'human');
        document.body.setAttribute('data-bot-type', this.botType);
        document.body.setAttribute('data-bot-confidence', Math.round(this.confidence));
    }
    
    /**
     * Track visitor behavior patterns
     */
    trackBehavior() {
        if (this.isBot) {
            this.trackBotBehavior();
        } else {
            this.trackHumanBehavior();
        }
    }
    
    /**
     * Track bot-specific behavior patterns
     */
    trackBotBehavior() {
        // Track page access time
        this.sessionData.accessTime = new Date().toISOString();
        
        // Monitor for rapid page requests (bot pattern)
        const pageLoadTime = performance.now();
        this.visitHistory.push({
            url: window.location.href,
            timestamp: Date.now(),
            loadTime: pageLoadTime,
            userAgent: navigator.userAgent
        });
        
        // Keep only recent history (last 10 visits)
        if (this.visitHistory.length > 10) {
            this.visitHistory = this.visitHistory.slice(-10);
        }
        
        // Log bot visit for analytics
        this.logBotVisit();
    }
    
    /**
     * Track human-specific behavior patterns
     */
    trackHumanBehavior() {
        // Track mouse movements
        let mouseMovements = 0;
        document.addEventListener('mousemove', () => {
            mouseMovements++;
            this.sessionData.interactions++;
        });
        
        // Track scroll behavior
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
            this.sessionData.scrollDepth = maxScroll;
        });
        
        // Track clicks and interactions
        document.addEventListener('click', () => {
            this.sessionData.interactions++;
        });
        
        // Track time on page
        window.addEventListener('beforeunload', () => {
            this.sessionData.timeOnPage = Date.now() - this.sessionData.startTime;
        });
    }
    
    /**
     * Monitor crawl patterns to detect systematic crawling
     */
    monitorCrawlPatterns() {
        const currentDomain = window.location.hostname;
        const currentPath = window.location.pathname;
        const timestamp = Date.now();
        
        // Get or create crawl pattern data for this session
        const sessionKey = this.getSessionKey();
        if (!this.crawlPatterns.has(sessionKey)) {
            this.crawlPatterns.set(sessionKey, {
                pages: [],
                startTime: timestamp,
                userAgent: navigator.userAgent,
                domain: currentDomain
            });
        }
        
        const crawlData = this.crawlPatterns.get(sessionKey);
        crawlData.pages.push({
            path: currentPath,
            timestamp: timestamp,
            referrer: document.referrer
        });
        
        // Analyze crawl pattern
        this.analyzeCrawlPattern(crawlData);
    }
    
    /**
     * Analyze crawl patterns for bot detection
     */
    analyzeCrawlPattern(crawlData) {
        const pages = crawlData.pages;
        if (pages.length < 2) return;
        
        // Calculate average time between page visits
        const timeDiffs = [];
        for (let i = 1; i < pages.length; i++) {
            timeDiffs.push(pages[i].timestamp - pages[i-1].timestamp);
        }
        
        const avgTimeBetweenPages = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        
        // Bot indicators in crawl pattern
        const botPatternIndicators = {
            rapidCrawling: avgTimeBetweenPages < 2000, // Less than 2 seconds between pages
            systematicCrawling: this.isSystematicCrawling(pages),
            noReferrerPattern: pages.filter(p => !p.referrer).length > pages.length * 0.8,
            sequentialAccess: this.isSequentialAccess(pages)
        };
        
        // Update bot confidence based on crawl patterns
        const patternBotScore = Object.values(botPatternIndicators).filter(Boolean).length;
        if (patternBotScore >= 2) {
            this.confidence = Math.min(this.confidence + 20, 100);
            this.isBot = true;
            this.botType = this.botType === 'human' ? 'crawler' : this.botType;
        }
    }
    
    /**
     * Check if crawling pattern is systematic
     */
    isSystematicCrawling(pages) {
        // Look for patterns like /page1, /page2, /page3 or alphabetical ordering
        const paths = pages.map(p => p.path).slice(-5); // Last 5 pages
        if (paths.length < 3) return false;
        
        // Check for sequential numeric patterns
        const numericPattern = paths.every((path, i) => {
            if (i === 0) return true;
            const prevNum = this.extractNumber(paths[i-1]);
            const currNum = this.extractNumber(path);
            return prevNum !== null && currNum !== null && currNum === prevNum + 1;
        });
        
        return numericPattern;
    }
    
    /**
     * Check if access pattern is sequential
     */
    isSequentialAccess(pages) {
        if (pages.length < 3) return false;
        
        // Check if pages are accessed in a predictable order
        const recentPages = pages.slice(-3);
        const timeDiffs = [];
        
        for (let i = 1; i < recentPages.length; i++) {
            timeDiffs.push(recentPages[i].timestamp - recentPages[i-1].timestamp);
        }
        
        // Check if time differences are very consistent (bot-like)
        const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        const variance = timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / timeDiffs.length;
        
        return variance < 1000000; // Low variance indicates consistent timing
    }
    
    /**
     * Extract number from path for pattern detection
     */
    extractNumber(path) {
        const match = path.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }
    
    /**
     * Generate session key for crawl pattern tracking
     */
    getSessionKey() {
        // Use IP simulation (in real implementation, this would be server-side)
        const userAgent = navigator.userAgent;
        const timestamp = Math.floor(Date.now() / (1000 * 60 * 30)); // 30-minute windows
        return btoa(userAgent + timestamp).substring(0, 16);
    }
    
    /**
     * Log bot visit for analytics
     */
    logBotVisit() {
        const visitData = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            botType: this.botType,
            confidence: this.confidence,
            referrer: document.referrer,
            sessionData: this.sessionData
        };
        
        // Store in localStorage for analytics (in production, send to server)
        const botVisits = JSON.parse(localStorage.getItem('botVisits') || '[]');
        botVisits.push(visitData);
        
        // Keep only last 100 visits
        if (botVisits.length > 100) {
            botVisits.splice(0, botVisits.length - 100);
        }
        
        localStorage.setItem('botVisits', JSON.stringify(botVisits));
        
        // Dispatch custom event for other modules
        window.dispatchEvent(new CustomEvent('botDetected', {
            detail: visitData
        }));
    }
    
    /**
     * Get detection results
     */
    getDetectionResults() {
        return {
            isBot: this.isBot,
            botType: this.botType,
            confidence: this.confidence,
            userAgent: navigator.userAgent,
            sessionData: this.sessionData,
            visitHistory: this.visitHistory
        };
    }
    
    /**
     * Get bot visit statistics
     */
    getBotStatistics() {
        const botVisits = JSON.parse(localStorage.getItem('botVisits') || '[]');
        
        const stats = {
            totalVisits: botVisits.length,
            uniqueBots: new Set(botVisits.map(v => v.botType)).size,
            botTypes: {},
            recentVisits: botVisits.slice(-10),
            topPages: {}
        };
        
        // Count bot types
        botVisits.forEach(visit => {
            stats.botTypes[visit.botType] = (stats.botTypes[visit.botType] || 0) + 1;
            
            const url = new URL(visit.url);
            const path = url.pathname;
            stats.topPages[path] = (stats.topPages[path] || 0) + 1;
        });
        
        return stats;
    }
}

// Initialize bot detector when script loads
if (typeof window !== 'undefined') {
    window.BotDetector = BotDetector;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BotDetector;
}