#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class FileSplitter {
    constructor(maxLines = 500) {
        this.maxLines = maxLines;
    }

    // Analyze file and suggest splitting points
    analyzeSplittingPoints(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const ext = path.extname(filePath);
        
        const analysis = {
            file: filePath,
            totalLines: lines.length,
            extension: ext,
            suggestedSplits: [],
            splitPoints: []
        };

        switch (ext) {
            case '.js':
                analysis.splitPoints = this.findJSSplitPoints(lines);
                break;
            case '.css':
                analysis.splitPoints = this.findCSSSplitPoints(lines);
                break;
            case '.html':
                analysis.splitPoints = this.findHTMLSplitPoints(lines);
                break;
        }

        // Calculate suggested splits based on split points
        if (analysis.splitPoints.length > 0) {
            analysis.suggestedSplits = this.calculateOptimalSplits(
                analysis.splitPoints, 
                lines.length
            );
        }

        return analysis;
    }

    // Find logical split points in JavaScript files
    findJSSplitPoints(lines) {
        const splitPoints = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Class declarations
            if (line.startsWith('class ') || line.includes('class ')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'class',
                    description: `Class definition: ${line.substring(0, 50)}...`
                });
            }
            
            // Function declarations
            if (line.startsWith('function ') || line.includes('function ')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'function',
                    description: `Function: ${line.substring(0, 50)}...`
                });
            }
            
            // Object/module exports
            if (line.includes('module.exports') || line.includes('export ')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'export',
                    description: `Export: ${line.substring(0, 50)}...`
                });
            }
            
            // Large comment blocks (potential section dividers)
            if (line.startsWith('//') && line.length > 20) {
                splitPoints.push({
                    line: i + 1,
                    type: 'comment',
                    description: `Section: ${line.substring(0, 50)}...`
                });
            }
        }
        
        return splitPoints;
    }

    // Find logical split points in CSS files
    findCSSSplitPoints(lines) {
        const splitPoints = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Media queries
            if (line.startsWith('@media')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'media-query',
                    description: `Media query: ${line.substring(0, 50)}...`
                });
            }
            
            // Component sections (comments)
            if (line.startsWith('/*') && (line.includes('Component') || line.includes('Section'))) {
                splitPoints.push({
                    line: i + 1,
                    type: 'component',
                    description: `Component: ${line.substring(0, 50)}...`
                });
            }
            
            // Utility classes
            if (line.includes('.utility-') || line.includes('.u-')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'utility',
                    description: `Utility classes: ${line.substring(0, 50)}...`
                });
            }
        }
        
        return splitPoints;
    }

    // Find logical split points in HTML files
    findHTMLSplitPoints(lines) {
        const splitPoints = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Section tags
            if (line.startsWith('<section') || line.startsWith('<div class=')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'section',
                    description: `Section: ${line.substring(0, 50)}...`
                });
            }
            
            // Script tags
            if (line.startsWith('<script')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'script',
                    description: `Script block: ${line.substring(0, 50)}...`
                });
            }
            
            // Style tags
            if (line.startsWith('<style')) {
                splitPoints.push({
                    line: i + 1,
                    type: 'style',
                    description: `Style block: ${line.substring(0, 50)}...`
                });
            }
        }
        
        return splitPoints;
    }

    // Calculate optimal split points based on file size
    calculateOptimalSplits(splitPoints, totalLines) {
        const suggestedSplits = [];
        const targetSplits = Math.ceil(totalLines / this.maxLines);
        
        if (targetSplits <= 1) return suggestedSplits;
        
        const linesPerSplit = Math.floor(totalLines / targetSplits);
        
        for (let i = 1; i < targetSplits; i++) {
            const targetLine = i * linesPerSplit;
            
            // Find the closest split point to the target
            const closestSplit = splitPoints.reduce((closest, current) => {
                const currentDistance = Math.abs(current.line - targetLine);
                const closestDistance = Math.abs(closest.line - targetLine);
                return currentDistance < closestDistance ? current : closest;
            }, splitPoints[0]);
            
            if (closestSplit && !suggestedSplits.includes(closestSplit)) {
                suggestedSplits.push(closestSplit);
            }
        }
        
        return suggestedSplits.sort((a, b) => a.line - b.line);
    }

    // Generate splitting report for a file
    generateSplittingReport(filePath) {
        const analysis = this.analyzeSplittingPoints(filePath);
        
        console.log(`\n📄 Splitting Analysis: ${filePath}`);
        console.log(`   Lines: ${analysis.totalLines} (${analysis.totalLines - this.maxLines} over limit)`);
        console.log(`   Suggested splits: ${analysis.suggestedSplits.length + 1} files`);
        
        if (analysis.suggestedSplits.length > 0) {
            console.log('\n💡 Suggested split points:');
            analysis.suggestedSplits.forEach((split, index) => {
                console.log(`   ${index + 1}. Line ${split.line}: ${split.description}`);
            });
        }
        
        return analysis;
    }

    // Generate splitting suggestions for all oversized files
    generateAllSuggestions() {
        const FileSizeMonitor = require('./file-size-monitor');
        const monitor = new FileSizeMonitor(this.maxLines);
        const results = monitor.analyze();
        const violations = results.filter(r => r.exceeds);
        
        console.log('\n🔧 File Splitting Suggestions');
        console.log('=' .repeat(50));
        
        if (violations.length === 0) {
            console.log('✅ No files need splitting');
            return;
        }
        
        violations.forEach(file => {
            this.generateSplittingReport(file.path);
        });
        
        console.log('\n📋 Summary:');
        console.log(`   Files to split: ${violations.length}`);
        console.log(`   Total excess lines: ${violations.reduce((sum, f) => sum + f.excess, 0)}`);
    }

    // Create backup before splitting
    createBackup(filePath) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.copyFileSync(filePath, backupPath);
        console.log(`   💾 Backup created: ${backupPath}`);
        return backupPath;
    }

    // Auto-split a file (experimental)
    autoSplit(filePath, outputDir = null) {
        console.log(`\n🔧 Auto-splitting: ${filePath}`);
        
        // Create backup
        this.createBackup(filePath);
        
        const analysis = this.analyzeSplittingPoints(filePath);
        
        if (analysis.suggestedSplits.length === 0) {
            console.log('   ⚠️  No suitable split points found');
            return false;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        const baseName = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);
        const dir = outputDir || path.dirname(filePath);
        
        // Split the file
        let currentStart = 0;
        analysis.suggestedSplits.forEach((split, index) => {
            const partContent = lines.slice(currentStart, split.line - 1).join('\n');
            const partPath = path.join(dir, `${baseName}-part${index + 1}${ext}`);
            
            fs.writeFileSync(partPath, partContent);
            console.log(`   ✅ Created: ${partPath} (${split.line - 1 - currentStart} lines)`);
            
            currentStart = split.line - 1;
        });
        
        // Create final part
        const finalContent = lines.slice(currentStart).join('\n');
        const finalPath = path.join(dir, `${baseName}-part${analysis.suggestedSplits.length + 1}${ext}`);
        fs.writeFileSync(finalPath, finalContent);
        console.log(`   ✅ Created: ${finalPath} (${lines.length - currentStart} lines)`);
        
        console.log(`\n✅ File split into ${analysis.suggestedSplits.length + 1} parts`);
        console.log('⚠️  Remember to update imports/references manually');
        
        return true;
    }
}

// CLI interface
if (require.main === module) {
    const splitter = new FileSplitter();
    const command = process.argv[2];
    const filePath = process.argv[3];
    
    switch (command) {
        case 'analyze':
            if (filePath) {
                splitter.generateSplittingReport(filePath);
            } else {
                console.log('Usage: node file-splitter.js analyze <file-path>');
            }
            break;
        case 'suggest':
            splitter.generateAllSuggestions();
            break;
        case 'split':
            if (filePath) {
                splitter.autoSplit(filePath);
            } else {
                console.log('Usage: node file-splitter.js split <file-path>');
            }
            break;
        default:
            console.log('Usage: node file-splitter.js [analyze|suggest|split] [file-path]');
            break;
    }
}

module.exports = FileSplitter;