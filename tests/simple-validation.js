#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SimpleValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
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
        
        const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
        console.log(`   ${icon} ${name}: ${message}`);
    }

    // Validate HTML file for basic SEO requirements
    validateHTMLFile(filePath) {
        if (!fs.existsSync(filePath)) {
            this.addTest(`File Exists: ${filePath}`, 'fail', 'File does not exist');
            return;
        }

        const html = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        console.log(`\n🔍 Validating: ${fileName}`);

        // Test 1: Title tag
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1].trim().length > 0) {
            const titleLength = titleMatch[1].trim().length;
            if (titleLength >= 30 && titleLength <= 60) {
                this.addTest('Title Length', 'pass', `${titleLength} chars (optimal)`);
            } else {
                this.addTest('Title Length', 'warning', `${titleLength} chars (30-60 recommended)`);
            }
        } else {
            this.addTest('Title Tag', 'fail', 'Missing or empty title tag');
        }

        // Test 2: Meta description
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (metaDescMatch) {
            const descLength = metaDescMatch[1].length;
            if (descLength >= 120 && descLength <= 160) {
                this.addTest('Meta Description', 'pass', `${descLength} chars (optimal)`);
            } else {
                this.addTest('Meta Description', 'warning', `${descLength} chars (120-160 recommended)`);
            }
        } else {
            this.addTest('Meta Description', 'fail', 'Missing meta description');
        }

        // Test 3: H1 tag
        const h1Matches = html.match(/<h1[^>]*>/gi);
        if (h1Matches && h1Matches.length === 1) {
            this.addTest('H1 Tag', 'pass', 'Single H1 tag found');
        } else if (!h1Matches || h1Matches.length === 0) {
            this.addTest('H1 Tag', 'fail', 'No H1 tag found');
        } else {
            this.addTest('H1 Tag', 'warning', `Multiple H1 tags found: ${h1Matches.length}`);
        }

        // Test 4: Viewport meta tag
        const viewportMatch = html.match(/<meta[^>]*name=["']viewport["']/i);
        if (viewportMatch) {
            this.addTest('Viewport Meta', 'pass', 'Viewport meta tag present');
        } else {
            this.addTest('Viewport Meta', 'fail', 'Missing viewport meta tag');
        }

        // Test 5: Canonical URL
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["']/i);
        if (canonicalMatch) {
            this.addTest('Canonical URL', 'pass', 'Canonical URL present');
        } else {
            this.addTest('Canonical URL', 'warning', 'Missing canonical URL');
        }

        // Test 6: Structured data (JSON-LD)
        const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/i);
        if (jsonLdMatch) {
            this.addTest('Structured Data', 'pass', 'JSON-LD structured data found');
        } else {
            this.addTest('Structured Data', 'fail', 'No JSON-LD structured data found');
        }

        // Test 7: Image alt attributes
        const imgMatches = html.match(/<img[^>]*>/gi) || [];
        let imagesWithAlt = 0;
        let imagesWithoutAlt = 0;

        imgMatches.forEach(img => {
            if (img.match(/alt=["'][^"']*["']/i)) {
                imagesWithAlt++;
            } else {
                imagesWithoutAlt++;
            }
        });

        if (imgMatches.length === 0) {
            this.addTest('Image Alt Text', 'pass', 'No images found');
        } else if (imagesWithoutAlt === 0) {
            this.addTest('Image Alt Text', 'pass', `All ${imagesWithAlt} images have alt text`);
        } else {
            this.addTest('Image Alt Text', 'fail', `${imagesWithoutAlt} images missing alt text`);
        }

        // Test 8: Open Graph tags
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["']/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["']/i);
        const ogTypeMatch = html.match(/<meta[^>]*property=["']og:type["']/i);
        
        const ogTagCount = [ogTitleMatch, ogDescMatch, ogTypeMatch].filter(Boolean).length;
        
        if (ogTagCount >= 3) {
            this.addTest('Open Graph', 'pass', 'Essential OG tags present');
        } else if (ogTagCount > 0) {
            this.addTest('Open Graph', 'warning', `Only ${ogTagCount}/3 essential OG tags present`);
        } else {
            this.addTest('Open Graph', 'fail', 'No Open Graph tags found');
        }
    }

    // Validate file size
    validateFileSize(filePath) {
        if (!fs.existsSync(filePath)) return;

        const stats = fs.statSync(filePath);
        const fileSize = stats.size;
        const fileName = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase();

        let threshold;
        switch (ext) {
            case '.html':
                threshold = 100 * 1024; // 100KB
                break;
            case '.css':
                threshold = 50 * 1024; // 50KB
                break;
            case '.js':
                threshold = 100 * 1024; // 100KB
                break;
            default:
                threshold = 200 * 1024; // 200KB
        }

        const fileSizeKB = (fileSize / 1024).toFixed(2);
        const thresholdKB = (threshold / 1024).toFixed(2);

        if (fileSize <= threshold) {
            this.addTest(`File Size: ${fileName}`, 'pass', `${fileSizeKB}KB (under ${thresholdKB}KB limit)`);
        } else if (fileSize <= threshold * 1.5) {
            this.addTest(`File Size: ${fileName}`, 'warning', `${fileSizeKB}KB (exceeds ${thresholdKB}KB limit)`);
        } else {
            this.addTest(`File Size: ${fileName}`, 'fail', `${fileSizeKB}KB (significantly exceeds ${thresholdKB}KB limit)`);
        }
    }

    // Validate line count
    validateLineCount(filePath) {
        if (!fs.existsSync(filePath)) return;

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;
        const fileName = path.basename(filePath);
        const maxLines = 500;

        if (lines <= maxLines) {
            this.addTest(`Line Count: ${fileName}`, 'pass', `${lines} lines (under ${maxLines} limit)`);
        } else if (lines <= maxLines * 1.2) {
            this.addTest(`Line Count: ${fileName}`, 'warning', `${lines} lines (exceeds ${maxLines} limit)`);
        } else {
            this.addTest(`Line Count: ${fileName}`, 'fail', `${lines} lines (significantly exceeds ${maxLines} limit)`);
        }
    }

    // Find all relevant files
    findFiles(dir, extensions) {
        const files = [];
        
        const walkDir = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    walkDir(fullPath);
                } else if (stat.isFile() && extensions.includes(path.extname(item).toLowerCase())) {
                    files.push(fullPath.replace(/\\/g, '/'));
                }
            });
        };
        
        walkDir(dir);
        return files;
    }

    // Run all validations
    runAllValidations() {
        console.log('🚀 Starting comprehensive validation...\n');
        console.log('=' .repeat(60));

        // Find all HTML files
        const htmlFiles = this.findFiles('.', ['.html']);
        
        // Validate each HTML file
        htmlFiles.forEach(file => {
            this.validateHTMLFile(file);
            this.validateFileSize(file);
            this.validateLineCount(file);
        });

        // Validate CSS files
        const cssFiles = this.findFiles('.', ['.css']).filter(f => !f.includes('.min.'));
        cssFiles.forEach(file => {
            this.validateFileSize(file);
            this.validateLineCount(file);
        });

        // Validate JS files
        const jsFiles = this.findFiles('.', ['.js']).filter(f => !f.includes('.min.'));
        jsFiles.forEach(file => {
            this.validateFileSize(file);
            this.validateLineCount(file);
        });

        this.generateReport();
    }

    // Generate validation report
    generateReport() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 VALIDATION REPORT');
        console.log('=' .repeat(60));
        
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📝 Total Tests: ${this.results.tests.length}`);
        
        const score = this.results.tests.length > 0 
            ? ((this.results.passed / this.results.tests.length) * 100).toFixed(1)
            : 0;
        console.log(`🎯 Score: ${score}%`);

        // Quality assessment
        let grade, assessment;
        if (score >= 90) {
            grade = 'A';
            assessment = 'Excellent';
        } else if (score >= 80) {
            grade = 'B';
            assessment = 'Good';
        } else if (score >= 70) {
            grade = 'C';
            assessment = 'Fair';
        } else if (score >= 60) {
            grade = 'D';
            assessment = 'Poor';
        } else {
            grade = 'F';
            assessment = 'Failing';
        }

        console.log(`🏆 Grade: ${grade} (${assessment})`);

        // Save report
        this.saveReport(score, grade, assessment);
        
        return this.results.failed === 0;
    }

    // Save detailed report
    saveReport(score, grade, assessment) {
        const reportPath = 'build-reports/validation-report.json';
        
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
                score: score,
                grade: grade,
                assessment: assessment
            },
            tests: this.results.tests
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved to: ${reportPath}`);
    }
}

// CLI interface
if (require.main === module) {
    const validator = new SimpleValidator();
    const filePath = process.argv[2];
    
    if (filePath) {
        validator.validateHTMLFile(filePath);
        validator.generateReport();
    } else {
        validator.runAllValidations();
    }
}

module.exports = SimpleValidator;