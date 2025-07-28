/**
 * GGUF Loader Content Correction Utilities
 * 
 * This module provides utilities to scan HTML files for GGUF Loader references,
 * validate content accuracy, and apply corrections while preserving SEO elements.
 * 
 * Requirements addressed: 2.1, 2.2, 2.3
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

// Correct GGUF Loader information reference
const CORRECT_GGUF_LOADER_INFO = {
    name: "GGUF Loader",
    type: "Desktop Application",
    description: "Lightweight, open-source desktop app for running local LLMs in GGUF format",
    features: {
        ui: "Simple chat UI for offline interaction",
        modelSupport: "GGUF format models (Q4_0, Q6_K quantized models)",
        detection: "Auto GPU/CPU detection with GPU fallback to CPU",
        templates: "Supports various chat formats (ChatML, Alpaca, etc.)",
        addons: "Add-on system (Work in Progress)",
        platforms: "Cross-platform (Windows, Linux, macOS)"
    },
    installation: {
        method: "PyPI package",
        command: "pip install ggufloader"
    },
    launch: {
        command: "ggufloader"
    },
    relatedProjects: ["GGUF format", "llama.cpp", "LM Studio", "Ollama"]
};

// Common incorrect descriptions to identify
const INCORRECT_PATTERNS = [
    {
        pattern: /library.*API.*tool/i,
        type: 'incorrect_description',
        severity: 'high',
        correctDescription: 'desktop application'
    },
    {
        pattern: /programmatic.*control/i,
        type: 'wrong_feature',
        severity: 'medium',
        correctDescription: 'GUI-based desktop application'
    },
    {
        pattern: /no.*built-in.*interface/i,
        type: 'wrong_feature',
        severity: 'high',
        correctDescription: 'includes built-in chat UI'
    },
    {
        pattern: /requires.*programming.*knowledge/i,
        type: 'wrong_feature',
        severity: 'medium',
        correctDescription: 'user-friendly desktop application'
    },
    {
        pattern: /npm.*package/i,
        type: 'wrong_installation',
        severity: 'high',
        correctDescription: 'PyPI package installation'
    }
];

/**
 * Content Discovery Component
 * Scans files and extracts GGUF Loader references
 */
