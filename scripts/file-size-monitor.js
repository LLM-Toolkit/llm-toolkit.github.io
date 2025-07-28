#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class FileSizeMonitor {
    constructor(maxLines = 500) {
        this.maxLines = maxLines;
        this.patterns = [
            '**/*.html',
            '**/*.css',
            '**/*.js'
        ];
        this.excludePatterns = [
            'node_modules/**',
            '**/*.min.js',
            '**/*.min.css',
            'build-reports/**'
        ];
    }

    // Get all files matching patterns
    getFiles() {
        const files = [];
        
        const walkDir = (dir) => {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip excluded directories
                    if (!this.excludePatterns.some(pattern => 
                        fullPath.includes(pattern.replace('/**', '')))) {
                        walkDir(fullPath);
                    }
                } else if (stat.isFile()) {
                    // Check if file matches patterns and not excluded
                    const ext = path.extname(item);
                    if (['.html', '.css', '.js'].includes(ext) && 
                        !this.excludePatterns.some(pattern => 
                            fullPath.includes(pattern.replace('/**', '')) ||
                            item.includes('.min.'))) {
                        files.push(fullPath.replace(/\\/g, '/'));
                    }
                }
            });
        };
        
        walkDir('.');
        return files;
    }

    // Count lines in a file
    countLines(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.split('\n').length;
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
            return 0;
        }
    }

    // Analyze file sizes
    analyze() {
        const files = this.getFiles();
        const results = [];
        
        files.forEach(filePath => {
            const lines = this.countLines(filePath);
            const size = fs.statSync(filePath).size;
            
            results.push({
                path: filePath,
                lines: lines,
                size: size,
                exceeds: lines > this.maxLines,
                excess: Math.max(0, lines - this.maxLines)
            });
        });

        return results.sort((a, b) => b.lines - a.lines);
    }

    // Generate detailed report
    generateReport() {
        const results = this.analyze();
        const violations = results.filter(r => r.exceeds);
        
        const report = {
            timestamp: new Date().toISOString(),
            maxLines: this.maxLines,
            summary: {
                totalFiles: results.length,
                violatingFiles: violations.length,
                averageLines: Math.round(results.reduce((sum, r) => sum + r.lines, 0) / results.length),
                totalExcessLines: violations.reduce((sum, r) => sum + r.excess, 0)
            },
            violations: violations.map(v => ({
                file: v.path,
                lines: v.lines,
                excess: v.excess,
                size: v.size
            })),
            allFiles: results.map(r => ({
                file: r.path,
                lines: r.lines,
                size: r.size
            }))
        };

        return report;
    }

    // Display console report
    displayReport() {
        const results = this.analyze();
        const violations = results.filter(r => r.exceeds);
        
        console.log('\n📊 File Size Analysis Report');
        console.log('=' .repeat(50));
        
        console.log(`📁 Total files analyzed: ${results.length}`);
        console.log(`📏 Line limit: ${this.maxLines}`);
        console.log(`❌ Files exceeding limit: ${violations.length}`);
        
        if (violations.length > 0) {
            console.log('\n🚨 Files exceeding line limit:');
            violations.forEach(file => {
                console.log(`   ${file.path}: ${file.lines} lines (+${file.excess})`);
            });
        }
        
        console.log('\n📈 Top 10 largest files:');
        results.slice(0, 10).forEach((file, index) => {
            const status = file.exceeds ? '❌' : '✅';
            console.log(`   ${index + 1}. ${status} ${file.path}: ${file.lines} lines`);
        });
        
        return violations.length === 0;
    }

    // Save report to file
    saveReport(outputPath = 'build-reports/file-size-analysis.json') {
        const report = this.generateReport();
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved to: ${outputPath}`);
        
        return report;
    }

    // Watch for file changes
    watch() {
        console.log('👀 Watching files for size changes...');
        console.log('Note: Install chokidar for advanced watching: npm install chokidar');
        
        try {
            const chokidar = require('chokidar');
            
            const watcher = chokidar.watch(this.patterns, {
                ignored: this.excludePatterns
            });

            watcher.on('change', (filePath) => {
                const lines = this.countLines(filePath);
                const exceeds = lines > this.maxLines;
                
                if (exceeds) {
                    console.log(`🚨 ${filePath}: ${lines} lines (exceeds limit by ${lines - this.maxLines})`);
                } else {
                    console.log(`✅ ${filePath}: ${lines} lines (within limit)`);
                }
            });
        } catch (error) {
            console.log('Basic file watching not available. Install chokidar for watch mode.');
            console.log('Run: npm install chokidar');
        }
    }

    // Suggest file splitting for large files
    suggestSplitting() {
        const results = this.analyze();
        const violations = results.filter(r => r.exceeds);
        
        if (violations.length === 0) {
            console.log('✅ No files need splitting');
            return;
        }
        
        console.log('\n💡 Suggestions for file splitting:');
        
        violations.forEach(file => {
            const suggestedParts = Math.ceil(file.lines / this.maxLines);
            console.log(`\n📄 ${file.path} (${file.lines} lines):`);
            console.log(`   → Split into ${suggestedParts} files`);
            console.log(`   → Target: ~${Math.ceil(file.lines / suggestedParts)} lines per file`);
            
            // Provide specific suggestions based on file type
            const ext = path.extname(file.path);
            switch (ext) {
                case '.js':
                    console.log('   💡 Consider: Extract classes, utilities, or modules');
                    break;
                case '.css':
                    console.log('   💡 Consider: Split by components, media queries, or themes');
                    break;
                case '.html':
                    console.log('   💡 Consider: Extract templates, partials, or sections');
                    break;
            }
        });
    }
}

// CLI interface
if (require.main === module) {
    const monitor = new FileSizeMonitor();
    const command = process.argv[2];
    
    switch (command) {
        case 'analyze':
            monitor.displayReport();
            break;
        case 'report':
            monitor.saveReport();
            break;
        case 'watch':
            monitor.watch();
            break;
        case 'suggest':
            monitor.suggestSplitting();
            break;
        default:
            console.log('Usage: node file-size-monitor.js [analyze|report|watch|suggest]');
            break;
    }
}

module.exports = FileSizeMonitor;