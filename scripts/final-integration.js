#!/usr/bin/env node

/**
 * Final Integration and Deployment Preparation Script
 * Integrates all components and validates SEO requirements
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class FinalIntegrator {
    constructor() {
        this.baseUrl = 'https://llm-toolkit.github.io'; // GitHub Pages domain
        this.issues = [];
        this.fixes = [];
    }

    async integrate() {
        console.log('🚀 Starting final integration and deployment preparation...\n');
        
        // 1. Integrate all components and test end-to-end functionality
        await this.integrateComponents();
        
        // 2. Validate all SEO requirements and bot accessibility
        await this.validateSEORequirements();
        
        // 3. Prepare deployment configuration for static hosting
        await this.prepareDeploymentConfig();
        
        // Generate final report
        this.generateFinalReport();
    }

    async integrateComponents() {
        console.log('🔧 Integrating all components...');
        
        // Fix missing meta descriptions and viewport tags
        await this.fixMetaTags();
        
        // Add canonical URLs
        await this.addCanonicalUrls();
        
        // Fix structured data issues
        await this.fixStructuredData();
        
        // Add Open Graph tags
        await this.addOpenGraphTags();
        
        // Fix image alt text issues
        await this.fixImageAltText();
        
        console.log('✅ Component integration completed\n');
    }

    async fixMetaTags() {
        const htmlFiles = this.getHtmlFiles();
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            // Add viewport meta tag if missing
            if (!document.querySelector('meta[name="viewport"]')) {
                const viewport = document.createElement('meta');
                viewport.setAttribute('name', 'viewport');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                document.head.appendChild(viewport);
                this.fixes.push(`Added viewport meta tag to ${file}`);
            }
            
            // Add meta description if missing
            if (!document.querySelector('meta[name="description"]')) {
                const description = document.createElement('meta');
                description.setAttribute('name', 'description');
                description.setAttribute('content', this.generateDescription(file));
                document.head.appendChild(description);
                this.fixes.push(`Added meta description to ${file}`);
            }
            
            fs.writeFileSync(file, dom.serialize());
        }
    }

    async addCanonicalUrls() {
        const htmlFiles = this.getHtmlFiles();
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            if (!document.querySelector('link[rel="canonical"]')) {
                const canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                canonical.setAttribute('href', this.getCanonicalUrl(file));
                document.head.appendChild(canonical);
                this.fixes.push(`Added canonical URL to ${file}`);
            }
            
            fs.writeFileSync(file, dom.serialize());
        }
    }

    async fixStructuredData() {
        const htmlFiles = this.getHtmlFiles();
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            // Check if structured data exists
            const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
            
            if (!existingStructuredData) {
                const structuredData = this.generateStructuredData(file);
                const script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                script.textContent = JSON.stringify(structuredData, null, 2);
                document.head.appendChild(script);
                this.fixes.push(`Added structured data to ${file}`);
            }
            
            fs.writeFileSync(file, dom.serialize());
        }
    }

    async addOpenGraphTags() {
        const htmlFiles = this.getHtmlFiles();
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            if (!document.querySelector('meta[property="og:title"]')) {
                const ogTags = this.generateOpenGraphTags(file);
                
                ogTags.forEach(tag => {
                    const meta = document.createElement('meta');
                    meta.setAttribute('property', tag.property);
                    meta.setAttribute('content', tag.content);
                    document.head.appendChild(meta);
                });
                
                this.fixes.push(`Added Open Graph tags to ${file}`);
            }
            
            fs.writeFileSync(file, dom.serialize());
        }
    }

    async fixImageAltText() {
        const htmlFiles = this.getHtmlFiles();
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const dom = new JSDOM(content);
            const document = dom.window.document;
            
            const images = document.querySelectorAll('img');
            let fixed = false;
            
            images.forEach(img => {
                if (!img.getAttribute('alt') || img.getAttribute('alt').trim() === '') {
                    const altText = this.generateAltText(img.getAttribute('src'), file);
                    img.setAttribute('alt', altText);
                    fixed = true;
                }
            });
            
            if (fixed) {
                fs.writeFileSync(file, dom.serialize());
                this.fixes.push(`Fixed image alt text in ${file}`);
            }
        }
    }

    async validateSEORequirements() {
        console.log('🔍 Validating SEO requirements and bot accessibility...');
        
        // Check robots.txt
        this.validateRobotsTxt();
        
        // Check sitemap
        this.validateSitemap();
        
        // Validate page load times
        await this.validatePerformance();
        
        // Check internal linking
        this.validateInternalLinking();
        
        console.log('✅ SEO validation completed\n');
    }

    validateRobotsTxt() {
        if (!fs.existsSync('robots.txt')) {
            this.issues.push('robots.txt file is missing');
            return;
        }
        
        const robotsContent = fs.readFileSync('robots.txt', 'utf8');
        if (!robotsContent.includes('Sitemap:')) {
            this.issues.push('robots.txt missing sitemap reference');
        }
    }

    validateSitemap() {
        const sitemapFiles = ['sitemap.xml', 'sitemap-index.xml'];
        
        sitemapFiles.forEach(file => {
            if (!fs.existsSync(file)) {
                this.issues.push(`${file} is missing`);
            }
        });
    }

    async validatePerformance() {
        // Basic performance validation
        const htmlFiles = this.getHtmlFiles();
        
        for (const file of htmlFiles) {
            const stats = fs.statSync(file);
            if (stats.size > 100000) { // 100KB
                this.issues.push(`${file} is large (${Math.round(stats.size/1024)}KB) - consider optimization`);
            }
        }
    }

    validateInternalLinking() {
        const htmlFiles = this.getHtmlFiles();
        const allLinks = new Set();
        
        htmlFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const dom = new JSDOM(content);
            const links = dom.window.document.querySelectorAll('a[href]');
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                    allLinks.add({ href, sourceFile: file });
                }
            });
        });
        
        // Check if internal links exist (relative to source file)
        allLinks.forEach(linkInfo => {
            const { href, sourceFile } = linkInfo;
            const sourceDir = path.dirname(sourceFile);
            let targetPath;
            
            if (href.startsWith('/')) {
                // Absolute path from root
                targetPath = path.join('.', href);
            } else if (href.startsWith('../')) {
                // Relative path
                targetPath = path.resolve(sourceDir, href);
            } else {
                // Same directory
                targetPath = path.resolve(sourceDir, href);
            }
            
            // Check if file exists or if it's a directory with index.html
            if (!fs.existsSync(targetPath)) {
                const indexPath = path.join(targetPath, 'index.html');
                if (!fs.existsSync(indexPath)) {
                    // Only report as broken if it's not a common system file
                    if (!href.includes('sitemap.xml') && !href.includes('robots.txt')) {
                        this.issues.push(`Broken internal link in ${sourceFile}: ${href}`);
                    }
                }
            }
        });
    }

    async prepareDeploymentConfig() {
        console.log('📦 Preparing deployment configuration...');
        
        // Create deployment configuration files
        this.createNetlifyConfig();
        this.createVercelConfig();
        this.createGitHubPagesConfig();
        this.createDockerConfig();
        
        // Create deployment checklist
        this.createDeploymentChecklist();
        
        console.log('✅ Deployment configuration completed\n');
    }

    createNetlifyConfig() {
        const netlifyConfig = {
            build: {
                publish: ".",
                command: "npm run build"
            },
            headers: [
                {
                    for: "/*",
                    values: {
                        "X-Frame-Options": "DENY",
                        "X-XSS-Protection": "1; mode=block",
                        "X-Content-Type-Options": "nosniff",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    }
                },
                {
                    for: "*.html",
                    values: {
                        "Cache-Control": "public, max-age=3600"
                    }
                },
                {
                    for: "/assets/*",
                    values: {
                        "Cache-Control": "public, max-age=31536000"
                    }
                }
            ],
            redirects: [
                {
                    from: "/api/*",
                    to: "/.netlify/functions/:splat",
                    status: 200
                }
            ]
        };
        
        fs.writeFileSync('netlify.toml', this.toToml(netlifyConfig));
        this.fixes.push('Created Netlify configuration');
    }

    createVercelConfig() {
        const vercelConfig = {
            version: 2,
            builds: [
                {
                    src: "package.json",
                    use: "@vercel/static-build"
                }
            ],
            routes: [
                {
                    src: "/(.*)",
                    dest: "/$1"
                }
            ],
            headers: [
                {
                    source: "/(.*)",
                    headers: [
                        {
                            key: "X-Frame-Options",
                            value: "DENY"
                        },
                        {
                            key: "X-Content-Type-Options",
                            value: "nosniff"
                        }
                    ]
                }
            ]
        };
        
        fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
        this.fixes.push('Created Vercel configuration');
    }

    createGitHubPagesConfig() {
        const workflowDir = '.github/workflows';
        if (!fs.existsSync(workflowDir)) {
            fs.mkdirSync(workflowDir, { recursive: true });
        }
        
        const workflow = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
`;
        
        fs.writeFileSync(path.join(workflowDir, 'deploy.yml'), workflow);
        this.fixes.push('Created GitHub Pages workflow');
    }

    createDockerConfig() {
        const dockerfile = `FROM nginx:alpine

COPY . /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;

        const nginxConfig = `events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
        
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
`;
        
        fs.writeFileSync('Dockerfile', dockerfile);
        fs.writeFileSync('nginx.conf', nginxConfig);
        this.fixes.push('Created Docker configuration');
    }

    createDeploymentChecklist() {
        const checklist = `# Deployment Checklist

## Pre-deployment Validation
- [ ] All tests pass (run \`npm run test:comprehensive\`)
- [ ] SEO validation score > 80%
- [ ] Performance score > 80%
- [ ] All files under 500 lines
- [ ] robots.txt configured
- [ ] Sitemap generated and accessible
- [ ] All images have alt text
- [ ] Meta descriptions on all pages
- [ ] Canonical URLs set
- [ ] Structured data implemented
- [ ] Open Graph tags added

## Deployment Configuration
- [ ] Choose hosting platform (Netlify/Vercel/GitHub Pages/Docker)
- [ ] Update base URL in configuration
- [ ] Set up custom domain (if applicable)
- [ ] Configure SSL certificate
- [ ] Set up CDN (if needed)

## Post-deployment Validation
- [ ] Test all pages load correctly
- [ ] Verify robots.txt accessible
- [ ] Check sitemap accessibility
- [ ] Test search functionality
- [ ] Validate structured data with Google Rich Results Test
- [ ] Check Core Web Vitals
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor crawl errors

## SEO Monitoring Setup
- [ ] Google Search Console configured
- [ ] Google Analytics set up
- [ ] Bot detection monitoring active
- [ ] Performance monitoring in place
- [ ] Regular SEO health checks scheduled

## Security Checklist
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Content Security Policy set
- [ ] No sensitive data exposed
- [ ] Regular security updates planned
`;
        
        fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
        this.fixes.push('Created deployment checklist');
    }

    generateFinalReport() {
        console.log('📊 Generating final integration report...\n');
        
        const report = {
            timestamp: new Date().toISOString(),
            fixes: this.fixes,
            issues: this.issues,
            deploymentReady: this.issues.length === 0,
            recommendations: this.generateRecommendations()
        };
        
        // Save JSON report
        if (!fs.existsSync('build-reports')) {
            fs.mkdirSync('build-reports');
        }
        
        fs.writeFileSync('build-reports/final-integration-report.json', JSON.stringify(report, null, 2));
        
        // Display summary
        console.log('🎯 FINAL INTEGRATION REPORT');
        console.log('='.repeat(50));
        console.log(`✅ Fixes Applied: ${this.fixes.length}`);
        console.log(`❌ Issues Found: ${this.issues.length}`);
        console.log(`🚀 Deployment Ready: ${report.deploymentReady ? 'YES' : 'NO'}`);
        
        if (this.fixes.length > 0) {
            console.log('\n✅ Applied Fixes:');
            this.fixes.forEach(fix => console.log(`   • ${fix}`));
        }
        
        if (this.issues.length > 0) {
            console.log('\n❌ Remaining Issues:');
            this.issues.forEach(issue => console.log(`   • ${issue}`));
        }
        
        console.log('\n📋 Next Steps:');
        console.log('   1. Review DEPLOYMENT_CHECKLIST.md');
        console.log('   2. Choose deployment platform configuration');
        console.log('   3. Update base URL in configuration files');
        console.log('   4. Run final tests before deployment');
        console.log('   5. Deploy and monitor');
        
        console.log('\n💾 Detailed report saved to: build-reports/final-integration-report.json');
    }

    // Helper methods
    getHtmlFiles() {
        const files = [];
        const scanDir = (dir) => {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scanDir(fullPath);
                } else if (item.endsWith('.html')) {
                    files.push(fullPath);
                }
            });
        };
        scanDir('.');
        return files;
    }

    generateDescription(file) {
        const filename = path.basename(file, '.html');
        const descriptions = {
            'index': 'SEO-optimized website designed to attract and engage LLM bots and web crawlers with comprehensive AI tools information.',
            'llm-guide': 'Complete guide to Large Language Models (LLMs) including setup, usage, and best practices for AI development.',
            'ai-tools-overview': 'Comprehensive overview of AI tools and technologies for developers and researchers.',
            'machine-learning-basics': 'Essential machine learning concepts and fundamentals for beginners and professionals.',
            'ggufloader-vs-lmstudio': 'Detailed comparison between GGUFLoader and LM Studio for LLM model management and deployment.',
            'ollama-comparison': 'In-depth comparison of Ollama with other LLM tools and platforms for local AI development.'
        };
        return descriptions[filename] || `Information about ${filename.replace('-', ' ')} for AI and LLM development.`;
    }

    getCanonicalUrl(file) {
        const relativePath = file.replace(/\\/g, '/');
        return `${this.baseUrl}/${relativePath}`;
    }

    generateStructuredData(file) {
        const filename = path.basename(file, '.html');
        const baseData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": this.generateTitle(filename),
            "description": this.generateDescription(file),
            "url": this.getCanonicalUrl(file)
        };
        
        if (filename.includes('comparison')) {
            baseData["@type"] = "Review";
            baseData.reviewBody = this.generateDescription(file);
        }
        
        return baseData;
    }

    generateTitle(filename) {
        const titles = {
            'index': 'SEO LLM Bot Website - AI Tools & Resources',
            'llm-guide': 'Complete LLM Guide - Large Language Models',
            'ai-tools-overview': 'AI Tools Overview - Comprehensive Guide',
            'machine-learning-basics': 'Machine Learning Basics - Essential Concepts',
            'ggufloader-vs-lmstudio': 'GGUFLoader vs LM Studio Comparison',
            'ollama-comparison': 'Ollama vs Other LLM Tools Comparison'
        };
        return titles[filename] || filename.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    generateOpenGraphTags(file) {
        const filename = path.basename(file, '.html');
        return [
            { property: 'og:title', content: this.generateTitle(filename) },
            { property: 'og:description', content: this.generateDescription(file) },
            { property: 'og:url', content: this.getCanonicalUrl(file) },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'SEO LLM Bot Website' }
        ];
    }

    generateAltText(src, file) {
        if (!src) return 'Image';
        if (src.includes('hero')) return 'AI and machine learning illustration';
        if (src.includes('icon')) return 'Feature icon';
        if (src.includes('logo')) return 'Company logo';
        return 'Descriptive image';
    }

    generateRecommendations() {
        return [
            'Update baseUrl in final-integration.js with your actual domain',
            'Choose appropriate deployment platform based on your needs',
            'Set up monitoring and analytics after deployment',
            'Regularly update content to maintain SEO rankings',
            'Monitor Core Web Vitals and performance metrics',
            'Submit sitemap to search engines after deployment'
        ];
    }

    toToml(obj) {
        // Simple TOML converter for Netlify config
        let toml = '';
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && !Array.isArray(value)) {
                toml += `[${key}]\n`;
                for (const [subKey, subValue] of Object.entries(value)) {
                    toml += `  ${subKey} = "${subValue}"\n`;
                }
            } else if (Array.isArray(value)) {
                value.forEach(item => {
                    toml += `[[${key}]]\n`;
                    for (const [itemKey, itemValue] of Object.entries(item)) {
                        if (typeof itemValue === 'object') {
                            toml += `  [${key}.${itemKey}]\n`;
                            for (const [valKey, valValue] of Object.entries(itemValue)) {
                                toml += `    ${valKey} = "${valValue}"\n`;
                            }
                        } else {
                            toml += `  ${itemKey} = "${itemValue}"\n`;
                        }
                    }
                });
            } else {
                toml += `${key} = "${value}"\n`;
            }
        }
        return toml;
    }
}

// Run integration if called directly
if (require.main === module) {
    const integrator = new FinalIntegrator();
    integrator.integrate().catch(console.error);
}

module.exports = FinalIntegrator;