class ContentDiscovery {
    /**
     * Scan all HTML files in the workspace for GGUF Loader references
     * @returns {Promise<string[]>} Array of file paths containing GGUF Loader references
     */
    async scanFiles() {
        const htmlFiles = await this._findHtmlFiles('.');
        const filesWithGGUFLoader = [];

        for (const filePath of htmlFiles) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                if (this._containsGGUFLoaderReference(content)) {
                    filesWithGGUFLoader.push(filePath);
                }
            } catch (error) {
                console.warn(`Warning: Could not read file ${filePath}:`, error.message);
            }
        }

        return filesWithGGUFLoader;
    }

    /**
     * Extract GGUF Loader references from a specific file
     * @param {string} filePath - Path to the HTML file
     * @returns {Promise<ContentReference[]>} Array of content references
     */
    async extractGGUFLoaderReferences(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const references = [];
        
        // Split content into lines for line number tracking
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            if (this._containsGGUFLoaderReference(line)) {
                references.push({
                    filePath,
                    lineNumber: index + 1,
                    content: line.trim(),
                    context: this._getContext(lines, index),
                    type: this._determineContentType(line)
                });
            }
        });

        return references;
    }

    /**
     * Identify sections where GGUF Loader should be included in tool lists
     * @param {string} filePath - Path to the HTML file
     * @returns {Promise<ToolListSection[]>} Array of tool list sections
     */
    async identifyToolListSections(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const dom = new JSDOM(content);
        const document = dom.window.document;
        
        const toolListSections = [];
        
        // Look for sections that mention other LLM tools but not GGUF Loader
        const toolKeywords = ['LM Studio', 'Ollama', 'llama.cpp'];
        const sections = document.querySelectorAll('section, div, ul, nav');
        
        sections.forEach((section, index) => {
            const sectionText = section.textContent;
            const hasOtherTools = toolKeywords.some(tool => sectionText.includes(tool));
            const hasGGUFLoader = this._containsGGUFLoaderReference(sectionText);
            
            if (hasOtherTools && !hasGGUFLoader) {
                toolListSections.push({
                    filePath,
                    element: section.tagName,
                    index,
                    content: section.innerHTML,
                    type: this._determineListType(section)
                });
            }
        });

        return toolListSections;
    }

    /**
     * Find placement opportunities for GGUF Loader references
     * @param {string} filePath - Path to the HTML file
     * @returns {Promise<PlacementOpportunity[]>} Array of placement opportunities
     */
    async findPlacementOpportunities(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const opportunities = [];
        
        // Look for strategic placement locations
        const placementPatterns = [
            { pattern: /AI tools.*overview/i, type: 'tool_overview' },
            { pattern: /LLM.*implementation/i, type: 'implementation_guide' },
            { pattern: /local.*LLM/i, type: 'local_llm_section' },
            { pattern: /tool.*comparison/i, type: 'comparison_section' },
            { pattern: /machine.*learning.*basics/i, type: 'basics_section' }
        ];

        const lines = content.split('\n');
        lines.forEach((line, index) => {
            placementPatterns.forEach(pattern => {
                if (pattern.pattern.test(line)) {
                    opportunities.push({
                        filePath,
                        lineNumber: index + 1,
                        type: pattern.type,
                        context: this._getContext(lines, index),
                        priority: this._calculatePriority(pattern.type)
                    });
                }
            });
        });

        return opportunities;
    }

    // Private helper methods
    async _findHtmlFiles(dir) {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory() && !this._shouldSkipDirectory(entry.name)) {
                const subFiles = await this._findHtmlFiles(fullPath);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    _shouldSkipDirectory(dirName) {
        const skipDirs = ['node_modules', '.git', '.kiro', 'build-reports'];
        return skipDirs.includes(dirName);
    }

    _containsGGUFLoaderReference(content) {
        const patterns = [
            /GGUF\s*Loader/i,
            /GGUFLoader/i,
            /gguf.*loader/i
        ];
        return patterns.some(pattern => pattern.test(content));
    }

    _getContext(lines, lineIndex) {
        const start = Math.max(0, lineIndex - 2);
        const end = Math.min(lines.length, lineIndex + 3);
        return lines.slice(start, end).join('\n');
    }

    _determineContentType(line) {
        if (line.includes('<meta')) return 'metadata';
        if (line.includes('<title>')) return 'title';
        if (line.includes('<h')) return 'heading';
        if (line.includes('<p>')) return 'description';
        if (line.includes('<td>') || line.includes('<th>')) return 'comparison';
        if (line.includes('install')) return 'installation';
        return 'general';
    }

    _determineListType(element) {
        if (element.tagName === 'NAV') return 'navigation';
        if (element.tagName === 'UL' || element.tagName === 'OL') return 'list';
        if (element.className.includes('comparison')) return 'comparison';
        if (element.className.includes('tool')) return 'tool_section';
        return 'general';
    }

    _calculatePriority(type) {
        const priorities = {
            'tool_overview': 'high',
            'comparison_section': 'high',
            'implementation_guide': 'medium',
            'local_llm_section': 'medium',
            'basics_section': 'low'
        };
        return priorities[type] || 'low';
    }
}
/**
 
* Accuracy Assessment Component
 * Validates content and identifies inaccuracies
 */
class AccuracyAssessment {
    /**
     * Validate GGUF Loader content for accuracy
     * @param {string} content - Content to validate
     * @returns {ValidationResult} Validation result with accuracy assessment
     */
    validateContent(content) {
        const inaccuracies = this.identifyInaccuracies(content);
        
        return {
            isAccurate: inaccuracies.length === 0,
            inaccuracyCount: inaccuracies.length,
            inaccuracies,
            overallSeverity: this._calculateOverallSeverity(inaccuracies),
            recommendations: this._generateRecommendations(inaccuracies)
        };
    }

    /**
     * Identify specific inaccuracies in content
     * @param {string} content - Content to analyze
     * @returns {Inaccuracy[]} Array of identified inaccuracies
     */
    identifyInaccuracies(content) {
        const inaccuracies = [];

        INCORRECT_PATTERNS.forEach(pattern => {
            const matches = content.match(pattern.pattern);
            if (matches) {
                matches.forEach(match => {
                    inaccuracies.push({
                        type: pattern.type,
                        currentContent: match,
                        correctContent: pattern.correctDescription,
                        severity: pattern.severity,
                        pattern: pattern.pattern.toString(),
                        location: this._findLocation(content, match)
                    });
                });
            }
        });

        // Check for specific incorrect statements
        inaccuracies.push(...this._checkSpecificInaccuracies(content));

        return inaccuracies;
    }

