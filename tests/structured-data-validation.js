#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class StructuredDataValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        
        // Schema.org types we expect to find
        this.expectedSchemas = {
            'WebPage': ['name', 'description', 'url'],
            'Article': ['headline', 'author', 'datePublished'],
            'Organization': ['name', 'url'],
            'WebSite': ['name', 'url'],
            'BreadcrumbList': ['itemListElement']
        };
    }

    // Test result helper
    addTest(name, status, message, details = null) {
        this.results.tests.push({
            name,
            status,
            message,
            details,
            timestamp: new Date().toISOString()
        });
        
        this.results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
    }

    // Validate structured data in HTML file
    validateStructuredData(filePath) {
        if (!fs.existsSync(filePath)) {
            this.addTest(`File Exists: ${filePath}`, 'fail', 'File does not exist');
            return;
        }

        const html = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        console.log(`\n🔍 Validating structured data for: ${filePath}`);

        // Find all JSON-LD scripts
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        if (jsonLdScripts.length === 0) {
            this.addTest(`JSON-LD Present: ${filePath}`, 'fail', 'No JSON-LD structured data found');
            return;
        }

        // Validate each JSON-LD block
        jsonLdScripts.forEach((script, index) => {
            this.validateJsonLdBlock(script.textContent, filePath, index + 1);
        });

        // Check for microdata (alternative structured data format)
        this.validateMicrodata(document, filePath);
    }

    // Validate individual JSON-LD block
    validateJsonLdBlock(jsonContent, filePath, blockNumber) {
        const blockId = `${path.basename(filePath)} Block ${blockNumber}`;
        
        try {
            const data = JSON.parse(jsonContent);
            
            // Test 1: Basic structure
            if (!data['@context']) {
                this.addTest(`${blockId} @context`, 'fail', 'Missing @context property');
                return;
            }
            
            if (!data['@type']) {
                this.addTest(`${blockId} @type`, 'fail', 'Missing @type property');
                return;
            }

            this.addTest(`${blockId} Basic Structure`, 'pass', `Valid JSON-LD with @type: ${data['@type']}`);

            // Test 2: Context validation
            if (data['@context'] === 'https://schema.org' || data['@context'] === 'http://schema.org') {
                this.addTest(`${blockId} Context`, 'pass', 'Valid Schema.org context');
            } else {
                this.addTest(`${blockId} Context`, 'warning', `Non-standard context: ${data['@context']}`);
            }

            // Test 3: Type-specific validation
            this.validateSchemaType(data, blockId);

            // Test 4: Required properties
            this.validateRequiredProperties(data, blockId);

            // Test 5: URL validation
            this.validateUrls(data, blockId);

        } catch (error) {
            this.addTest(`${blockId} JSON Parsing`, 'fail', `Invalid JSON: ${error.message}`);
        }
    }

    // Validate specific schema types
    validateSchemaType(data, blockId) {
        const type = data['@type'];
        
        switch (type) {
            case 'WebPage':
                this.validateWebPageSchema(data, blockId);
                break;
            case 'Article':
                this.validateArticleSchema(data, blockId);
                break;
            case 'Organization':
                this.validateOrganizationSchema(data, blockId);
                break;
            case 'WebSite':
                this.validateWebSiteSchema(data, blockId);
                break;
            case 'BreadcrumbList':
                this.validateBreadcrumbSchema(data, blockId);
                break;
            default:
                this.addTest(`${blockId} Schema Type`, 'warning', `Uncommon schema type: ${type}`);
        }
    }

    // Validate WebPage schema
    validateWebPageSchema(data, blockId) {
        const required = ['name', 'description', 'url'];
        const recommended = ['author', 'datePublished', 'dateModified'];
        
        this.checkRequiredFields(data, required, blockId, 'WebPage');
        this.checkRecommendedFields(data, recommended, blockId, 'WebPage');
    }

    // Validate Article schema
    validateArticleSchema(data, blockId) {
        const required = ['headline', 'author', 'datePublished'];
        const recommended = ['description', 'image', 'publisher'];
        
        this.checkRequiredFields(data, required, blockId, 'Article');
        this.checkRecommendedFields(data, recommended, blockId, 'Article');
    }

    // Validate Organization schema
    validateOrganizationSchema(data, blockId) {
        const required = ['name', 'url'];
        const recommended = ['logo', 'description', 'sameAs'];
        
        this.checkRequiredFields(data, required, blockId, 'Organization');
        this.checkRecommendedFields(data, recommended, blockId, 'Organization');
    }

    // Validate WebSite schema
    validateWebSiteSchema(data, blockId) {
        const required = ['name', 'url'];
        const recommended = ['description', 'publisher', 'potentialAction'];
        
        this.checkRequiredFields(data, required, blockId, 'WebSite');
        this.checkRecommendedFields(data, recommended, blockId, 'WebSite');
    }

    // Validate BreadcrumbList schema
    validateBreadcrumbSchema(data, blockId) {
        if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
            this.addTest(`${blockId} Breadcrumb Items`, 'fail', 'Missing or invalid itemListElement array');
            return;
        }

        let validItems = 0;
        data.itemListElement.forEach((item, index) => {
            if (item['@type'] === 'ListItem' && item.position && item.name && item.item) {
                validItems++;
            } else {
                this.addTest(`${blockId} Breadcrumb Item ${index + 1}`, 'fail', 'Invalid breadcrumb item structure');
            }
        });

        if (validItems === data.itemListElement.length) {
            this.addTest(`${blockId} Breadcrumb Structure`, 'pass', `All ${validItems} breadcrumb items valid`);
        }
    }

    // Check required fields
    checkRequiredFields(data, required, blockId, schemaType) {
        const missing = required.filter(field => !data[field]);
        
        if (missing.length === 0) {
            this.addTest(`${blockId} Required Fields`, 'pass', `All required ${schemaType} fields present`);
        } else {
            this.addTest(`${blockId} Required Fields`, 'fail', `Missing required fields: ${missing.join(', ')}`);
        }
    }

    // Check recommended fields
    checkRecommendedFields(data, recommended, blockId, schemaType) {
        const present = recommended.filter(field => data[field]);
        
        if (present.length >= recommended.length * 0.7) {
            this.addTest(`${blockId} Recommended Fields`, 'pass', `Good coverage of recommended ${schemaType} fields`);
        } else {
            this.addTest(`${blockId} Recommended Fields`, 'warning', `Consider adding: ${recommended.filter(f => !data[f]).join(', ')}`);
        }
    }

    // Validate required properties based on schema type
    validateRequiredProperties(data, blockId) {
        const type = data['@type'];
        const expectedProps = this.expectedSchemas[type];
        
        if (!expectedProps) return;
        
        const missingProps = expectedProps.filter(prop => !data[prop]);
        
        if (missingProps.length === 0) {
            this.addTest(`${blockId} Properties`, 'pass', `All expected properties present for ${type}`);
        } else {
            this.addTest(`${blockId} Properties`, 'warning', `Missing recommended properties: ${missingProps.join(', ')}`);
        }
    }

    // Validate URLs in structured data
    validateUrls(data, blockId) {
        const urlFields = ['url', 'sameAs', 'image', 'logo'];
        let validUrls = 0;
        let invalidUrls = [];
        
        urlFields.forEach(field => {
            if (data[field]) {
                const urls = Array.isArray(data[field]) ? data[field] : [data[field]];
                
                urls.forEach(url => {
                    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                        validUrls++;
                    } else {
                        invalidUrls.push(`${field}: ${url}`);
                    }
                });
            }
        });
        
        if (invalidUrls.length === 0 && validUrls > 0) {
            this.addTest(`${blockId} URLs`, 'pass', `All ${validUrls} URLs are valid`);
        } else if (invalidUrls.length > 0) {
            this.addTest(`${blockId} URLs`, 'fail', 'Invalid URLs found', invalidUrls);
        }
    }

    // Validate microdata (alternative to JSON-LD)
    validateMicrodata(document, filePath) {
        const microdataElements = document.querySelectorAll('[itemscope]');
        
        if (microdataElements.length > 0) {
            this.addTest(`Microdata: ${path.basename(filePath)}`, 'pass', `Found ${microdataElements.length} microdata elements`);
        }
    }

    // Validate all HTML files
    validateAllFiles() {
        console.log('🚀 Starting structured data validation for all pages...\n');

        const htmlFiles = this.findHTMLFiles('.');
        
        htmlFiles.forEach(file => {
            this.validateStructuredData(file);
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
        console.log('\n📊 Structured Data Validation Report');
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
            });
        }

        // Save detailed report
        this.saveDetailedReport();
        
        return this.results.failed === 0;
    }

    // Save detailed report to file
    saveDetailedReport() {
        const reportPath = 'build-reports/structured-data-report.json';
        
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
    const validator = new StructuredDataValidator();
    const filePath = process.argv[2];
    
    if (filePath) {
        validator.validateStructuredData(filePath);
        validator.generateReport();
    } else {
        validator.validateAllFiles();
    }
}

module.exports = StructuredDataValidator;