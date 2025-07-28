#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SEOValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    // Simple HTML parsing helpers
    parseSelector(html, selector) {
        const regex = new RegExp(`<${selector}[^>]*>([^<]*)</${selector}>`, 'i');
        const match = html.match(regex);
        return match ? { textContent: match[1], getAttribute: (attr) => this.getAttribute(match[0], attr) } : null;
    }

    parseAllSelectors(html, selector) {
        const regex = new RegExp(`<${selector}[^>]*>`, 'gi');
        const matches = html.match(regex) || [];
        return matches.map(match => ({ getAttribute: (attr) => this.getAttribute(match, attr) }));
    }

    parseById(html, id) {
        const regex = new RegExp(`<[^>]*id=["']${id}["'][^>]*>`, 'i');
        return html.match(regex) ? {} : null;
    }

    getAttribute(element, attr) {
        const regex = new RegExp(`${attr}=["']([^"']*)["']`, 'i');
        const match = element.match(regex);
        return match ? match[1] : null;
    }

    // Test result helper
    addTest(name, status, message, details = null) {
        this.results.tests.push({
            name,
            status, // 'pass', 'fail', 'warning'
            message,
            details,
            timestamp: new Date().toISOString()
        });
        
        this.results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
    }

    // Validate HTML file for SEO compliance
    validateHTMLFile(filePath) {
        if (!fs.existsSync(filePath)) {
            this.addTest(`File Exists: ${filePath}`, 'fail', 'File does not exist');
            return;
        }

        const html = fs.readFileSync(filePath, 'utf8');
        
        // Simple HTML parsing without JSDOM
        const document = {
            querySelector: (selector) => this.parseSelector(html, selector),
            querySelectorAll: (selector) => this.parseAllSelectors(html, selector),
            getElementById: (id) => this.parseById(html, id)
        };

        console.log(`\n🔍 Validating SEO for: ${filePath}`);

        // Test 1: Title tag
        const title = document.querySelector('title');
        if (title && title.textContent.trim().length > 0) {
            if (title.textContent.length >= 30 && title.textContent.length <= 60) {
                this.addTest('Title Length', 'pass', `Title length optimal: ${title.textContent.length} chars`);
            } else {
                this.addTest('Title Length', 'warning', `Title length suboptimal: ${title.textContent.length} chars (30-60 recommended)`);
            }
        } else {
            this.addTest('Title Tag', 'fail', 'Missing or empty title tag');
        }

        // Test 2: Meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && metaDesc.getAttribute('content')) {
            const descLength = metaDesc.getAttribute('content').length;
            if (descLength >= 120 && descLength <= 160) {
                this.addTest('Meta Description', 'pass', `Description length optimal: ${descLength} chars`);
            } else {
                this.addTest('Meta Description', 'warning', `Description length suboptimal: ${descLength} chars (120-160 recommended)`);
            }
        } else {
            this.addTest('Meta Description', 'fail', 'Missing meta description');
        }

        // Test 3: H1 tag
        const h1Tags = document.querySelectorAll('h1');
        if (h1Tags.length === 1) {
            this.addTest('H1 Tag', 'pass', 'Single H1 tag found');
        } else if (h1Tags.length === 0) {
            this.addTest('H1 Tag', 'fail', 'No H1 tag found');
        } else {
            this.addTest('H1 Tag', 'warning', `Multiple H1 tags found: ${h1Tags.length}`);
        }

        // Test 4: Heading hierarchy
        this.validateHeadingHierarchy(document);

        // Test 5: Meta viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            this.addTest('Viewport Meta', 'pass', 'Viewport meta tag present');
        } else {
            this.addTest('Viewport Meta', 'fail', 'Missing viewport meta tag');
        }

        // Test 6: Canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && canonical.getAttribute('href')) {
            this.addTest('Canonical URL', 'pass', 'Canonical URL present');
        } else {
            this.addTest('Canonical URL', 'warning', 'Missing canonical URL');
        }

        // Test 7: Structured data
        this.validateStructuredData(document);

        // Test 8: Image alt attributes
        this.validateImageAltText(document);

        // Test 9: Internal links
        this.validateInternalLinks(document, filePath);

        // Test 10: Open Graph tags
        this.validateOpenGraph(document);
    }

    // Validate heading hierarchy
    validateHeadingHierarchy(document) {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        let hierarchyValid = true;
        const issues = [];

        headings.forEach((heading, index) => {
            const currentLevel = parseInt(heading.tagName.charAt(1));
            
            if (index === 0 && currentLevel !== 1) {
                hierarchyValid = false;
                issues.push(`First heading should be H1, found H${currentLevel}`);
            } else if (currentLevel > previousLevel + 1) {
                hierarchyValid = false;
                issues.push(`Heading level jump from H${previousLevel} to H${currentLevel}`);
            }
            
            previousLevel = currentLevel;
        });

        if (hierarchyValid) {
            this.addTest('Heading Hierarchy', 'pass', `Valid heading hierarchy with ${headings.length} headings`);
        } else {
            this.addTest('Heading Hierarchy', 'fail', 'Invalid heading hierarchy', issues);
        }
    }

    // Validate structured data
    validateStructuredData(document) {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        if (jsonLdScripts.length === 0) {
            this.addTest('Structured Data', 'fail', 'No JSON-LD structured data found');
            return;
        }

        let validStructuredData = 0;
        const errors = [];

        jsonLdScripts.forEach((script, index) => {
            try {
                const data = JSON.parse(script.textContent);
                if (data['@context'] && data['@type']) {
                    validStructuredData++;
                } else {
                    errors.push(`Script ${index + 1}: Missing @context or @type`);
                }
            } catch (error) {
                errors.push(`Script ${index + 1}: Invalid JSON - ${error.message}`);
            }
        });

        if (validStructuredData > 0 && errors.length === 0) {
            this.addTest('Structured Data', 'pass', `${validStructuredData} valid structured data blocks found`);
        } else if (validStructuredData > 0) {
            this.addTest('Structured Data', 'warning', `${validStructuredData} valid blocks, but some errors found`, errors);
        } else {
            this.addTest('Structured Data', 'fail', 'No valid structured data found', errors);
        }
    }

    // Validate image alt text
    validateImageAltText(document) {
        const images = document.querySelectorAll('img');
        let imagesWithAlt = 0;
        let imagesWithoutAlt = 0;
        const missingAlt = [];

        images.forEach((img, index) => {
            const alt = img.getAttribute('alt');
            const src = img.getAttribute('src') || `image-${index + 1}`;
            
            if (alt !== null && alt.trim().length > 0) {
                imagesWithAlt++;
            } else {
                imagesWithoutAlt++;
                missingAlt.push(src);
            }
        });

        if (images.length === 0) {
            this.addTest('Image Alt Text', 'pass', 'No images found');
        } else if (imagesWithoutAlt === 0) {
            this.addTest('Image Alt Text', 'pass', `All ${imagesWithAlt} images have alt text`);
        } else {
            this.addTest('Image Alt Text', 'fail', `${imagesWithoutAlt} images missing alt text`, missingAlt);
        }
    }

    // Validate internal links
    validateInternalLinks(document, filePath) {
        const links = document.querySelectorAll('a[href]');
        let internalLinks = 0;
        let externalLinks = 0;
        let brokenLinks = [];

        links.forEach(link => {
            const href = link.getAttribute('href');
            
            if (!href) return; // Skip links without href
            
            if (href.startsWith('http://') || href.startsWith('https://')) {
                externalLinks++;
            } else if (href.startsWith('#')) {
                // Fragment link - check if target exists
                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                if (!target) {
                    brokenLinks.push(`Fragment link ${href} has no target`);
                }
                internalLinks++;
            } else {
                // Relative link - check if file exists
                const linkPath = path.resolve(path.dirname(filePath), href);
                if (!fs.existsSync(linkPath)) {
                    brokenLinks.push(`Relative link ${href} points to non-existent file`);
                }
                internalLinks++;
            }
        });

        if (brokenLinks.length === 0) {
            this.addTest('Internal Links', 'pass', `${internalLinks} internal links, ${externalLinks} external links - all valid`);
        } else {
            this.addTest('Internal Links', 'fail', `Found ${brokenLinks.length} broken links`, brokenLinks);
        }
    }

    // Validate Open Graph tags
    validateOpenGraph(document) {
        const ogTags = {
            'og:title': document.querySelector('meta[property="og:title"]'),
            'og:description': document.querySelector('meta[property="og:description"]'),
            'og:type': document.querySelector('meta[property="og:type"]'),
            'og:url': document.querySelector('meta[property="og:url"]')
        };

        const presentTags = Object.keys(ogTags).filter(tag => ogTags[tag]);
        
        if (presentTags.length >= 3) {
            this.addTest('Open Graph', 'pass', `${presentTags.length}/4 essential OG tags present`);
        } else if (presentTags.length > 0) {
            this.addTest('Open Graph', 'warning', `Only ${presentTags.length}/4 essential OG tags present`);
        } else {
            this.addTest('Open Graph', 'fail', 'No Open Graph tags found');
        }
    }

    // Validate all HTML files in the project
    validateAllPages() {
        console.log('🚀 Starting SEO validation for all pages...\n');

        const htmlFiles = this.findHTMLFiles('.');
        
        htmlFiles.forEach(file => {
            this.validateHTMLFile(file);
        });

        this.generateReport();
    }

    // Find all HTML files
    findHTMLFiles(dir) {
        const files = [];
        
        const walkDir = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    walkDir(fullPath);
                } else if (stat.isFile() && item.endsWith('.html')) {
                    files.push(fullPath.replace(/\\/g, '/'));
                }
            });
        };
        
        walkDir(dir);
        return files;
    }

    // Generate validation report
    generateReport() {
        console.log('\n📊 SEO Validation Report');
        console.log('=' .repeat(50));
        
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📝 Total Tests: ${this.results.tests.length}`);
        
        // Group tests by status
        const failedTests = this.results.tests.filter(t => t.status === 'fail');
        const warningTests = this.results.tests.filter(t => t.status === 'warning');
        
        if (failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`   ${test.name}: ${test.message}`);
                if (test.details) {
                    test.details.forEach(detail => console.log(`     - ${detail}`));
                }
            });
        }
        
        if (warningTests.length > 0) {
            console.log('\n⚠️  Warning Tests:');
            warningTests.forEach(test => {
                console.log(`   ${test.name}: ${test.message}`);
                if (test.details) {
                    test.details.forEach(detail => console.log(`     - ${detail}`));
                }
            });
        }

        // Save detailed report
        this.saveDetailedReport();
        
        return this.results.failed === 0;
    }

    // Save detailed report to file
    saveDetailedReport() {
        const reportPath = 'build-reports/seo-validation-report.json';
        
        // Ensure directory exists
        const dir = path.dirname(reportPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                passed: this.results.passed,
                failed: this.results.failed,
                warnings: this.results.warnings,
                total: this.results.tests.length,
                successRate: ((this.results.passed / this.results.tests.length) * 100).toFixed(2)
            },
            tests: this.results.tests
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    }
}

// CLI interface
if (require.main === module) {
    const validator = new SEOValidator();
    const filePath = process.argv[2];
    
    if (filePath) {
        validator.validateHTMLFile(filePath);
        validator.generateReport();
    } else {
        validator.validateAllPages();
    }
}

module.exports = SEOValidator;