    /**
     * Generate correction plan based on identified inaccuracies
     * @param {Inaccuracy[]} inaccuracies - Array of inaccuracies to correct
     * @returns {CorrectionPlan} Plan for applying corrections
     */
    generateCorrectionPlan(inaccuracies) {
        const corrections = inaccuracies.map(inaccuracy => ({
            type: 'replace',
            target: inaccuracy.currentContent,
            replacement: this._generateReplacement(inaccuracy),
            priority: this._getPriority(inaccuracy.severity),
            preserveContext: true
        }));

        return {
            corrections,
            estimatedChanges: corrections.length,
            riskLevel: this._assessRiskLevel(corrections),
            backupRequired: true,
            seoImpact: this._assessSEOImpact(corrections)
        };
    }

    // Private helper methods
    _calculateOverallSeverity(inaccuracies) {
        if (inaccuracies.some(i => i.severity === 'high')) return 'high';
        if (inaccuracies.some(i => i.severity === 'medium')) return 'medium';
        return inaccuracies.length > 0 ? 'low' : 'none';
    }

    _generateRecommendations(inaccuracies) {
        const recommendations = [];
        
        if (inaccuracies.some(i => i.type === 'incorrect_description')) {
            recommendations.push('Update fundamental description to reflect desktop application nature');
        }
        
        if (inaccuracies.some(i => i.type === 'wrong_feature')) {
            recommendations.push('Correct feature descriptions to match actual GUI capabilities');
        }
        
        if (inaccuracies.some(i => i.type === 'wrong_installation')) {
            recommendations.push('Fix installation instructions to show PyPI method');
        }

        return recommendations;
    }

    _findLocation(content, match) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(match)) {
                return {
                    line: i + 1,
                    column: lines[i].indexOf(match) + 1
                };
            }
        }
        return { line: 0, column: 0 };
    }

    _checkSpecificInaccuracies(content) {
        const specificChecks = [];

        // Check for incorrect characterization as library
        if (content.includes('library') && content.includes('GGUF') && content.includes('API')) {
            specificChecks.push({
                type: 'incorrect_description',
                currentContent: 'library designed specifically for loading',
                correctContent: 'desktop application for running',
                severity: 'high',
                location: this._findLocation(content, 'library')
            });
        }

        // Check for missing GUI mention
        if (content.includes('GGUF') && !content.includes('GUI') && !content.includes('interface')) {
            specificChecks.push({
                type: 'missing_feature',
                currentContent: 'no mention of GUI',
                correctContent: 'includes simple chat UI',
                severity: 'medium',
                location: { line: 0, column: 0 }
            });
        }

        // Check for incorrect installation method
        if (content.includes('npm') && content.includes('GGUF')) {
            specificChecks.push({
                type: 'wrong_installation',
                currentContent: 'npm package',
                correctContent: 'pip install ggufloader',
                severity: 'high',
                location: this._findLocation(content, 'npm')
            });
        }

        return specificChecks;
    }

    _generateReplacement(inaccuracy) {
        const replacements = {
            'incorrect_description': 'desktop application',
            'wrong_feature': CORRECT_GGUF_LOADER_INFO.features.ui,
            'wrong_installation': CORRECT_GGUF_LOADER_INFO.installation.command,
            'missing_feature': 'Simple chat UI for offline interaction'
        };

        return replacements[inaccuracy.type] || inaccuracy.correctContent;
    }

    _getPriority(severity) {
        const priorities = { 'high': 1, 'medium': 2, 'low': 3 };
        return priorities[severity] || 3;
    }

    _assessRiskLevel(corrections) {
        const highRiskCount = corrections.filter(c => c.priority === 1).length;
        if (highRiskCount > 5) return 'high';
        if (highRiskCount > 2) return 'medium';
        return 'low';
    }

    _assessSEOImpact(corrections) {
        const seoSensitiveTypes = ['title', 'metadata', 'heading'];
        const seoImpactingCorrections = corrections.filter(c => 
            seoSensitiveTypes.some(type => c.target.includes(type))
        );

        return {
            impactLevel: seoImpactingCorrections.length > 0 ? 'medium' : 'low',
            affectedElements: seoImpactingCorrections.length,
            preservationRequired: true
        };
    }
}

