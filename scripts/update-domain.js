#!/usr/bin/env node

/**
 * Domain Update Script
 * Updates all HTML files to use the correct GitHub Pages domain
 */

const fs = require('fs');
const path = require('path');

class DomainUpdater {
    constructor() {
        this.oldDomain = 'https://example.com';
        this.newDomain = 'https://llm-toolkit.github.io';
        this.filesUpdated = 0;
        this.replacements = 0;
    }

    updateDomain() {
        console.log('🔄 Updating domain references...');
        console.log(`📍 From: ${this.oldDomain}`);
        console.log(`📍 To: ${this.newDomain}`);
        
        this.updateHtmlFiles();
        this.updateJavaScriptFiles();
        this.updateConfigFiles();
        
        console.log(`✅ Updated ${this.filesUpdated} files with ${this.replacements} replacements`);
    }

    updateHtmlFiles() {
        const htmlFiles = this.getHtmlFiles();
        
        htmlFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const updatedContent = content.replace(new RegExp(this.oldDomain, 'g'), this.newDomain);
            
            if (content !== updatedContent) {
                fs.writeFileSync(file, updatedContent);
                const replacementCount = (content.match(new RegExp(this.oldDomain, 'g')) || []).length;
                this.replacements += replacementCount;
                this.filesUpdated++;
                console.log(`📄 Updated ${file} (${replacementCount} replacements)`);
            }
        });
    }

    updateJavaScriptFiles() {
        const jsFiles = [
            'assets/js/structured-data-generator.js',
            'assets/js/robots-sitemap-generator.js',
            'assets/js/canonical-url-manager.js'
        ];
        
        jsFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const updatedContent = content.replace(new RegExp(this.oldDomain, 'g'), this.newDomain);
                
                if (content !== updatedContent) {
                    fs.writeFileSync(file, updatedContent);
                    const replacementCount = (content.match(new RegExp(this.oldDomain, 'g')) || []).length;
                    this.replacements += replacementCount;
                    this.filesUpdated++;
                    console.log(`📄 Updated ${file} (${replacementCount} replacements)`);
                }
            }
        });
    }

    updateConfigFiles() {
        const configFiles = [
            'scripts/generate-robots-sitemap.js',
            'scripts/final-integration.js'
        ];
        
        configFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const updatedContent = content.replace(new RegExp(this.oldDomain, 'g'), this.newDomain);
                
                if (content !== updatedContent) {
                    fs.writeFileSync(file, updatedContent);
                    const replacementCount = (content.match(new RegExp(this.oldDomain, 'g')) || []).length;
                    this.replacements += replacementCount;
                    this.filesUpdated++;
                    console.log(`📄 Updated ${file} (${replacementCount} replacements)`);
                }
            }
        });
    }

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
}

// Run the updater
if (require.main === module) {
    const updater = new DomainUpdater();
    updater.updateDomain();
}

module.exports = DomainUpdater;