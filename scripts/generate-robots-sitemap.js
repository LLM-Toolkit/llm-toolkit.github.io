#!/usr/bin/env node

/**
 * Dynamic Robots.txt and Sitemap Generation Script
 * Automatically generates robots.txt and XML sitemaps based on site structure
 */

const fs = require('fs');
const path = require('path');

class DynamicRobotsSitemapGenerator {
    constructor() {
        this.loadConfig();
        this.outputDir = process.cwd();
        this.pages = [];
        this.scanSiteStructure();
    }

    /**
     * Load configuration from sitemap-config.json
     */
    loadConfig() {
        try {
            const configPath = path.join(process.cwd(), 'sitemap-config.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            this.config = JSON.parse(configData);
            
            this.baseUrl = process.env.SITE_URL || this.config.siteUrl;
            this.siteName = this.config.siteName;
        } catch (error) {
            console.warn('Could not load sitemap-config.json, using defaults');
            this.config = {
                siteUrl: 'https://llm-toolkit.github.io',
                siteName: 'LLM Tools & AI Resources Hub',
                crawlDelay: 1,
                defaultChangefreq: 'monthly',
                allowedBots: ['*'],
                disallowedPaths: ['/admin/', '/private/'],
                allowedPaths: ['/assets/'],
                pageTypes: {
                    homepage: { priority: '1.0', changefreq: 'weekly' },
                    document: { priority: '0.8', changefreq: 'monthly' },
                    comparison: { priority: '0.9', changefreq: 'monthly' },
                    page: { priority: '0.7', changefreq: 'monthly' }
                }
            };
            this.baseUrl = process.env.SITE_URL || this.config.siteUrl;
            this.siteName = this.config.siteName;
        }
    }

    /**
     * Scan the site structure to automatically detect pages
     */
    scanSiteStructure() {
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Add homepage
        const homeConfig = this.config.pageTypes.homepage;
        this.pages.push({
            url: '/',
            lastmod: this.getFileModificationDate('index.html') || currentDate,
            changefreq: homeConfig.changefreq,
            priority: homeConfig.priority,
            type: 'homepage'
        });

        // Scan documents directory
        const docConfig = this.config.pageTypes.document;
        this.scanDirectory('documents', 'document', docConfig.priority, docConfig.changefreq);
        
        // Scan comparisons directory
        const compConfig = this.config.pageTypes.comparison;
        this.scanDirectory('comparisons', 'comparison', compConfig.priority, compConfig.changefreq);
    }

    /**
     * Scan a specific directory for HTML files
     */
    scanDirectory(dirName, type, priority, changefreq) {
        const dirPath = path.join(this.outputDir, dirName);
        
        if (!fs.existsSync(dirPath)) {
            console.warn(`Directory ${dirName} does not exist, skipping...`);
            return;
        }

        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            if (file.endsWith('.html')) {
                const filePath = path.join(dirPath, file);
                const url = `/${dirName}/${file}`;
                const lastmod = this.getFileModificationDate(filePath) || new Date().toISOString().split('T')[0];
                
                this.pages.push({
                    url,
                    lastmod,
                    changefreq,
                    priority,
                    type
                });
            }
        });
    }

    /**
     * Get file modification date
     */
    getFileModificationDate(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.mtime.toISOString().split('T')[0];
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate robots.txt content with proper crawling guidelines
     */
    generateRobotsTxt() {
        let robotsContent = `# Robots.txt for ${this.siteName}
# Generated automatically for SEO optimization
# Last updated: ${new Date().toISOString()}

`;

        // Add allowed bots
        this.config.allowedBots.forEach(bot => {
            robotsContent += `User-agent: ${bot}
Allow: /

`;
        });

        robotsContent += `# Disallow access to admin and private areas
`;
        this.config.disallowedPaths.forEach(path => {
            robotsContent += `Disallow: ${path}
`;
        });

        robotsContent += `
# Allow access to important files
`;
        this.config.allowedPaths.forEach(path => {
            robotsContent += `Allow: ${path}
`;
        });

        robotsContent += `
# Crawl delay for respectful crawling
Crawl-delay: ${this.config.crawlDelay}

# Sitemap locations
Sitemap: ${this.baseUrl}/sitemap-index.xml
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
     * Generate sitemap index for different content types
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
     * Write file to disk
     */
    writeFile(filename, content) {
        const filePath = path.join(this.outputDir, filename);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Generated ${filename}`);
    }

    /**
     * Validate sitemap URLs and structure
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
     * Generate all files
     */
    generateAll() {
        console.log('🚀 Starting robots.txt and sitemap generation...');
        console.log(`📍 Base URL: ${this.baseUrl}`);
        console.log(`📄 Found ${this.pages.length} pages to include`);

        // Validate before generation
        const validation = this.validateSitemap();
        if (!validation.isValid) {
            console.warn('⚠️  Sitemap validation warnings:');
            validation.errors.forEach(error => console.warn(`   ${error}`));
        }

        // Generate and write all files
        this.writeFile('robots.txt', this.generateRobotsTxt());
        this.writeFile('sitemap.xml', this.generateMainSitemap());
        this.writeFile('sitemap-index.xml', this.generateSitemapIndex());
        this.writeFile('sitemap-documents.xml', this.generateDocumentsSitemap());
        this.writeFile('sitemap-comparisons.xml', this.generateComparisonsSitemap());

        console.log('✅ All files generated successfully!');
        
        // Display page summary
        const pageTypes = this.pages.reduce((acc, page) => {
            acc[page.type] = (acc[page.type] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n📊 Page summary:');
        Object.entries(pageTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} pages`);
        });
    }
}

// Run the generator if called directly
if (require.main === module) {
    const generator = new DynamicRobotsSitemapGenerator();
    generator.generateAll();
}

module.exports = DynamicRobotsSitemapGenerator;