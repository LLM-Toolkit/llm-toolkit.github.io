/**
 * GGUF Loader Content Correction - Usage Example
 * 
 * This example demonstrates how to use the GGUF Loader content correction utilities
 * to identify and fix inaccurate information about GGUF Loader across the website.
 */

const { 
    ContentDiscovery, 
    AccuracyAssessment, 
    ContentCorrection 
} = require('./gguf-loader-content-correction.js');

async function demonstrateUsage() {
    console.log('GGUF Loader Content Correction - Usage Example');
    console.log('===============================================\n');

    const discovery = new ContentDiscovery();
    const assessment = new AccuracyAssessment();
    const correction = new ContentCorrection();

    try {
        // Step 1: Discover files with GGUF Loader content
        console.log('1. Discovering files with GGUF Loader references...');
        const files = await discovery.scanFiles();
        console.log(`   Found ${files.length} files with GGUF Loader content\n`);

        // Step 2: Analyze the main comparison file for demonstration
        const mainFile = files.find(f => f.includes('ggufloader-vs-lmstudio.html'));
        if (mainFile) {
            console.log(`2. Analyzing ${mainFile}...`);
            
            // Extract references
            const references = await discovery.extractGGUFLoaderReferences(mainFile);
            console.log(`   Found ${references.length} GGUF Loader references`);

            // Assess accuracy
            const content = require('fs').readFileSync(mainFile, 'utf-8');
            const validation = assessment.validateContent(content);
            
            console.log(`   Accuracy: ${validation.isAccurate ? 'ACCURATE' : 'NEEDS CORRECTION'}`);
            console.log(`   Inaccuracies found: ${validation.inaccuracyCount}`);
            console.log(`   Overall severity: ${validation.overallSeverity.toUpperCase()}\n`);

            // Show specific inaccuracies
            if (validation.inaccuracies.length > 0) {
                console.log('   Specific issues found:');
                validation.inaccuracies.slice(0, 3).forEach((inaccuracy, index) => {
                    console.log(`   ${index + 1}. ${inaccuracy.type}: "${inaccuracy.currentContent}"`);
                    console.log(`      → Should be: "${inaccuracy.correctContent}"`);
                });
                if (validation.inaccuracies.length > 3) {
                    console.log(`   ... and ${validation.inaccuracies.length - 3} more issues\n`);
                }
            }

            // Generate correction plan
            const correctionPlan = assessment.generateCorrectionPlan(validation.inaccuracies);
            console.log(`3. Generated correction plan:`);
            console.log(`   Corrections needed: ${correctionPlan.corrections.length}`);
            console.log(`   Risk level: ${correctionPlan.riskLevel.toUpperCase()}`);
            console.log(`   Backup required: ${correctionPlan.backupRequired ? 'YES' : 'NO'}`);
            console.log(`   SEO impact: ${correctionPlan.seoImpact.impactLevel.toUpperCase()}\n`);
        }

        // Step 3: Find placement opportunities
        console.log('4. Finding strategic placement opportunities...');
        const opportunities = await discovery.findPlacementOpportunities('index.html');
        console.log(`   Found ${opportunities.length} placement opportunities on homepage`);
        
        opportunities.forEach((opp, index) => {
            console.log(`   ${index + 1}. ${opp.type} (Priority: ${opp.priority})`);
        });

        console.log('\n5. Example correction workflow:');
        console.log('   a) Create backup of original files');
        console.log('   b) Apply corrections with SEO preservation');
        console.log('   c) Validate changes for accuracy and structure');
        console.log('   d) Generate report of all modifications');

        console.log('\n✅ Demonstration complete!');
        console.log('\nTo apply actual corrections, use:');
        console.log('   const corrections = assessment.generateCorrectionPlan(inaccuracies);');
        console.log('   await correction.applyCorrections(filePath, corrections.corrections);');

    } catch (error) {
        console.error('Error during demonstration:', error);
    }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
    demonstrateUsage();
}

module.exports = { demonstrateUsage };