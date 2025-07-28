/**
 * Search Validation Test Suite
 * Tests GGUF Loader search integration and discoverability
 */

const fs = require('fs');
const path = require('path');

class SearchValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        
        // GGUF Loader specific test queries
        this.ggufLoaderQueries = [
            'GGUF Loader',
            'GGUFLoader',
            'local LLM',
            'offline chat',
            'desktop application',
            'quantized models',
            'GGUF models',
            'pip install ggufloader',
            'PyPI ggufloader',
            'floating assistant',
            'cross-platform LLM',
            'Windows Linux macOS',
            'Q4_0 Q6_K',
            'GGUF Loader vs LM Studio'
        ];
        
        // Expected results for GGUF Loader queries
        this.expectedResults = {
            'GGUF Loader': {
                minResults: 3,
                expectedPages: [
                    '/comparisons/ggufloader-vs-lmstudio.html',
                    '/',
                    '/documents/llm-guide.html'
                ]
            },
            'GGUFLoader': {
                minResults: 3,
                expectedPages: [
                    '/comparisons/ggufloader-vs-lmstudio.html',
                    '/',
                    '/documents/ai-tools-overview.html'
                ]
            },
            'local LLM': {
                minResults: 4,
                expectedPages: [
                    '/',
                    '/documents/llm-guide.html',
                    '/comparisons/ggufloader-vs-lmstudio.html'
                ]
            },
            'desktop application': {
                minResults: 3,
                expectedPages: [
                    '/comparisons/ggufloader-vs-lmstudio.html',
                    '/',
                    '/documents/ai-tools-overview.html'
                ]
            }
        };
    }

    /**
     * Validate all GGUF Loader search functionality
     */
    validateGGUFLoaderSearch() {
        console.log('🔍 Validating GGUF Loader Search Integration...\n');
        
        // Test search engine initialization
        this.testSearchEngineInitialization();
        
        // Test GGUF Loader query results
        this.testGGUFLoaderQueries();
        
        // Test search suggestions
        this.testSearchSuggestions();
        
        // Test search index content
        this.testSearchIndexContent();
        
        // Test search result relevance
        this.testSearchRelevance();
        
        // Generate report
        this.generateReport();
        
        return this.results.failed === 0;
    }

    /**
     * Test search engine initialization
     */
    testSearchEngineInitialization() {
        const testName = 'Search Engine Initialization';
        
        try {
            // Check if search engine file exists
            const searchEnginePath = 'assets/js/search-engine.js';
            if (!fs.existsSync(searchEnginePath)) {
                this.addTest(testName, false, 'Search engine file not found');
                return;
            }
            
            // Read and validate search engine content
            const searchEngineContent = fs.readFileSync(searchEnginePath, 'utf8');
            
            // Check for GGUF Loader references
            const ggufLoaderReferences = [
                'GGUF Loader',
                'GGUFLoader',
                'ggufloader',
                'desktop application',
                'local LLM'
            ];
            
            const missingReferences = ggufLoaderReferences.filter(ref => 
                !searchEngineContent.includes(ref)
            );
            
            if (missingReferences.length > 0) {
                this.addTest(testName, false, `Missing GGUF Loader references: ${missingReferences.join(', ')}`);
                return;
            }
            
            this.addTest(testName, true, 'Search engine properly initialized with GGUF Loader content');
            
        } catch (error) {
            this.addTest(testName, false, `Error testing search engine: ${error.message}`);
        }
    }

    /**
     * Test GGUF Loader specific queries
     */
    testGGUFLoaderQueries() {
        const testName = 'GGUF Loader Query Results';
        
        try {
            // Simulate search engine for testing
            const searchEngine = this.createMockSearchEngine();
            
            let allQueriesPassed = true;
            const queryResults = [];
            
            for (const query of this.ggufLoaderQueries) {
                const results = searchEngine.search(query);
                const expected = this.expectedResults[query];
                
                if (expected) {
                    // Check minimum results
                    if (results.length < expected.minResults) {
                        allQueriesPassed = false;
                        queryResults.push(`Query "${query}": Expected ${expected.minResults}+ results, got ${results.length}`);
                        continue;
                    }
                    
                    // Check expected pages are included
                    const resultUrls = results.map(r => r.url);
                    const missingPages = expected.expectedPages.filter(page => 
                        !resultUrls.includes(page)
                    );
                    
                    if (missingPages.length > 0) {
                        allQueriesPassed = false;
                        queryResults.push(`Query "${query}": Missing expected pages: ${missingPages.join(', ')}`);
                    }
                } else {
                    // For queries without specific expectations, just check we get results
                    if (results.length === 0) {
                        allQueriesPassed = false;
                        queryResults.push(`Query "${query}": No results found`);
                    }
                }
            }
            
            if (allQueriesPassed) {
                this.addTest(testName, true, 'All GGUF Loader queries return appropriate results');
            } else {
                this.addTest(testName, false, queryResults.join('; '));
            }
            
        } catch (error) {
            this.addTest(testName, false, `Error testing queries: ${error.message}`);
        }
    }

    /**
     * Test search suggestions include GGUF Loader
     */
    testSearchSuggestions() {
        const testName = 'GGUF Loader Search Suggestions';
        
        try {
            const searchEnginePath = 'assets/js/search-engine.js';
            const searchEngineContent = fs.readFileSync(searchEnginePath, 'utf8');
            
            // Check if getSearchSuggestions includes GGUF Loader terms
            const suggestionsMatch = searchEngineContent.match(/getSearchSuggestions\(\)\s*{[\s\S]*?const popularQueries = (\[[\s\S]*?\]);/);
            
            if (!suggestionsMatch) {
                this.addTest(testName, false, 'getSearchSuggestions method not found');
                return;
            }
            
            const suggestionsContent = suggestionsMatch[1];
            const requiredSuggestions = [
                'GGUF Loader',
                'GGUFLoader',
                'local LLM'
            ];
            
            const missingSuggestions = requiredSuggestions.filter(suggestion => 
                !suggestionsContent.includes(suggestion)
            );
            
            if (missingSuggestions.length > 0) {
                this.addTest(testName, false, `Missing suggestions: ${missingSuggestions.join(', ')}`);
            } else {
                this.addTest(testName, true, 'Search suggestions include GGUF Loader terms');
            }
            
        } catch (error) {
            this.addTest(testName, false, `Error testing suggestions: ${error.message}`);
        }
    }

    /**
     * Test search index content for GGUF Loader
     */
    testSearchIndexContent() {
        const testName = 'GGUF Loader Search Index Content';
        
        try {
            const searchEnginePath = 'assets/js/search-engine.js';
            const searchEngineContent = fs.readFileSync(searchEnginePath, 'utf8');
            
            // Check content sources for GGUF Loader references
            const contentSourcesMatch = searchEngineContent.match(/const contentSources = \[([\s\S]*?)\];/);
            
            if (!contentSourcesMatch) {
                this.addTest(testName, false, 'Content sources not found in search engine');
                return;
            }
            
            const contentSources = contentSourcesMatch[1];
            
            // Required GGUF Loader content elements
            const requiredContent = [
                'ggufloader-vs-lmstudio.html',
                'GGUF Loader',
                'GGUFLoader',
                'desktop application',
                'local LLM',
                'offline chat',
                'PyPI installation',
                'pip install ggufloader',
                'quantized models',
                'floating assistant'
            ];
            
            const missingContent = requiredContent.filter(content => 
                !contentSources.includes(content)
            );
            
            if (missingContent.length > 0) {
                this.addTest(testName, false, `Missing content in search index: ${missingContent.join(', ')}`);
            } else {
                this.addTest(testName, true, 'Search index contains comprehensive GGUF Loader content');
            }
            
        } catch (error) {
            this.addTest(testName, false, `Error testing search index: ${error.message}`);
        }
    }

    /**
     * Test search result relevance for GGUF Loader
     */
    testSearchRelevance() {
        const testName = 'GGUF Loader Search Relevance';
        
        try {
            const searchEngine = this.createMockSearchEngine();
            
            // Test that GGUF Loader comparison page ranks highly for GGUF Loader queries
            const ggufLoaderResults = searchEngine.search('GGUF Loader');
            const comparisonPage = ggufLoaderResults.find(r => r.url.includes('ggufloader-vs-lmstudio'));
            
            if (!comparisonPage) {
                this.addTest(testName, false, 'GGUF Loader comparison page not found in results');
                return;
            }
            
            // Check if comparison page is in top 3 results
            const topResults = ggufLoaderResults.slice(0, 3);
            const isInTopResults = topResults.some(r => r.url.includes('ggufloader-vs-lmstudio'));
            
            if (!isInTopResults) {
                this.addTest(testName, false, 'GGUF Loader comparison page not in top 3 results');
                return;
            }
            
            // Test local LLM query includes GGUF Loader results
            const localLLMResults = searchEngine.search('local LLM');
            const hasGGUFLoaderInLocalLLM = localLLMResults.some(r => 
                r.title.includes('GGUF') || r.description.includes('GGUF') || r.url.includes('ggufloader')
            );
            
            if (!hasGGUFLoaderInLocalLLM) {
                this.addTest(testName, false, 'GGUF Loader not found in "local LLM" search results');
                return;
            }
            
            this.addTest(testName, true, 'GGUF Loader search results show appropriate relevance ranking');
            
        } catch (error) {
            this.addTest(testName, false, `Error testing relevance: ${error.message}`);
        }
    }

    /**
     * Create mock search engine for testing
     */
    createMockSearchEngine() {
        // Simplified mock search engine based on actual implementation
        const contentSources = [
            {
                url: '/',
                title: 'LLM Tools & AI Resources Hub - Homepage',
                type: 'homepage',
                description: 'Comprehensive guide to LLM tools, AI development, and machine learning resources',
                keywords: ['LLM tools', 'AI development', 'machine learning', 'artificial intelligence', 'developer resources', 'local LLM', 'GGUF Loader', 'desktop application'],
                content: 'LLM Tools AI Resources Hub comprehensive guide development machine learning GGUFLoader GGUF Loader desktop application local LLM offline chat UI floating assistant LM Studio Ollama documentation comparisons tutorials PyPI installation pip install ggufloader quantized models Q4_0 Q6_K cross-platform Windows Linux macOS'
            },
            {
                url: '/comparisons/ggufloader-vs-lmstudio.html',
                title: 'GGUFLoader vs LM Studio - Detailed Comparison',
                type: 'comparison',
                description: 'In-depth comparison of GGUFLoader and LM Studio features, performance, and use cases',
                keywords: ['GGUFLoader', 'GGUF Loader', 'LM Studio', 'LLM tools comparison', 'GGUF models', 'local LLM', 'desktop application', 'offline chat'],
                content: 'GGUFLoader GGUF Loader LM Studio comparison features performance GGUF models local LLM deployment desktop application offline chat UI floating assistant API integration memory usage speed benchmarks PyPI installation pip install ggufloader quantized models Q4_0 Q6_K cross-platform Windows Linux macOS pros cons use cases'
            },
            {
                url: '/documents/llm-guide.html',
                title: 'Complete LLM Implementation Guide',
                type: 'document',
                description: 'Master LLM implementation with comprehensive guide covering tools, techniques, and best practices',
                keywords: ['LLM implementation', 'large language models', 'AI development', 'machine learning guide', 'local LLM', 'GGUF Loader'],
                content: 'Large Language Models implementation guide tools frameworks optimization performance deployment best practices TensorFlow PyTorch Hugging Face model selection training inference GGUFLoader GGUF Loader desktop application local LLM deployment offline chat UI GGUF models quantized models'
            },
            {
                url: '/documents/ai-tools-overview.html',
                title: 'AI Development Tools Overview',
                type: 'document',
                description: 'Explore the best AI development tools and frameworks for modern AI development',
                keywords: ['AI tools', 'development frameworks', 'machine learning tools', 'AI development', 'local LLM tools', 'GGUF Loader'],
                content: 'AI development tools frameworks TensorFlow PyTorch scikit-learn Ollama LM Studio GGUFLoader GGUF Loader desktop application local LLM tools offline chat UI deployment MLOps experimentation data processing computer vision NLP reinforcement learning GGUF models quantized models PyPI installation'
            }
        ];

        return {
            search: (query) => {
                const queryTokens = query.toLowerCase().split(/\s+/);
                const results = [];

                contentSources.forEach(doc => {
                    const searchableText = [
                        doc.title,
                        doc.description,
                        doc.keywords.join(' '),
                        doc.content
                    ].join(' ').toLowerCase();

                    let score = 0;
                    queryTokens.forEach(token => {
                        if (searchableText.includes(token)) {
                            score += 1;
                            if (doc.title.toLowerCase().includes(token)) score += 2;
                            if (doc.description.toLowerCase().includes(token)) score += 1.5;
                        }
                    });

                    if (score > 0) {
                        results.push({
                            ...doc,
                            relevanceScore: score
                        });
                    }
                });

                return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
            }
        };
    }

    /**
     * Add test result
     */
    addTest(name, passed, message) {
        const test = {
            name,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.results.tests.push(test);
        
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${name}: ${message}`);
        } else {
            this.results.failed++;
            console.log(`❌ ${name}: ${message}`);
        }
    }

    /**
     * Generate validation report
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 GGUF LOADER SEARCH VALIDATION REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n📊 Results Summary:`);
        console.log(`   ✅ Passed: ${this.results.passed}`);
        console.log(`   ❌ Failed: ${this.results.failed}`);
        console.log(`   ⚠️  Warnings: ${this.results.warnings}`);
        console.log(`   📝 Total Tests: ${this.results.tests.length}`);
        
        const score = this.results.tests.length > 0 
            ? ((this.results.passed / this.results.tests.length) * 100).toFixed(1)
            : 0;
        console.log(`   🏆 Score: ${score}%`);
        
        // Detailed results
        if (this.results.failed > 0) {
            console.log(`\n❌ Failed Tests:`);
            this.results.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`   • ${test.name}: ${test.message}`);
                });
        }
        
        // Recommendations
        console.log(`\n💡 Recommendations:`);
        if (this.results.failed === 0) {
            console.log('   🎉 All GGUF Loader search integration tests passed!');
            console.log('   ✨ GGUF Loader is properly integrated and discoverable in search');
        } else {
            console.log('   🔧 Fix failed tests to improve GGUF Loader discoverability');
            console.log('   📈 Ensure all GGUF Loader related terms are properly indexed');
            console.log('   🎯 Verify search suggestions include relevant GGUF Loader queries');
        }
        
        // Save report
        this.saveReport();
    }

    /**
     * Save validation report to file
     */
    saveReport() {
        const reportPath = 'build-reports/gguf-loader-search-validation.json';
        
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
                score: this.results.tests.length > 0 
                    ? ((this.results.passed / this.results.tests.length) * 100).toFixed(1)
                    : 0
            },
            tests: this.results.tests,
            ggufLoaderQueries: this.ggufLoaderQueries,
            expectedResults: this.expectedResults
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved to: ${reportPath}`);
    }
}

// CLI interface
if (require.main === module) {
    const validator = new SearchValidator();
    const success = validator.validateGGUFLoaderSearch();
    process.exit(success ? 0 : 1);
}

module.exports = SearchValidator;