/**
 * Content Correction Component
 * Applies corrections while preserving SEO elements
 */
class ContentCorrection {
    /**
     * Apply corrections to a file
     * @param {string} filePath - Path to the file to correct
     * @param {Correction[]} corrections - Array of corrections to apply
     * @returns {Promise<void>}
     */
    async applyCorrections(filePath, corrections) {
        // Create backup before making changes
        await this._createBackup(filePath);

        let content = await fs.readFile(filePath, 'utf-8');
        const originalContent = content;

        // Sort corrections by priority (high priority first)
        const sortedCorrections = corrections.sort((a, b) => a.priority - b.priority);

        for (const correction of sortedCorrections) {
            content = await this._applyCorrection(content, correction);
        }

        // Preserve SEO elements
        content = this.preserveSEOElements(originalContent, content);

        // Write corrected content back to file
        await fs.writeFile(filePath, content, 'utf-8');

        // Validate changes
        const validation = await this.validateChanges(filePath);
        if (!validation.isValid) {
            console.warn(`Warning: Validation failed for ${filePath}:`, validation.issues);
        }
    }

    /**
     * Add GGUF Loader references to strategic locations
     * @param {string} filePath - Path to the file
     * @param {PlacementOpportunity[]} placements - Array of placement opportunities
     * @returns {Promise<void>}
     */
    async addGGUFLoaderReferences(filePath, placements) {
        await this._createBackup(filePath);

        let content = await fs.readFile(filePath, 'utf-8');
        const originalContent = content;

        // Sort placements by priority
        const sortedPlacements = placements.sort((a, b) => {
            const priorities = { 'high': 1, 'medium': 2, 'low': 3 };
            return priorities[a.priority] - priorities[b.priority];
        });

        for (const placement of sortedPlacements) {
            content = await this._addGGUFLoaderReference(content, placement);
        }

        // Preserve SEO elements
        content = this.preserveSEOElements(originalContent, content);

        await fs.writeFile(filePath, content, 'utf-8');
    }

    /**
     * Preserve SEO elements during content updates
     * @param {string} originalContent - Original content
     * @param {string} newContent - New content after corrections
     * @returns {string} Content with preserved SEO elements
     */
    preserveSEOElements(originalContent, newContent) {
        const dom = new JSDOM(newContent);
        const document = dom.window.document;

        // Preserve meta tags structure
        this._preserveMetaTags(originalContent, document);
        
        // Preserve structured data
        this._preserveStructuredData(originalContent, document);
        
        // Preserve internal linking
        this._preserveInternalLinks(originalContent, document);

        return dom.serialize();
    }

    /**
     * Validate changes made to a file
     * @param {string} filePath - Path to the validated file
     * @returns {Promise<ValidationResult>} Validation result
     */
    async validateChanges(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const issues = [];

        // Check for broken HTML
        try {
            new JSDOM(content);
        } catch (error) {
            issues.push(`HTML parsing error: ${error.message}`);
        }

        // Check for missing essential elements
        if (!content.includes('<title>')) {
            issues.push('Missing title tag');
        }

        if (!content.includes('meta name="description"')) {
            issues.push('Missing meta description');
        }

        // Check for GGUF Loader accuracy
        const accuracyAssessment = new AccuracyAssessment();
        const validation = accuracyAssessment.validateContent(content);

        return {
            isValid: issues.length === 0 && validation.isAccurate,
            issues,
            accuracyValidation: validation
        };
    }

