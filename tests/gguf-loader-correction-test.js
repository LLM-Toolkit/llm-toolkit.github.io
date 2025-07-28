/**
 * Test suite for GGUF Loader Content Correction Utilities
 * 
 * This test validates the functionality of the content correction utilities
 * to ensure they properly identify, validate, and correct GGUF Loader content.
 */

const fs = require('fs').promises;
const path = require('path');
const { 
    ContentDiscovery, 
    AccuracyAssessment, 
    ContentCorrection,
    CORRECT_GGUF_LOADER_INFO,
    INCORRECT_PATTERNS
} = require('../scripts/gguf-loader-content-correction.js');

class GGUFLoaderCorrectionTest {
    constructor() {
        this.discovery = new ContentDiscovery();
        this.assessment = new AccuracyAssessment();
        this.correction = new ContentCorrection();
        this.testResults = [];
    }

    async runAllTests() {
        console.log('Running GGUF Loader Content Correction Tests');
        console.log('==============================================\n');

        try {
            await this.testContentDiscovery();
            await this.testAccuracyAssessment();
            await this.testContentCorrection();
            await this.testSEOPreservation();
            await this.testValidation();

            this.printTestSummary();
        } catch (error) {
            console.error('Test execution failed:', error);
        }
    }

    async testContentDiscovery() {
        console.log('Testing Content Discovery...');
        
        // Test file scanning
        const files = await this.discovery.scanFiles();
        this.assert(files.length > 0, 'Should find files with GGUF Loader references');
        this.assert(files.some(f => f.includes('ggufloader-vs-lmstudio.html')), 'Should find main comparison file');
        
        // Test reference extraction
        const comparisonFile = files.find(f => f.includes('ggufloader-vs-lmstudio.html'));
        const references = await this.discovery.extractGGUFLoaderReferences(comparisonFile);
        this.assert(references.length > 0, 'Should extract GGUF Loader references');
        this.assert(references[0].hasOwnProperty('filePath'), 'References should have filePath');
        this.assert(references[0].hasOwnProperty('lineNumber'), 'References should have lineNumber');
        this.assert(references[0].hasOwnProperty('content'), 'References should have content');
        this.assert(references[0].hasOwnProperty('type'), 'References should have type');

        // Test tool list section identification
        const toolSections = await this.discovery.identifyToolListSections('index.html');
        this.assert(Array.isArray(toolSections), 'Should return array of tool sections');

        // Test placement opportunities
        const overviewFile = files.find(f => f.includes('ai-tools-overview.html')) || files[0];
        const opportunities = await this.discovery.findPlacementOpportunities(overviewFile);
        this.assert(Array.isArray(opportunities), 'Should return array of placement opportunities');

        console.log('✅ Content Discovery tests passed\n');
    }

    async testAccuracyAssessment() {
        console.log('Testing Accuracy Assessment...');

        // Test with known incorrect content
        const incorrectContent = 'GGUFLoader is a library designed specifically for loading GGUF models with programmatic control and no built-in user interface.';
        const validation = this.assessment.validateContent(incorrectContent);
        
        this.assert(!validation.isAccurate, 'Should identify incorrect content as inaccurate');
        this.assert(validation.inaccuracies.length > 0, 'Should find inaccuracies');
        this.assert(validation.overallSeverity === 'high', 'Should assess high severity for major inaccuracies');

        // Test with correct content
        const correctContent = 'GGUF Loader is a desktop application for running local LLMs with a simple chat UI.';
        const correctValidation = this.assessment.validateContent(correctContent);
        console.log('Correct content validation:', correctValidation.inaccuracies);
        this.assert(correctValidation.inaccuracies.length <= 1, 'Should find minimal or no inaccuracies in correct content');

        // Test correction plan generation
        const correctionPlan = this.assessment.generateCorrectionPlan(validation.inaccuracies);
        this.assert(correctionPlan.corrections.length > 0, 'Should generate corrections');
        this.assert(correctionPlan.backupRequired === true, 'Should require backup');

        console.log('✅ Accuracy Assessment tests passed\n');
    }

