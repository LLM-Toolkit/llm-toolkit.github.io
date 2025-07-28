#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        
        // Core Web Vitals thresholds
        this.thresholds = {
            // Largest Contentful Paint (LCP) - simulated
            lcp: {
                good: 2500,
                needsImprovement: 4000
            },
            // First Input Delay (FID) - simulated
            fid: {
                good: 100,
                needsImprovement: 300
            },
            // Cumulative Layout Shift (CLS) - simulated
            cls: {
                good: 0.1,
                needsImprovement: 0.25
            },
            // File size thresholds
            fileSize: {
                html: 100 * 1024, // 100KB
                css: 50 * 1024,   // 50KB
                js: 100 * 1024    // 100KB
            },
            // Load time thresholds
            loadTime: {
                good: 2000,
                needsImprovement: 3000
            }
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

    // Test file size performance
    testFileSize(filePath) {
        if (!fs.existsSync(filePath)) {
            this.addTest(`File Size: ${filePath}`, 'fail', 'File does not exist');
            return;
        }

        const stats = fs.statSync(filePath);
        const fileSize = stats.size;
        const ext = path.extname(filePath).toLowerCase();
        
        let threshold;
        switch (ext) {
            case '.html':
                threshold = this.thresholds.fileSize.html;
                break;
            case '.css':
                threshold = this.thresholds.fileSize.css;
                break;
            case '.js':
                threshold = this.thresholds.fileSize.js;
                break;
            default:
                // For other files, use a general threshold
                threshold = 200 * 1024; // 200KB
        }

        const fileSizeKB = (fileSize / 1024).toFixed(2);
        const thresholdKB = (threshold / 1024).toFixed(2);

        if (fileSize <= threshold) {
            this.addTest(`File Size: ${path.basename(filePath)}`, 'pass', `${fileSizeKB}KB (under ${thresholdKB}KB limit)`);
        } else if (fileSize <= threshold * 1.5) {
            this.addTest(`File Size: ${path.basename(filePath)}`, 'warning', `${fileSizeKB}KB (exceeds ${thresholdKB}KB limit)`);
        } else {
            this.addTest(`File Size: ${path.basename(filePath)}`, 'fail', `${fileSizeKB}KB (significantly exceeds ${thresholdKB}KB limit)`);
        }
    }

    // Simulate load time testing
    simulateLoadTime(filePath) {
        const startTime = performance.now();
        
        // Simulate file reading and processing
        const content = fs.readFileSync(filePath, 'utf8');
        const processingTime = content.length / 10000; // Simulate processing based on content length
        
        const endTime = performance.now();
        const loadTime = endTime - startTime + processingTime;

        const fileName = path.basename(filePath);
        
        if (loadTime <= this.thresholds.loadTime.good) {
            this.addTest(`Load Time: ${fileName}`, 'pass', `${loadTime.toFixed(2)}ms (excellent)`);
        } else if (loadTime <= this.thresholds.loadTime.needsImprovement) {
            this.addTest(`Load Time: ${fileName}`, 'warning', `${loadTime.toFixed(2)}ms (needs improvement)`);
        } else {
            this.addTest(`Load Time: ${fileName}`, 'fail', `${loadTime.toFixed(2)}ms (poor)`);
        }
    }

    // Test image optimization
    testImageOptimization(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const images = [];
        let match;

        while ((match = imageRegex.exec(content)) !== null) {
            images.push(match[1]);
        }

        if (images.length === 0) {
            this.addTest(`Image Optimization: ${path.basename(filePath)}`, 'pass', 'No images found');
            return;
        }

        let optimizedImages = 0;
        let unoptimizedImages = [];

        images.forEach(imageSrc => {
            // Check if image has optimization indicators
            if (imageSrc.includes('.png') || imageSrc.includes('?w=') || imageSrc.includes('?quality=')) {
                optimizedImages++;
            } else {
                unoptimizedImages.push(imageSrc);
            }
        });

        const optimizationRate = (optimizedImages / images.length) * 100;

        if (optimizationRate >= 80) {
            this.addTest(`Image Optimization: ${path.basename(filePath)}`, 'pass', `${optimizationRate.toFixed(1)}% images optimized`);
        } else if (optimizationRate >= 50) {
            this.addTest(`Image Optimization: ${path.basename(filePath)}`, 'warning', `${optimizationRate.toFixed(1)}% images optimized`);
        } else {
            this.addTest(`Image Optimization: ${path.basename(filePath)}`, 'fail', `Only ${optimizationRate.toFixed(1)}% images optimized`, unoptimizedImages);
        }
    }

    // Test CSS performance
    testCSSPerformance(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Count CSS rules (approximate)
        const ruleCount = (content.match(/\{[^}]*\}/g) || []).length;
        
        // Check for performance anti-patterns
        const issues = [];
        
        // Check for expensive selectors
        if (content.includes('*')) {
            issues.push('Universal selector (*) found - can be expensive');
        }
        
        // Check for deep nesting (approximate)
        const deepNesting = content.match(/\s{8,}\w/g);
        if (deepNesting && deepNesting.length > 10) {
            issues.push('Deep CSS nesting detected - consider flattening');
        }
        
        // Check for unused vendor prefixes
        const oldPrefixes = ['-moz-border-radius', '-webkit-border-radius', '-ms-filter'];
        oldPrefixes.forEach(prefix => {
            if (content.includes(prefix)) {
                issues.push(`Outdated vendor prefix: ${prefix}`);
            }
        });

        const fileName = path.basename(filePath);
        
        if (issues.length === 0 && ruleCount < 1000) {
            this.addTest(`CSS Performance: ${fileName}`, 'pass', `${ruleCount} rules, no performance issues`);
        } else if (issues.length <= 2 && ruleCount < 2000) {
            this.addTest(`CSS Performance: ${fileName}`, 'warning', `${ruleCount} rules, minor issues found`, issues);
        } else {
            this.addTest(`CSS Performance: ${fileName}`, 'fail', `${ruleCount} rules, performance issues found`, issues);
        }
    }

    // Test JavaScript performance
    testJSPerformance(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for performance anti-patterns
        const issues = [];
        
        // Check for synchronous operations that could block
        if (content.includes('document.write')) {
            issues.push('document.write() found - blocks parsing');
        }
        
        // Check for inefficient DOM queries
        const domQueries = (content.match(/document\.getElementById|document\.querySelector/g) || []).length;
        if (domQueries > 20) {
            issues.push(`High number of DOM queries: ${domQueries}`);
        }
        
        // Check for memory leaks patterns
        if (content.includes('setInterval') && !content.includes('clearInterval')) {
            issues.push('setInterval without clearInterval - potential memory leak');
        }
        
        // Check for large inline data
        const jsonMatches = content.match(/\{[^}]{500,}\}/g);
        if (jsonMatches && jsonMatches.length > 0) {
            issues.push('Large inline JSON objects found - consider external files');
        }

        const fileName = path.basename(filePath);
        
        if (issues.length === 0) {
            this.addTest(`JS Performance: ${fileName}`, 'pass', 'No performance issues detected');
        } else if (issues.length <= 2) {
            this.addTest(`JS Performance: ${fileName}`, 'warning', 'Minor performance issues found', issues);
        } else {
            this.addTest(`JS Performance: ${fileName}`, 'fail', 'Multiple performance issues found', issues);
        }
    }

    // Test HTML performance
    testHTMLPerformance(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for performance best practices
        const issues = [];
        const recommendations = [];
        
        // Check for inline styles
        const inlineStyles = (content.match(/style="/g) || []).length;
        if (inlineStyles > 5) {
            issues.push(`${inlineStyles} inline styles found - consider external CSS`);
        }
        
        // Check for inline scripts
        const inlineScripts = (content.match(/<script(?![^>]*src=)[^>]*>/g) || []).length;
        if (inlineScripts > 3) {
            issues.push(`${inlineScripts} inline scripts found - consider external JS`);
        }
        
        // Check for resource hints
        const hasPreload = content.includes('rel="preload"');
        const hasPrefetch = content.includes('rel="prefetch"');
        const hasDNSPrefetch = content.includes('rel="dns-prefetch"');
        
        if (!hasPreload && !hasPrefetch) {
            recommendations.push('Consider adding resource hints (preload/prefetch)');
        }
        
        // Check for critical CSS
        const hasCriticalCSS = content.includes('<style>') && content.includes('</style>');
        if (!hasCriticalCSS) {
            recommendations.push('Consider inlining critical CSS');
        }

        const fileName = path.basename(filePath);
        
        if (issues.length === 0) {
            this.addTest(`HTML Performance: ${fileName}`, 'pass', 'Good HTML performance practices');
            if (recommendations.length > 0) {
                this.addTest(`HTML Recommendations: ${fileName}`, 'warning', 'Performance recommendations', recommendations);
            }
        } else if (issues.length <= 2) {
            this.addTest(`HTML Performance: ${fileName}`, 'warning', 'Minor HTML performance issues', issues);
        } else {
            this.addTest(`HTML Performance: ${fileName}`, 'fail', 'Multiple HTML performance issues', issues);
        }
    }

    // Test a single file comprehensively
    testFile(filePath) {
        console.log(`\n🔍 Testing performance for: ${filePath}`);
        
        const ext = path.extname(filePath).toLowerCase();
        
        // Common tests for all files
        this.testFileSize(filePath);
        this.simulateLoadTime(filePath);
        
        // File-type specific tests
        switch (ext) {
            case '.html':
                this.testHTMLPerformance(filePath);
                this.testImageOptimization(filePath);
                break;
            case '.css':
                this.testCSSPerformance(filePath);
                break;
            case '.js':
                this.testJSPerformance(filePath);
                break;
        }
    }

    // Test all relevant files
    testAllFiles() {
        console.log('🚀 Starting performance testing for all files...\n');

        const files = this.findRelevantFiles('.');
        
        files.forEach(file => {
            this.testFile(file);
        });

        this.generateReport();
    }

    // Find all relevant files for performance testing
    findRelevantFiles(dir) {
        const files = [];
        const extensions = ['.html', '.css', '.js'];
        
        const walkDir = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    walkDir(fullPath);
                } else if (stat.isFile() && extensions.includes(path.extname(item).toLowerCase())) {
                    // Skip minified files for testing
                    if (!item.includes('.min.')) {
                        files.push(fullPath.replace(/\\/g, '/'));
                    }
                }
            });
        };
        
        walkDir(dir);
        return files;
    }

    // Generate performance report
    generateReport() {
        console.log('\n📊 Performance Testing Report');
        console.log('=' .repeat(50));
        
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📝 Total Tests: ${this.results.tests.length}`);
        
        // Calculate performance score
        const totalTests = this.results.tests.length;
        const score = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(1) : 0;
        console.log(`🎯 Performance Score: ${score}%`);
        
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
        const reportPath = 'build-reports/performance-report.json';
        
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
                performanceScore: ((this.results.passed / this.results.tests.length) * 100).toFixed(2)
            },
            thresholds: this.thresholds,
            tests: this.results.tests
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    }
}

// CLI interface
if (require.main === module) {
    const tester = new PerformanceTester();
    const filePath = process.argv[2];
    
    if (filePath) {
        tester.testFile(filePath);
        tester.generateReport();
    } else {
        tester.testAllFiles();
    }
}

module.exports = PerformanceTester;