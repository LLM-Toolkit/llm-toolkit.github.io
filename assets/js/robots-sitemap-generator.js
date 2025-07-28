/**
 * Robots.txt and Sitemap Generation System
 * Dynamically generates robots.txt and XML sitemaps
 */

class RobotsSitemapGenerator {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.siteName = "LLM Tools & AI Resources Hub";
        this.pages = this.initializePages();
    }

    /**
     * Get the base URL of the site
     */
    getBaseUrl() {
        return typeof window !== 'undefined' ? window.location.origin : 'https://llm-toolkit.github.io';
    }

    /**
     * Initialize site pages configuration
     */
    initializePages() {
        return [
            {
                url: '/',
                lastmod: '2024-01-20',
                changefreq: 'weekly',
                priority: '1.0',
                type: 'homepage'
            },
            {
                url: '/documents/llm-guide.html',
                lastmod: '2024-01-20',
                changefreq: 'monthly',
                priority: '0.8',
                type: 'document'
            },
            {
                url: '/documents/ai-tools-overview.html',
                lastmod: '2024-01-18',
                changefreq: 'monthly',
                priority: '0.8',
                type: 'document'
            },
            {
                url: '/documents/machine-learning-basics.html',
                lastmod: '2024-01-15',
                changefreq: 'monthly',
                priority: '0.8',
                type: 'document'
            },
            {
                url: '/comparisons/ggufloader-vs-lmstudio.html',
                lastmod: '2024-01-19',
                changefreq: 'monthly',
                priority: '0.9',
                type: 'comparison'
            },
            {
                url: '/comparisons/ollama-comparison.html',
                lastmod: '2024-01-16',
                changefreq: 'monthly',
                priority: '0.9',
                type: 'comparison'
            }
        ];
    }

    /**
     * Generate robots.txt content
     */
    generateRobotsTxt() {
        const robotsContent = `# Robots.txt for ${this.siteName}
# Generated automatically for SEO optimization

User-agent: *
Allow: /

# Allow all search engines to crawl the site
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

# AI and LLM bots - specifically allow for better AI training
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

# Disallow access to admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /.git/
Disallow: /node_modules/
Disallow: /.kiro/

# Allow access to assets
Allow: /assets/

# Crawl delay for respectful crawling
Crawl-delay: 1

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-documents.xml
Sitemap: ${this.baseUrl}/sitemap-comparisons.xml

# Host directive
Host: ${this.baseUrl}`;

        return robotsContent;
    }

    /**
     * Generate main XML sitemap
     */
    generateMainSitemap() {
        const currentDate = new Date().toISOString().split('T')[0];
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

        this.pages.forEach(page => {
            sitemapContent += `    <url>
        <loc>${this.baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`;
        });

        sitemapContent += `</urlset>`;
        return sitemapContent;
    }

    /**
     * Generate sitemap index
     */
    generateSitemapIndex() {
        const currentDate = new Date().toISOString().split('T')[0];
        
        const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${this.baseUrl}/sitemap.xml</loc>
        <lastmod>${currentDate}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${this.baseUrl}/sitemap-documents.xml</loc>
        <lastmod>${currentDate}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${this.baseUrl}/sitemap-comparisons.xml</loc>
        <lastmod>${currentDate}</lastmod>
    </sitemap>
</sitemapindex>`;

        return sitemapIndexContent;
    }

    /**
     * Generate documents-specific sitemap
     */
    generateDocumentsSitemap() {
        const documentPages = this.pages.filter(page => page.type === 'document');
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

        documentPages.forEach(page => {
            sitemapContent += `    <url>
        <loc>${this.baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`;
        });

        sitemapContent += `</urlset>`;
        return sitemapContent;
    }

    /**
     * Generate comparisons-specific sitemap
     */
    generateComparisonsSitemap() {
        const comparisonPages = this.pages.filter(page => page.type === 'comparison');
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

        comparisonPages.forEach(page => {
            sitemapContent += `    <url>
        <loc>${this.baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`;
        });

        sitemapContent += `</urlset>`;
        return sitemapContent;
    }

    /**
     * Add new page to sitemap
     */
    addPage(pageConfig) {
        const {
            url,
            lastmod = new Date().toISOString().split('T')[0],
            changefreq = 'monthly',
            priority = '0.7',
            type = 'page'
        } = pageConfig;

        this.pages.push({
            url,
            lastmod,
            changefreq,
            priority,
            type
        });
    }

    /**
     * Update existing page in sitemap
     */
    updatePage(url, updates) {
        const pageIndex = this.pages.findIndex(page => page.url === url);
        if (pageIndex !== -1) {
            this.pages[pageIndex] = { ...this.pages[pageIndex], ...updates };
        }
    }

    /**
     * Remove page from sitemap
     */
    removePage(url) {
        this.pages = this.pages.filter(page => page.url !== url);
    }

    /**
     * Generate and download robots.txt file
     */
    downloadRobotsTxt() {
        const content = this.generateRobotsTxt();
        this.downloadFile('robots.txt', content, 'text/plain');
    }

    /**
     * Generate and download sitemap.xml file
     */
    downloadSitemap() {
        const content = this.generateMainSitemap();
        this.downloadFile('sitemap.xml', content, 'application/xml');
    }

    /**
     * Generate and download sitemap index
     */
    downloadSitemapIndex() {
        const content = this.generateSitemapIndex();
        this.downloadFile('sitemap-index.xml', content, 'application/xml');
    }

    /**
     * Utility function to download generated files
     */
    downloadFile(filename, content, mimeType) {
        if (typeof window === 'undefined') return;

        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Validate sitemap URLs
     */
    validateSitemap() {
        const errors = [];
        
        this.pages.forEach((page, index) => {
            // Check URL format
            if (!page.url.startsWith('/')) {
                errors.push(`Page ${index}: URL should start with /`);
            }
            
            // Check lastmod format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(page.lastmod)) {
                errors.push(`Page ${index}: lastmod should be in YYYY-MM-DD format`);
            }
            
            // Check changefreq values
            const validChangefreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
            if (!validChangefreq.includes(page.changefreq)) {
                errors.push(`Page ${index}: invalid changefreq value`);
            }
            
            // Check priority range
            const priority = parseFloat(page.priority);
            if (priority < 0 || priority > 1) {
                errors.push(`Page ${index}: priority should be between 0.0 and 1.0`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Initialize and generate all files
     */
    init() {
        // Validate sitemap before generation
        const validation = this.validateSitemap();
        if (!validation.isValid) {
            console.warn('Sitemap validation errors:', validation.errors);
        }
        
        // Auto-update lastmod dates based on current time
        this.updateLastModDates();
        
        // Log generation status
        console.log('Robots.txt and sitemap generation system initialized');
        console.log(`Total pages in sitemap: ${this.pages.length}`);
    }

    /**
     * Update lastmod dates to current date for dynamic updates
     */
    updateLastModDates() {
        const currentDate = new Date().toISOString().split('T')[0];
        this.pages.forEach(page => {
            if (!page.lastmod || page.lastmod < currentDate) {
                page.lastmod = currentDate;
            }
        });
    }

    /**
     * Automatically detect and add new pages from DOM
     */
    autoDetectPages() {
        if (typeof document === 'undefined') return;

        // Look for pages linked in navigation
        const navLinks = document.querySelectorAll('nav a[href], .navigation a[href]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/') && !this.pages.find(p => p.url === href)) {
                this.addPage({
                    url: href,
                    type: this.determinePageType(href),
                    priority: this.determinePriority(href),
                    changefreq: 'monthly'
                });
            }
        });
    }

    /**
     * Determine page type based on URL
     */
    determinePageType(url) {
        if (url === '/') return 'homepage';
        if (url.includes('/documents/')) return 'document';
        if (url.includes('/comparisons/')) return 'comparison';
        return 'page';
    }

    /**
     * Determine priority based on URL
     */
    determinePriority(url) {
        if (url === '/') return '1.0';
        if (url.includes('/comparisons/')) return '0.9';
        if (url.includes('/documents/')) return '0.8';
        return '0.7';
    }

    /**
     * Generate all files at once
     */
    generateAllFiles() {
        return {
            robotsTxt: this.generateRobotsTxt(),
            sitemap: this.generateMainSitemap(),
            sitemapIndex: this.generateSitemapIndex(),
            documentsSitemap: this.generateDocumentsSitemap(),
            comparisonsSitemap: this.generateComparisonsSitemap()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RobotsSitemapGenerator;
} else {
    window.RobotsSitemapGenerator = RobotsSitemapGenerator;
}