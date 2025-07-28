#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildSystem {
    constructor() {
        this.maxLines = 500;
        this.violations = [];
        this.buildConfig = {
            cssFiles: ['assets/css/styles.css', 'assets/css/search-styles.css'],
            jsFiles: [
                'assets/js/main.js',
                'assets/js/seo-meta-generator.js',
                'assets/js/structured-data-generator.js',
                'assets/js/canonical-url-manager.js',
                'assets/js/robots-sitemap-generator.js',
                'assets/js/performance-optimizer.js',
                'assets/js/lazy-loading.js',
                'assets/js/image-optimizer.js',
                'assets/js/bot-detector.js',
                'assets/js/analytics-monitor.js',
                'assets/js/search-engine.js',
                'assets/js/search-integration.js',
                'assets/js/accessibility-enhancer.js',
                'assets/js/document-template.js',
                'assets/js/service-worker-registration.js'
            ],
            htmlFiles: [
                'index.html',
                'documents/*.html',
                'comparisons/*.html',
                'test-*.html'
            ]
        };
    }

    // Check file line counts and report violations
    checkFileSizes() {
        console.log('🔍 Checking file sizes...');
        this.violations = [];
        
        const checkFile = (filePath) => {
            if (!fs.existsSync(filePath)) return;
            
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n').length;
            
            if (lines > this.maxLines) {
                this.violations.push({
                    file: filePath,
                    lines: lines,
                    excess: lines - this.maxLines
                });
            }
        };

        // Check all relevant files
        const allFiles = [
            ...this.buildConfig.cssFiles,
            ...this.buildConfig.jsFiles,
            'index.html'
        ];

        // Add HTML files from patterns
        const htmlPatterns = ['documents/', 'comparisons/', './'];
        htmlPatterns.forEach(pattern => {
            const dir = pattern === './' ? '.' : pattern;
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir)
                    .filter(file => file.endsWith('.html'))
                    .map(file => path.join(dir, file));
                allFiles.push(...files);
            }
        });

        allFiles.forEach(checkFile);

        if (this.violations.length > 0) {
            console.log('❌ File size violations found:');
            this.violations.forEach(violation => {
                console.log(`   ${violation.file}: ${violation.lines} lines (${violation.excess} over limit)`);
            });
            return false;
        } else {
            console.log('✅ All files are within the 500-line limit');
            return true;
        }
    }

    // Minify CSS files
    minifyCSS() {
        console.log('🎨 Minifying CSS files...');
        
        this.buildConfig.cssFiles.forEach(cssFile => {
            if (fs.existsSync(cssFile)) {
                const outputFile = cssFile.replace('.css', '.min.css');
                try {
                    // Try using clean-css-cli if available
                    execSync(`npx clean-css-cli -o ${outputFile} ${cssFile}`, { stdio: 'inherit' });
                    console.log(`   ✅ ${cssFile} → ${outputFile}`);
                } catch (error) {
                    // Fallback to basic minification
                    console.log(`   ⚠️  Using basic CSS minification for ${cssFile}`);
                    this.basicMinifyCSS(cssFile, outputFile);
                }
            }
        });
    }

    // Basic CSS minification without external dependencies
    basicMinifyCSS(inputFile, outputFile) {
        const css = fs.readFileSync(inputFile, 'utf8');
        
        const minified = css
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around specific characters
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*:\s*/g, ':')
            .replace(/\s*,\s*/g, ',')
            // Remove trailing semicolons before }
            .replace(/;}/g, '}')
            .trim();
        
        fs.writeFileSync(outputFile, minified);
        console.log(`   ✅ ${inputFile} → ${outputFile} (basic minification)`);
    }

    // Minify JavaScript files
    minifyJS() {
        console.log('📦 Minifying JavaScript files...');
        
        this.buildConfig.jsFiles.forEach(jsFile => {
            if (fs.existsSync(jsFile)) {
                const outputFile = jsFile.replace('.js', '.min.js');
                try {
                    // Try using terser if available
                    execSync(`npx terser ${jsFile} -o ${outputFile} --compress --mangle`, { stdio: 'inherit' });
                    console.log(`   ✅ ${jsFile} → ${outputFile}`);
                } catch (error) {
                    // Fallback to basic minification
                    console.log(`   ⚠️  Using basic JS minification for ${jsFile}`);
                    this.basicMinifyJS(jsFile, outputFile);
                }
            }
        });
    }

    // Basic JavaScript minification without external dependencies
    basicMinifyJS(inputFile, outputFile) {
        const js = fs.readFileSync(inputFile, 'utf8');
        
        const minified = js
            // Remove single-line comments (but preserve URLs)
            .replace(/\/\/(?![^\r\n]*https?:)[^\r\n]*/g, '')
            // Remove multi-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace but preserve necessary spaces
            .replace(/\s+/g, ' ')
            // Remove whitespace around operators and punctuation
            .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
            // Remove whitespace after keywords that don't need it
            .replace(/\b(return|throw|else|new|typeof|delete)\s+/g, '$1 ')
            .trim();
        
        fs.writeFileSync(outputFile, minified);
        console.log(`   ✅ ${inputFile} → ${outputFile} (basic minification)`);
    }

    // Generate file size report
    generateSizeReport() {
        console.log('📊 Generating file size report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            violations: this.violations,
            summary: {
                totalFiles: 0,
                violatingFiles: this.violations.length,
                maxLines: this.maxLines
            }
        };

        const reportPath = 'build-reports/file-size-report.json';
        
        // Ensure reports directory exists
        if (!fs.existsSync('build-reports')) {
            fs.mkdirSync('build-reports');
        }

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`   📄 Report saved to ${reportPath}`);
    }

    // Main build process
    async build() {
        console.log('🚀 Starting build process...\n');
        
        const startTime = Date.now();
        
        // Step 1: Check file sizes and generate alerts
        const sizeCheck = this.checkFileSizes();
        this.generateSizeReport();
        
        // Step 2: Run size alert system
        console.log('🔔 Running size alert system...');
        try {
            execSync('node scripts/size-alert-system.js', { stdio: 'inherit' });
        } catch (error) {
            console.error('   ❌ Failed to run size alerts:', error.message);
        }
        
        // Step 3: Minify assets
        this.minifyCSS();
        this.minifyJS();
        
        // Step 4: Generate sitemaps
        console.log('🗺️  Generating sitemaps...');
        try {
            execSync('node scripts/generate-robots-sitemap.js', { stdio: 'inherit' });
            console.log('   ✅ Sitemaps generated');
        } catch (error) {
            console.error('   ❌ Failed to generate sitemaps:', error.message);
        }
        
        // Step 5: Validate build output
        this.validateBuild();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`\n🎉 Build completed in ${duration}s`);
        
        if (!sizeCheck) {
            console.log('\n⚠️  Warning: Some files exceed the 500-line limit. Consider refactoring.');
            console.log('💡 Run "npm run size:suggest" for splitting suggestions');
            process.exit(1);
        }
    }

    // Validate build output
    validateBuild() {
        console.log('✅ Validating build output...');
        
        // Check if minified files were created
        const minifiedFiles = [];
        this.buildConfig.cssFiles.forEach(file => {
            const minFile = file.replace('.css', '.min.css');
            if (fs.existsSync(minFile)) {
                minifiedFiles.push(minFile);
            }
        });
        
        this.buildConfig.jsFiles.forEach(file => {
            const minFile = file.replace('.js', '.min.js');
            if (fs.existsSync(minFile)) {
                minifiedFiles.push(minFile);
            }
        });
        
        console.log(`   📦 ${minifiedFiles.length} minified files created`);
        
        // Check if reports were generated
        const reportFiles = [
            'build-reports/file-size-report.json',
            'build-reports/size-alerts.json'
        ];
        
        reportFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`   📄 Report generated: ${file}`);
            }
        });
    }

    // Watch mode for development
    watch() {
        console.log('👀 Starting watch mode...');
        console.log('Note: Install chokidar for advanced watching: npm install chokidar');
        
        try {
            const chokidar = require('chokidar');
            
            const watcher = chokidar.watch([
                'assets/**/*.{css,js}',
                '*.html',
                'documents/*.html',
                'comparisons/*.html'
            ]);

            watcher.on('change', (filePath) => {
                console.log(`📝 File changed: ${filePath}`);
                this.checkFileSizes();
            });
        } catch (error) {
            console.log('Watch mode requires chokidar. Install with: npm install chokidar');
            console.log('Falling back to manual checking...');
            setInterval(() => {
                this.checkFileSizes();
            }, 5000);
        }
    }
}

// CLI interface
if (require.main === module) {
    const buildSystem = new BuildSystem();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'check':
            buildSystem.checkFileSizes();
            break;
        case 'minify':
            buildSystem.minifyCSS();
            buildSystem.minifyJS();
            break;
        case 'watch':
            buildSystem.watch();
            break;
        case 'build':
        default:
            buildSystem.build();
            break;
    }
}

module.exports = BuildSystem;