    // Private helper methods
    async _createBackup(filePath) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        const content = await fs.readFile(filePath, 'utf-8');
        await fs.writeFile(backupPath, content, 'utf-8');
        console.log(`Backup created: ${backupPath}`);
    }

    async _applyCorrection(content, correction) {
        switch (correction.type) {
            case 'replace':
                return content.replace(new RegExp(correction.target, 'gi'), correction.replacement);
            case 'insert':
                return this._insertContent(content, correction);
            case 'remove':
                return content.replace(new RegExp(correction.target, 'gi'), '');
            default:
                console.warn(`Unknown correction type: ${correction.type}`);
                return content;
        }
    }

    async _addGGUFLoaderReference(content, placement) {
        const reference = this._generateGGUFLoaderReference(placement.type);
        const lines = content.split('\n');
        
        // Insert reference at appropriate location
        const insertIndex = placement.lineNumber - 1;
        lines.splice(insertIndex, 0, reference);
        
        return lines.join('\n');
    }

    _generateGGUFLoaderReference(type) {
        const references = {
            'tool_overview': '<li><a href="comparisons/ggufloader-vs-lmstudio.html" title="GGUF Loader - Desktop app for local LLMs">GGUF Loader</a></li>',
            'comparison_section': '<p>GGUF Loader provides a desktop application approach to running local LLMs with a simple chat interface.</p>',
            'implementation_guide': '<li><strong>GGUF Loader:</strong> Desktop application with GUI for easy local LLM deployment</li>',
            'local_llm_section': '<p>For desktop users, GGUF Loader offers a lightweight solution with built-in chat UI.</p>',
            'basics_section': '<li>GGUF Loader - User-friendly desktop application for beginners</li>'
        };

        return references[type] || '<p>GGUF Loader - Desktop application for running local LLMs</p>';
    }

    _insertContent(content, correction) {
        // Implementation for inserting content at specific positions
        const lines = content.split('\n');
        const insertIndex = correction.position || 0;
        lines.splice(insertIndex, 0, correction.replacement);
        return lines.join('\n');
    }

    _preserveMetaTags(originalContent, document) {
        const originalDom = new JSDOM(originalContent);
        const originalMetas = originalDom.window.document.querySelectorAll('meta');
        
        originalMetas.forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            if (name && (name.includes('og:') || name.includes('twitter:') || name === 'description')) {
                const existingMeta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
                if (existingMeta) {
                    // Preserve original meta tag structure
                    existingMeta.setAttribute('content', meta.getAttribute('content'));
                }
            }
        });
    }

    _preserveStructuredData(originalContent, document) {
        const originalDom = new JSDOM(originalContent);
        const originalScripts = originalDom.window.document.querySelectorAll('script[type="application/ld+json"]');
        
        originalScripts.forEach((script, index) => {
            const existingScript = document.querySelectorAll('script[type="application/ld+json"]')[index];
            if (existingScript) {
                // Preserve structured data with minimal changes
                existingScript.textContent = script.textContent;
            }
        });
    }

    _preserveInternalLinks(originalContent, document) {
        // Ensure internal links maintain their structure and attributes
        const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
        links.forEach(link => {
            // Preserve title attributes and other SEO-relevant attributes
            if (!link.getAttribute('title') && link.textContent.includes('GGUF')) {
                link.setAttribute('title', 'GGUF Loader - Desktop application for local LLMs');
            }
        });
    }
}

// Export classes and utilities
module.exports = {
    ContentDiscovery,
    AccuracyAssessment,
    ContentCorrection,
    CORRECT_GGUF_LOADER_INFO,
    INCORRECT_PATTERNS
};

// CLI interface for direct usage
if (require.main === module) {
    const discovery = new ContentDiscovery();
    const assessment = new AccuracyAssessment();
    const correction = new ContentCorrection();

    async function main() {
        console.log('GGUF Loader Content Correction Utilities');
        console.log('=========================================');

        try {
            // Scan for files with GGUF Loader references
            console.log('Scanning for files with GGUF Loader references...');
            const files = await discovery.scanFiles();
            console.log(`Found ${files.length} files with GGUF Loader references:`);
            files.forEach(file => console.log(`  - ${file}`));

            // Analyze each file for inaccuracies
            for (const file of files) {
                console.log(`\nAnalyzing ${file}...`);
                const references = await discovery.extractGGUFLoaderReferences(file);
                console.log(`  Found ${references.length} GGUF Loader references`);

                const content = await fs.readFile(file, 'utf-8');
                const validation = assessment.validateContent(content);
                
                if (!validation.isAccurate) {
                    console.log(`  ⚠️  Found ${validation.inaccuracyCount} inaccuracies (${validation.overallSeverity} severity)`);
                    validation.inaccuracies.forEach(inaccuracy => {
                        console.log(`    - ${inaccuracy.type}: "${inaccuracy.currentContent}"`);
                    });
                } else {
                    console.log(`  ✅ Content appears accurate`);
                }
            }

        } catch (error) {
            console.error('Error during analysis:', error);
        }
    }

    main();
}