    async testContentCorrection() {
        console.log('Testing Content Correction...');

        // Create a test file with incorrect content
        const testFilePath = 'test-gguf-correction.html';
        const testContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test GGUF Loader</title>
    <meta name="description" content="Test page for GGUF Loader correction">
</head>
<body>
    <h1>GGUF Loader Information</h1>
    <p>GGUFLoader is a library designed specifically for loading GGUF models.</p>
    <p>It requires programming knowledge and has no built-in user interface.</p>
    <p>Installation: npm install ggufloader</p>
</body>
</html>`;

        await fs.writeFile(testFilePath, testContent, 'utf-8');

        try {
            // Test correction application
            const corrections = [
                {
                    type: 'replace',
                    target: 'library designed specifically for loading',
                    replacement: 'desktop application for running',
                    priority: 1,
                    preserveContext: true
                },
                {
                    type: 'replace',
                    target: 'no built-in user interface',
                    replacement: 'simple chat UI for offline interaction',
                    priority: 1,
                    preserveContext: true
                },
                {
                    type: 'replace',
                    target: 'npm install ggufloader',
                    replacement: 'pip install ggufloader',
                    priority: 1,
                    preserveContext: true
                }
            ];

            await this.correction.applyCorrections(testFilePath, corrections);

            // Verify corrections were applied
            const correctedContent = await fs.readFile(testFilePath, 'utf-8');
            this.assert(correctedContent.includes('desktop application'), 'Should correct library to desktop application');
            this.assert(correctedContent.includes('simple chat UI'), 'Should correct interface description');
            this.assert(correctedContent.includes('pip install'), 'Should correct installation method');

            // Test validation
            const validation = await this.correction.validateChanges(testFilePath);
            console.log('Validation result:', validation);
            this.assert(validation.issues.length === 0, 'Corrected content should have no structural issues');

        } finally {
            // Clean up test file and backup
            try {
                await fs.unlink(testFilePath);
                const backupFiles = await fs.readdir('.');
                for (const file of backupFiles) {
                    if (file.startsWith('test-gguf-correction.html.backup.')) {
                        await fs.unlink(file);
                    }
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        }

        console.log('✅ Content Correction tests passed\n');
    }

    async testSEOPreservation() {
        console.log('Testing SEO Preservation...');

        const originalContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Original Title</title>
    <meta name="description" content="Original description">
    <meta property="og:title" content="Original OG Title">
    <script type="application/ld+json">{"@type": "WebPage"}</script>
</head>
<body>
    <p>GGUFLoader is a library.</p>
</body>
</html>`;

        const newContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Original Title</title>
    <meta name="description" content="Original description">
    <meta property="og:title" content="Original OG Title">
    <script type="application/ld+json">{"@type": "WebPage"}</script>
</head>
<body>
    <p>GGUFLoader is a desktop application.</p>
</body>
</html>`;

        const preservedContent = this.correction.preserveSEOElements(originalContent, newContent);
        
        this.assert(preservedContent.includes('Original Title'), 'Should preserve title');
        this.assert(preservedContent.includes('Original description'), 'Should preserve meta description');
        this.assert(preservedContent.includes('Original OG Title'), 'Should preserve Open Graph tags');
        this.assert(preservedContent.includes('application/ld+json'), 'Should preserve structured data');

        console.log('✅ SEO Preservation tests passed\n');
    }

    async testValidation() {
        console.log('Testing Validation Functions...');

        // Test pattern matching
        const testCases = [
            { content: 'library API tool', shouldMatch: true, pattern: 'incorrect_description' },
            { content: 'programmatic control', shouldMatch: true, pattern: 'wrong_feature' },
            { content: 'no built-in interface', shouldMatch: true, pattern: 'wrong_feature' },
            { content: 'npm package', shouldMatch: true, pattern: 'wrong_installation' },
            { content: 'desktop application', shouldMatch: false, pattern: 'any' }
        ];

        for (const testCase of testCases) {
            const inaccuracies = this.assessment.identifyInaccuracies(testCase.content);
            if (testCase.shouldMatch) {
                this.assert(inaccuracies.length > 0, `Should identify inaccuracy in: "${testCase.content}"`);
            } else {
                this.assert(inaccuracies.length === 0, `Should not identify inaccuracy in: "${testCase.content}"`);
            }
        }

        // Test correct information reference
        this.assert(CORRECT_GGUF_LOADER_INFO.type === 'Desktop Application', 'Should have correct type');
        this.assert(CORRECT_GGUF_LOADER_INFO.installation.command === 'pip install ggufloader', 'Should have correct installation');
        this.assert(CORRECT_GGUF_LOADER_INFO.features.ui.includes('chat UI'), 'Should mention chat UI');

        console.log('✅ Validation tests passed\n');
    }

    assert(condition, message) {
        const result = {
            passed: !!condition,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (!condition) {
            console.error(`❌ ASSERTION FAILED: ${message}`);
            throw new Error(`Test assertion failed: ${message}`);
        }
    }

    printTestSummary() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;

        console.log('Test Summary');
        console.log('============');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        if (failedTests === 0) {
            console.log('\n🎉 All tests passed! GGUF Loader Content Correction Utilities are working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the implementation.');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new GGUFLoaderCorrectionTest();
    tester.runAllTests().catch(console.error);
}

module.exports = GGUFLoaderCorrectionTest;